const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { createPoolCluster } = require("mysql")
const Timer = require("./timer")

const ordinals = {
    1: 'First',
    2: 'Second',
    3: 'Third',
    4: 'Fourth',
    5: 'Fifth'
}
const customIds = {
    POLL: 'poll',
    TITLE: 'title',
    DESCRIPTION: 'description',
    CHOICES: 'choices',
    DURATION: 'duration',
    INIT: 'init',
    SETUP: 'setup',
    CREATE: 'create',
    VOTE: 'vote',
    VOTES: 'votes',
    INTERACTION: 'interaction',
    ACCEPT: 'accept',
    CANCEL: 'cancel',
    COUNT: 'count',
    NAME: 'name',
}
const theme = 0xF4CECE

let polls = {}
// Schematic for polls dictionary
/*
title: {
    description: String
    votes: {
        discordUserId: choiceNumber
        ...
    }
    choices: {
        1: {
            name: String
            count: int
        }
        ... <=5 choices
    }
    interaction: priorInteraction
}
*/

const init = (client) => {
    client.on("interactionCreate", async (interaction) => {
        
        // Interactions follow the 
        // poll|title|action|argument
        // structure.
        //
        // poll|title is required.
        if (!(interaction.isModalSubmit() || interaction.isButton()) || !(interaction.customId.startsWith(customIds.POLL))) { return }
        let action = interaction.customId.split('|')[2]
        switch (action) {
            case customIds.INIT:
                initMenu(interaction)
                break
            case customIds.SETUP:
                requestChoiceInputs(interaction)
                break
            case customIds.CREATE:
                createPoll(interaction)
                break
            case customIds.VOTE:
                castVote(interaction)
                break
        }
    })
}

const run = async (client, interaction) => {
    // Collect options from command interaction
    const { options } = interaction
    const pollTitle = options.getString(customIds.TITLE)
    const pollDescription = options.getString(customIds.DESCRIPTION)
    const choiceQuantity = options.getInteger(customIds.CHOICES)

    // Fail-case for invalid time input
    let pollDurationMillis
    try {
        pollDurationMillis = Timer.stringToMilis(options.getString(customIds.DURATION))
    } catch (invalidTimeFormat) {
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle("Invalid Time Format")
        .setDescription(`Your input: \`${options.getString(customIds.DURATION)}\` is the wrong format, please use the hint and try again.`)
        interaction.reply( { embeds: [embed] } )
        return
    }

    // Disallow creation of a second poll with the same title
    if (pollTitle in polls) {
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle("Title Unavailable")
        .setDescription(`A poll titled ${pollTitle} already exists, please provide a different name or end the existing poll.`)
        interaction.reply( { embeds: [embed] } )
        return
    }

    // Register this poll with poll dictionary
    polls[pollTitle] = {
        description: pollDescription,
        duration: pollDurationMillis,
        votes: {},
        choices: {}
    }
    for (let i = 1; i <= choiceQuantity; i++) {
        polls[pollTitle]['choices'][i] = {}
    }

    // Create and show modal for description input
    let modal = new ModalBuilder()
    .setTitle('Create Poll')
    .setCustomId(`${customIds.POLL}|${pollTitle}|${customIds.INIT}`)
    modal.addComponents(new ActionRowBuilder()
        .addComponents(new TextInputBuilder()
            .setCustomId(customIds.DESCRIPTION)
            .setLabel(`Poll Description`)
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(4000)
        )
    )
    interaction.showModal(modal)
}

function initMenu(interaction) {
    const pollTitle = interaction.customId.split('|')[1]

    // Case where poll is removed from the register whilest the creation menu is still up.
    if (!(pollTitle in polls)) {
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle('Poll Creation Failed')
        .setDescription('This poll was removed from the cache while you were creating it, please try again.')
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }

    // Register description and ephemeral interaction menu with this poll
    const choices = interaction.fields
    const description = choices.getTextInputValue(customIds.DESCRIPTION)
    polls[pollTitle][customIds.DESCRIPTION] = description
    polls[pollTitle][customIds.INTERACTION] = interaction

    // Setup and send ephemeral menu for setting up poll choices or canceling
    let options = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId(`${customIds.POLL}|${pollTitle}|${customIds.SETUP}|${customIds.ACCEPT}`)
        .setLabel('Setup Choices')
        .setStyle(ButtonStyle.Success)
    ).addComponents(
        new ButtonBuilder()
        .setCustomId(`${customIds.POLL}|${pollTitle}|${customIds.SETUP}|${customIds.CANCEL}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    )
    let embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Poll Creation`)
    .setDescription(`Setup choices for poll or click cancel`)
    interaction.reply( {
        embeds: [embed],
        components: [options],
        ephemeral: true
    } )
}

