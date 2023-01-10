const { EmbedBuilder } = require("discord.js")

const run = async (client, interaction) => {
    const guild = client.guilds.cache.get(process.env.GUILDID)
    const user = guild.members.cache.get(interaction.user.id)
    const isInVoice = user.voice.channel

    let embed = new EmbedBuilder()
    embed.setColor(0xF4CECE)

    if (!isInVoice) {
        embed
        .setDescription('**You must be in a voice channel to perform this command.**')
        interaction.reply( {embeds: [embed]} )
        return
    }
    var t0 = performance.now()
    let attachment = interaction.options.getAttachment('image')
    var ocr = require('../ocr')
    let inGameList = await ocr.getInGame(attachment.url)
    
    let vc = client.channels.cache.get(user.voice.channel.id)
    const inDiscordList = vc.members.map(member => member.displayName.toLowerCase())

    const crashersList = inGameList.filter(obj => inDiscordList.indexOf(obj) === -1)
    const raidersCount = inGameList.length
    const crashersCount = crashersList.length

    let kickString = "/kick"
    crashersList.forEach(buildKickString)
    function buildKickString(user) {
        kickString += " " + user
    }

    var t1 = performance.now()
    let deltaSeconds = ((t1-t0) / 1000).toFixed(2)

    embed
    .setTitle("__Parse for " + user.user.username + "__")
    .setDescription("**Raiders Found : " + raidersCount + "\nCrashers: " + crashersCount + "**\n```" + kickString + "```")
    .setImage(attachment.url)
    .setFooter({
        text: "Parse took " + deltaSeconds + " seconds"
    })

    interaction.reply( {embeds: [embed]} )
    
}

const init = (client) => {}

module.exports = {
    name: 'parse',
    description: 'Parses the channel you are in from a /who screenshot.',
    options: [{
        name: 'image',
        description: 'who to parse',
        type: 11, //File
        required: true
    }],
    init,
    run
}