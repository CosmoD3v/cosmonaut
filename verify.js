const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const puppeteer = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(pluginStealth())
const {executablePath} = require('puppeteer')

const customIds = {
    SUBMIT: 'verify-submit-button',
    CANCEL: 'verify-cancel-button'
}
const THEME = 0xF4CECE
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const statusImage = {
    FAILED: 'https://media.tenor.com/8rq3UZrZeosAAAAd/spy-x-family-anya-forger.gif',
    IN_PROGRESS: 'https://media.tenor.com/wh94OsEUJz8AAAAC/anime-chips.gif',
    CANCELED: 'https://media.tenor.com/jS6MuB3R7OwAAAAC/hatsune-miku-crying.gif',
    SUCCESSFUL: 'https://media.tenor.com/j76vM3i122kAAAAd/hololive-vtuber.gif'
}
const status = {
    NEW_TICKET: new EmbedBuilder()
    .setColor(THEME)
    ,
    CANCEL_TICKET: new EmbedBuilder()
    .setColor(THEME)
    .setTitle("Verification Request Canceled")
    .setImage(statusImage.CANCELED)
    ,
    DUPLICATE_TICKET: new EmbedBuilder()
    .setColor(THEME)
    .setTitle("Ticket already in progress")
    .setDescription("```Please complete or cancel previous ticket" +
    "\nbefore creating another one.```")
    ,
    IN_PROGRESS: new EmbedBuilder()
    .setColor(THEME)
    .setTitle("Verification in progress...")
    .setDescription("Please allow up to a minute as RealmEye refreshes 💜")
    .setImage(statusImage.IN_PROGRESS)
    .setTimestamp(Date.now())
    ,
    FAILED: new EmbedBuilder()
    .setColor(THEME)
    .setTitle("Verification Request Failed")
    .setImage(statusImage.FAILED)
    ,
    SUCCESSFUL: new EmbedBuilder()
    .setColor(THEME)
    .setTitle("Verification Successful!")
    .setImage(statusImage.SUCCESSFUL)
    ,
    ACTIONS: new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setCustomId(customIds.SUBMIT)
    .setLabel('✅ Submit')
    .setStyle(ButtonStyle.Success)
    ).addComponents(
    new ButtonBuilder()
    .setCustomId(customIds.CANCEL)
    .setLabel('❌ Cancel')
    .setStyle(ButtonStyle.Danger)
    )
}
var hasInitialized = false
var verifyRequests = {}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const init = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton() || !(interaction.customId === customIds.SUBMIT)) {
            if (interaction.customId === customIds.CANCEL) {
                cancelTicket(interaction)
            }
            return
        }
        submitTicket(client, interaction)
    })
}

async function createTicket(interaction) {
    const userID = interaction.user.id
    const userName = interaction.options.getString('ign')
    // Disallow user to create duplicate ticket, they must cancel or complete the other before creating a new one
    if (userID in verifyRequests) {
        interaction.reply({
            embeds: [status.DUPLICATE_TICKET],
            components: [],
            ephemeral: true
        })
        return
    }

    // Create ticket for new verify request
    const verifyKey = 'ARIGATO+' + generateString(10)
    await interaction.reply({
        embeds: [status.NEW_TICKET
            .setTitle('Verify request for ' + userName)
            .setDescription('Place this key somewhere in your Realmeye description.' + 
            '\n**```' + verifyKey + '```**' +
            '\n\n__Click the ✅ once you have finished.__')],
        components: [ status.ACTIONS ],
        ephemeral: true
    })
    // Creates a record for this ticket for the button interaction to recognise and deal with later
    verifyRequests[userID] = {
        "name": userName,
        "key": verifyKey,
        "interaction": interaction
    }
    console.log(verifyRequests)
}

function cancelTicket(interaction) {
    const discordUserID = interaction.user.id
    let originalInteraction = verifyRequests[discordUserID]["interaction"]
    delete verifyRequests[discordUserID]
    originalInteraction.editReply({
        embeds: [status.CANCEL_TICKET],
        components: [],
        ephemeral: true
    })
    console.log(verifyRequests)
}

async function submitTicket(client, interaction) {
    const guild = client.guilds.cache.get(process.env.GUILDID)
    const discordUserID = interaction.user.id
    const user = guild.members.cache.get(interaction.user.id)
    let userTag = interaction.user.tag
    let originalInteraction = verifyRequests[discordUserID]["interaction"] //error reading interaction? botan

    // Begin web-scraping Realmeye
    originalInteraction.editReply({
        embeds: [status.IN_PROGRESS],
        components: [],
        ephemeral: true
    })
    console.log("Starting verify request for " + userTag)
    let verifiable = await canVerify(discordUserID)
    let requestedName = verifyRequests[discordUserID]["name"]
    delete verifyRequests[discordUserID]

    // Case where scraper failed to verify the user
    if (!verifiable) {
        originalInteraction.editReply({
            embeds: [status.FAILED],
            components: [],
            ephemeral: true
        })
        return
    }

    // Verification was successful, give them discord role and IGN nickname
    
    originalInteraction.editReply({
        embeds: [status.SUCCESSFUL],
        components: [],
        ephemeral: true
    })
    let role = guild.roles.cache.find(role => role.id === '1030347463728570389')
    user.roles.add(role)
    user.setNickname(requestedName).catch( () => {
        console.log("Failure to change nickname for " + userTag + "!")
        return
        // Deal with error to change nickname
    })
    console.log("Successful verification for " + userTag + "!")
    // Deal with success
        
}

const timeoutDelete = async (interaction) => {
    setTimeout( () => interaction.deleteReply(), 1000 )
}

function generateString(length) {
    let result = ''
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return result
}

async function canVerify(userID) {
    let browser = await puppeteer.launch({
        executablePath: executablePath(),
        headless: true
    })
    let page = await browser.newPage()

    let verifySuccessful
    let attempts = 0
    try {
        while(true) {
            await page.goto("https://www.realmeye.com/player/" + verifyRequests[userID]["name"])

            let description = ''

            let [el0] = await page.$x('//*[@id="d"]/div[1]')
            let txt0 = await el0.getProperty('textContent')
            description += await txt0.jsonValue()

            let [el1] = await page.$x('//*[@id="d"]/div[2]')
            let txt1 = await el1.getProperty('textContent')
            description += await txt1.jsonValue()

            let [el2] = await page.$x('//*[@id="d"]/div[3]')
            let txt2 = await el2.getProperty('textContent')
            description += await txt2.jsonValue()

            verifySuccessful = description.includes(verifyRequests[userID]["key"])
            if (verifySuccessful) { break }
            if (attempts >= 2) { break }
            attempts++
            await sleep(20000)
        }
    } catch (err) {
        console.log(err) // Type error when searching for a user page that doesn't exist
        verifySuccessful = false
    }

    await page.close()
    await browser.close()
    return verifySuccessful
}

const run = async (client, interaction) => {
    createTicket(interaction)
}

module.exports = {
    name: 'verify',
    description: 'Verifies your RotMG account.',
    options: [{
        name: 'ign',
        description: 'Your name',
        type: 3, //String
        required: true
    }],
    init,
    run
}