async function requestChoiceInputs(interaction) {
    const pollTitle = interaction.customId.split('|')[1]

    // Case where poll is removed from the register whilest the creation menu is still up.
    if (!(pollTitle in polls)) {
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle('Poll Creation Failed')
        .setDescription('This poll was removed from the cache, you may dismiss the previous message.')
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }

    // Cancel button case for choices menu, respond and delete poll from register
    const isCanceled = interaction.customId.split('|')[3] == 'cancel'
    let ephemeralInteraction = polls[pollTitle][customIds.INTERACTION]
    if (isCanceled) {
        interaction.deferUpdate()
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle(`Poll Canceled`)
        .setDescription(`You canceled creation of this poll.`)
        ephemeralInteraction.editReply({
            embeds: [embed],
            components: [],
            ephemeral: true
        })
        delete polls[pollTitle]
        return
    }

    // Dynamically create modal for poll choices and then show it; Update the ephemeral menu to indicate in-progress
    const choiceQuantity = Object.keys(polls[pollTitle][customIds.CHOICES]).length
    let modal = new ModalBuilder()
    .setTitle('Create Poll')
    .setCustomId(`${customIds.POLL}|${pollTitle}|${customIds.CREATE}`)
    for (let i = 1; i <= choiceQuantity; i++) {
        modal.addComponents(new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId(i.toString())
                .setLabel(` ${ordinals[i]} choice`)
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(20)
            )
        )
    }
    let embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Setup Selected`)
    .setDescription(`Setup in progress...`)
    ephemeralInteraction.editReply({
        embeds: [embed],
        components: [],
        ephemeral: true
    })
    interaction.showModal(modal)
}

async function createPoll(interaction) {
    const pollTitle = interaction.customId.split('|')[1]

    // Case where poll is removed from the register whilest the creation menu is still up.
    if (!(pollTitle in polls)) {
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle('Poll Creation Failed')
        .setDescription('This poll was removed from the cache while you were creating it, please try again.')
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }
    
    // Declare variables to create the poll with
    const pollDescription = polls[pollTitle][customIds.DESCRIPTION]
    const pollDurationMillis = polls[pollTitle][customIds.DURATION]
    const choicesList = interaction.fields.fields

    // Edit ephemeral menu to communicate to the user that the poll was successfully created
    let ephemeralInteraction = polls[pollTitle][customIds.INTERACTION]
    let embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Poll Creation Complete`)
    .setDescription(`You may now dismiss this message.`)
    ephemeralInteraction.editReply({
        embeds: [embed],
        ephemeral: true
    })

    // Register choice data with the poll and create buttons for each one for voting purposes
    let choices = new ActionRowBuilder()
    polls[pollTitle][customIds.CHOICES] = {}
    for (const choice of choicesList) {
        const choiceId = choice[0]
        const choiceName = choice[1].value
        polls[pollTitle][customIds.CHOICES][choiceId] = {
            name: choiceName,
            count: 0
        }

        choices.addComponents(
            new ButtonBuilder()
            .setCustomId(`${customIds.POLL}|${pollTitle}|${customIds.VOTE}|${choiceId}`)
            .setLabel(choiceName)
            .setStyle(ButtonStyle.Primary)
        )
    }

    // Create poll embed and send it in a new message for cleanliness 
    embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Poll: ${pollTitle}`)
    .setDescription(`\`\`\`${pollDescription}\`\`\``)
    .setFooter({
        text: `Poll Ends:`
    })
    .setTimestamp(Date.now() + pollDurationMillis)
    interaction.deferUpdate()
    let message = await interaction.channel.send({
        embeds: [embed],
        components: [choices]
    })

    // Set function for when the poll timer completes
    setTimeout(pollCompleted, pollDurationMillis, pollTitle, message)
}

function castVote(interaction) {
    const args = interaction.customId.split('|')
    const pollTitle = args[1]

    // Fail-case for when a vote interaction is triggered for a poll that does not currently exist
    if (!(pollTitle in polls)) {
        interaction.message.delete()
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle('Vote Failed')
        .setDescription('This poll is no longer active.')
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }

    const choiceId = args[3]
    const voterId = interaction.user.id
    let poll = polls[pollTitle]

    // When a user hasn't cast a vote already or has removed their vote
    if (!(voterId in poll[customIds.VOTES])) {
        poll[customIds.CHOICES][choiceId][customIds.COUNT]++
        poll[customIds.VOTES][voterId] = choiceId
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle(`Vote Cast`)
        .setDescription(`You voted for **${poll[customIds.CHOICES][choiceId][customIds.NAME]}**`)
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }

    const oldVoteId = poll['votes'][voterId]
    const sameVote = oldVoteId == choiceId

    // When a user wants to change an existing vote to a new vote
    if (!sameVote) {
        poll[customIds.CHOICES][oldVoteId][customIds.COUNT]--
        poll[customIds.CHOICES][choiceId][customIds.COUNT]++
        poll[customIds.VOTES][voterId] = choiceId
        let embed = new EmbedBuilder()
        .setColor(theme)
        .setTitle(`Vote Changed`)
        .setDescription(`You changed your vote to **${poll[customIds.CHOICES][choiceId][customIds.NAME]}**`)
        interaction.reply( { embeds: [embed], ephemeral: true } )
        return
    }

    // When a user wants to remove their vote by clicking the same choice as they had before
    poll[customIds.CHOICES][oldVoteId][customIds.COUNT]--
    delete poll[customIds.VOTES][voterId]
    let embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Vote Removed`)
    .setDescription(`You have removed your vote.`)
    interaction.reply( { embeds: [embed], ephemeral: true } )
    return
}

function pollCompleted(pollTitle, message) {

    // Algorithmically find the winner(s) of the poll, prepare variables for the results embed
    let poll = polls[pollTitle]
    let winningChoices = []
    let winningCount
    let choicesField = ``
    let totalsField = ``
    for ([choiceId, choice] of Object.entries(poll[customIds.CHOICES])) {
        const choiceName = choice[customIds.NAME]
        const choiceCount = choice[customIds.COUNT]
        choicesField += `\n${choiceName}`
        totalsField += `\n${choiceCount} vote`
        if (choiceCount != 1) { totalsField += `s` }

        if (winningChoices.length == 0) {
            winningChoices.push(choiceId)
            winningCount = choiceCount
            continue
        }
        if (winningCount < choiceCount) {
            winningChoices.length = 0
            winningChoices.push(choiceId)
            winningCount = choiceCount
            continue
        }
        if (winningCount == choiceCount) {
            winningChoices.push(choiceId)
            continue
        }
    }
    let winningNames = []
    winningChoices.forEach(winner => winningNames.push(poll[customIds.CHOICES][winner][customIds.NAME]))
    let winnerMessage = winningNames.join(', ')
    let winnerName = winningChoices.length == 1 ? 'Winner:' : `Winners (${winningChoices.length}-way tie): `

    // Prepare and send embed for poll results. Finally, remove this poll from the register
    let embed = new EmbedBuilder()
    .setColor(theme)
    .setTitle(`Poll Results: ${pollTitle}`)
    .setDescription(`\`\`\`${poll[customIds.DESCRIPTION]}\`\`\``)
    .addFields([
        {
            name: winnerName,
            value: `\`\`\`${winnerMessage}\`\`\``
        }, {
            name: `Choices:`,
            value: `\`\`\`${choicesField}\`\`\``,
            inline: true
        }, {
            name: `Totals:`,
            value: `\`\`\`${totalsField}\`\`\``,
            inline: true
        }
    ])
    .setFooter({
        text: `Poll Ended:`
    })
    .setTimestamp()
    message.edit({
        embeds: [embed],
        components: []
    })
    delete polls[pollTitle]
}

module.exports = {
    name: 'poll',
    description: 'Creates a poll',
    options: [{
            name: customIds.TITLE,
            description: 'Title of your poll.',
            type: 3, //String
            min_value: 1,
            max_value: 20,
            required: true
        }, {
            name: customIds.CHOICES,
            description: 'Quantity of choices the poll has. (2-5 choices)',
            type: 4, //Integer
            min_value: 2,
            max_value: 5,
            required: true
        }, {
            name: customIds.DURATION,
            description: 'eg: 1w 2d 3h 4m 5s',
            type: 3, //String
            required: true
        }],
    init,
    run
}