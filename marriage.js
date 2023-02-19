var database = require('../handlers/database')
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require("discord.js")

const proposalsSchema = `proposals(id INTEGER PRIMARY KEY, couple TEXT type UNIQUE NOT NULL, proposer TEXT NOT NULL, proposee TEXT NOT NULL, time TEXT NOT NULL)`
const marriagesSchema = `marriages(id INTEGER PRIMARY KEY, couple TEXT NOT NULL, proposer TEXT NOT NULL, proposee TEXT NOT NULL, start TEXT NOT NULL, end TEXT, UNIQUE(couple, start))`
const SUBGROUPS = {
    LIST: 'list'
}
const SUBCOMMANDS = {
    PROPOSE: 'propose',
    REVOKE: 'revoke',
    ACCEPT: 'accept',
    DECLINE: 'decline',
    DIVORCE: 'divorce',
    PROPOSALS: 'proposals',
    MARRIAGES: 'marriages'
}
const RESPONSES = {

    get PROPOSE_TO_SELF() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Marriage Proposal Failed 🚫")
        .setDescription("I understand you're lonely, but you can't propose to yourself...")
    },
    PROPOSE_BUT_ALREADY_MARRIED(proposeeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Marriage Proposal Failed 🚫")
        .setDescription(`You and ${proposeeUser} are already happily married!` +
        `\n\n Do you have dementia!?`)
    },
    PROPOSAL_ALREADY_EXISTS(proposeeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Marriage Proposal Failed 🚫")
        .setDescription(`**You and ${proposeeUser} already have a pending proposal.**` +
        `\n\nIt must be accepted, denied, or revoked before making another to the same user.`)
    },
    PROPOSAL_SUCCESSFUL(proposeeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("💜 Marriage Proposal Sent! 💜")
        .setDescription(`You have proposed to ${proposeeUser}, awwhh!` +
        `\n\nThey may choose to accept/deny your proposal or you can revoke it if this was a mistake.`)
    },


    get REVOKE_TO_SELF() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Revoke Failed 🚫")
        .setDescription("You can't revoke a marriage proposal with yourself, DUMMY!")
    },
    REVOKE_NONEXISTENT_PROPOSAL(revokeeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Revoke Failed 🚫")
        .setDescription(`You have not proposed to ${revokeeUser}.`)
    },
    get REVOKE_UNOWNED_PROPOSAL() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Revoke Failed 🚫")
        .setDescription(`You cannot revoke a proposal someone else sent.`)
    },
    REVOKE_SUCCESSFUL(revokeeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("✅ Proposal Revoked ✅")
        .setDescription(`You have revoked your marriage proposal to ${revokeeUser}. Awkwarrrrd...`)
    },


    get ACCEPT_TO_SELF() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Accept Failed 🚫")
        .setDescription("You can't accept a marriage proposal with yourself!")
    },
    ACCEPT_NONEXISTENT_PROPOSAL(accepteeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Accept Failed 🚫")
        .setDescription(`${accepteeUser} has not proposed to you.`)
    },
    get ACCEPT_OWN_PROPOSAL() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Accept Failed 🚫")
        .setDescription(`You cannot accept your own proposal!` +
        `\n\nStop being so desperate... it's kinda pathetic.`)
    },
    ACCEPT_SUCCESSFUL(accepterUser, accepteeUser) {
        return embed = new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("💖 Proposal Accepted 💖")
        .setDescription(`${accepterUser} has married ${accepteeUser}` +
        `\n\nCongratulations you two lovebirds!!`)
    },


    get DECLINE_TO_SELF() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Decline Failed 🚫")
        .setDescription(`You can't decline a marriage proposal with yourself!` +
        `\n\nYou are being awfully cruel to yourself.`)
    },
    DECLINE_NONEXISTENT_PROPOSAL(declineeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Decline Failed 🚫")
        .setDescription(`${declineeUser} has not proposed to you.` +
        `\n\nYou seem very eager to shut someone down...`)
    },
    get DECLINE_OWN_PROPOSAL() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Proposal Decline Failed 🚫")
        .setDescription(`You cannot decline your own proposal, try revoking your proposal instead.`)
    },
    DECLINE_SUCCESSFUL(declinerUser, declineeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("💔 Proposal Declined 💔")
        .setDescription(`Sorry ${declineeUser}, ${declinerUser} shot you down!💔` +
        `\n\n*plays you the world's smallest violin*🎻`)
    },


    get DIVORCE_TO_SELF() {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Divorce Failed 🚫")
        .setDescription(`You can't divorce yourself!`)
    },
    DIVORCE_NONEXISTENT_MARRIAGE(divorceeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Divorce Failed 🚫")
        .setDescription(`You aren't married to ${divorceeUser}!`)
    },
    DIVORCE_ALREADY_SEPARATED(divorceeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("🚫 Divorce Failed 🚫")
        .setDescription(`You and ${divorceeUser} are already divorced!`)
    },
    DIVORCE_SUCCESSFUL(divorceeUser) {
        return new EmbedBuilder()
        .setColor(process.env.THEME)
        .setTitle("💔 Divorce Confirmed 💔")
        .setDescription(`You and ${divorceeUser} are now divorced!` +
        `\n\nForever alone...`)
    },
}
const DIAMOND_RING = new AttachmentBuilder('./assets/ring.png')
const LOVE = new AttachmentBuilder('./assets/love.png')

async function propose(interaction) {
    const { options } = interaction
    const proposerUser = interaction.user
    const proposeeUser = options.getUser('user')
    let couple = coupleIds(proposerUser.id, proposeeUser.id)

    // proposerUser tries to propose to themselves
    if (proposerUser.id == proposeeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.PROPOSE_TO_SELF] } )
        return
    }
    
    // proposerUser has already been married to proposeeUser
    let alreadyMarried = await database.exists(marriagesSchema, 'couple', couple)
    if (alreadyMarried) {
        let currentlyMarried = (await database.selectAndOrder(marriagesSchema, 'end', ['couple'], [couple], 'start')).reverse()[0]['end'] == null ? true : false
        // proposerUser is also currently still married, not divorced from proposeeUser
        if (currentlyMarried) {
            interaction.followUp( { embeds: [RESPONSES.PROPOSE_BUT_ALREADY_MARRIED(proposeeUser)] } )
            return
        }
    }

    // proposerUser tries to create duplicate proposal
    let proposalAlreadyExists = await database.exists(proposalsSchema, 'couple', couple)
    if (proposalAlreadyExists) {
        interaction.followUp( { embeds: [RESPONSES.PROPOSAL_ALREADY_EXISTS(proposeeUser)] } )
        return
    }

    // proposerUser sucessfully proposes to proposeeUser
    await database.insert('proposals(couple, proposer, proposee, time)', [couple, proposerUser.id, proposeeUser.id, Date.now().toString()])
    interaction.followUp( { embeds: [RESPONSES.PROPOSAL_SUCCESSFUL(proposeeUser)] } )
}

async function revoke(interaction) {
    const { options } = interaction
    const revokerUser = interaction.user
    const revokeeUser = options.getUser('user')
    let couple = coupleIds(revokerUser.id, revokeeUser.id)

    // revokerUser tries to revoke themselves
    if (revokerUser.id == revokeeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.REVOKE_TO_SELF] } )
        return
    }

    // revokerUser tries to revoke a proposal that doesn't exist
    let proposalDoesntExist = !(await database.exists(proposalsSchema, 'couple', couple))
    if (proposalDoesntExist) {
        interaction.followUp( { embeds: [RESPONSES.REVOKE_NONEXISTENT_PROPOSAL(revokeeUser)] } )
        return
    }

    // revokerUser tries to revoke a proposal that revokeeUser sent to them
    let proposerId = (await database.select(proposalsSchema, 'proposer', 'couple', couple))[0]['proposer']
    if (proposerId != revokerUser.id) {
        interaction.followUp( { embeds: [RESPONSES.REVOKE_UNOWNED_PROPOSAL] } )
        return
    }

    // revokerUser revokes their proposal to revokeeUser
    await database.remove(proposalsSchema, 'couple', couple)
    interaction.followUp( { embeds: [RESPONSES.REVOKE_SUCCESSFUL(revokeeUser)] } )
}

async function accept(interaction) {
    const { options } = interaction
    const accepterUser = interaction.user
    const accepteeUser = options.getUser('user')
    let couple = coupleIds(accepterUser.id, accepteeUser.id)

    // accepterUser tries to accept themselves in marriage
    if (accepterUser.id == accepteeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.ACCEPT_TO_SELF] } )
        return
    }

    // accepterUser tries to accept a proposal that doesn't exist
    let proposalDoesntExist = !(await database.exists(proposalsSchema, 'couple', couple))
    if (proposalDoesntExist) {
        interaction.followUp( { embeds: [RESPONSES.ACCEPT_NONEXISTENT_PROPOSAL(accepteeUser)] } )
        return
    }

    // accepterUser tries to accept their proposal on behalf of accepteeUser
    let proposeeId = (await database.select(proposalsSchema, 'proposee', 'couple', couple))[0]['proposee']
    if (proposeeId == accepteeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.ACCEPT_OWN_PROPOSAL] } )
        return
    }

    // accepterUser accepts accepteeUser's proposal, they are married now
    await database.remove(proposalsSchema, 'couple', couple)
    await database.insert('marriages(couple, proposer, proposee, start)', [couple, accepteeUser.id, accepterUser.id, Date.now().toString()])
    interaction.followUp( { embeds: [RESPONSES.ACCEPT_SUCCESSFUL(accepterUser, accepteeUser)] } )
}

async function decline(interaction) {
    const { options } = interaction
    const declinerUser = interaction.user
    const declineeUser = options.getUser('user')
    let couple = coupleIds(declinerUser.id, declineeUser.id)

    // declinerUser tries to decline themselves in marriage
    if (declinerUser.id == declineeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.DECLINE_TO_SELF] } )
        return
    }

    // declinerUser tries to decline a proposal that doesn't exist
    let proposalDoesntExist = !(await database.exists(proposalsSchema, 'couple', couple))
    if (proposalDoesntExist) {
        interaction.followUp( { embeds: [RESPONSES.DECLINE_NONEXISTENT_PROPOSAL(declineeUser)] } )
        return
    }

    // declinerUser tries to decline their proposal on behalf of declineeUser
    let proposeeId = (await database.select(proposalsSchema, 'proposee', 'couple', couple))[0]['proposee']
    if (proposeeId == declineeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.DECLINE_OWN_PROPOSAL] } )
        return
    }

    // declinerUser declines declineeUser's proposal
    await database.remove(proposalsSchema, 'couple', couple)
    interaction.followUp( { embeds: [RESPONSES.DECLINE_SUCCESSFUL(declinerUser, declineeUser)] } )
}

async function divorce(interaction) {
    const { options } = interaction
    const divorcerUser = interaction.user
    const divorceeUser = options.getUser('user')
    let couple = coupleIds(divorcerUser.id, divorceeUser.id)

    // divorcerUser tries to divorce themselves
    if (divorcerUser.id == divorceeUser.id) {
        interaction.followUp( { embeds: [RESPONSES.DIVORCE_TO_SELF] } )
        return
    }

    // divorcerUser tries to divorce someone they are not married with
    let marriageDoesntExist = !(await database.exists(marriagesSchema, 'couple', couple))
    if (marriageDoesntExist) {
        interaction.followUp( { embeds: [RESPONSES.DIVORCE_NONEXISTENT_MARRIAGE(divorceeUser)] } )
        return
    }

    // divorcerUser tries to divorce divorceeUser although they are already separated
    let alreadyDivorced = (await database.select(marriagesSchema, 'end', 'couple', couple)).reverse()[0]['end'] != null ? true : false
    if (alreadyDivorced) {
        interaction.followUp( { embeds: [RESPONSES.DIVORCE_ALREADY_SEPARATED(divorceeUser)] } )
        return
    }

    // divorcerUser divorces divorceeUser, they are now separated
    let startTime = (await database.select(marriagesSchema, 'start', 'couple', couple)).reverse()[0]['start']
    await database.update(marriagesSchema, 'end', Date.now().toString(), 'start', startTime)
    interaction.followUp( { embeds: [RESPONSES.DIVORCE_SUCCESSFUL(divorceeUser)] } )
}

async function listproposals(client, interaction) {
    const { options } = interaction
    const commandUser = options.getUser('user')
    const targetUser = commandUser == null ? interaction.user : commandUser
    let proposalsData = await database.selectAndOrder(proposalsSchema, 'proposer, proposee, time', ['proposer', 'proposee'], [targetUser.id, targetUser.id], 'id')

    createProposalList(client, interaction, targetUser, proposalsData, 1)
}

async function listmarriages(client, interaction) {
    const { options } = interaction
    const commandUser = options.getUser('user')
    const targetUser = commandUser == null ? interaction.user : commandUser
    let marriageData = await database.selectAndOrder(marriagesSchema, 'proposer, proposee, start, end', ['proposer', 'proposee'], [targetUser.id, targetUser.id], 'start')

    createMarriageList(client, interaction, targetUser, marriageData, 1)
}

async function createProposalList(client, interaction, user, data, page) {
    let userId = user.id
    let userName = user.username
    let startIndex = (page - 1) * 10
    let endIndex = startIndex + 9
    let description = ``
    
    for (let i = startIndex; i < data.length && i <= endIndex; i++) {
        let record = data[i]
        let proposer = record.proposer
        let proposee = record.proposee
        let time = record.time
        
        let proposerUser = await client.users.fetch(proposer)
        let proposeeUser = await client.users.fetch(proposee)
        let timeLocalToViewer = `<t:${Math.trunc(time / 1000)}>`

        description += `💍 ${proposerUser} proposed to ${proposeeUser}\n` +
        `**At** ${timeLocalToViewer}\n\n`
    }

    if (!description) {
        description += `This user has no proposals at this moment!\n`
    }

    let pageButtons = new ActionRowBuilder()
    let previous = new ButtonBuilder()
    .setCustomId(`marriage|proposals|${userId}|${page - 1}`)
    .setLabel(`Previous`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
    pageButtons.addComponents(previous)
    let next = new ButtonBuilder()
    .setCustomId(`marriage|proposals|${userId}|${page + 1}`)
    .setLabel(`Next`)
    .setStyle(ButtonStyle.Success)
    .setDisabled(true)
    pageButtons.addComponents(next)

    if (startIndex - 1 >= 0) {
        previous.setDisabled(false)
        .setLabel(`Page ${page - 1}`)
    }
    if (endIndex + 1 < data.length) {
        next.setDisabled(false)
        .setLabel(`Page ${page + 1}`)
    }
    
    let embed = new EmbedBuilder()
    .setColor(process.env.THEME)
    .setTitle(`__${userName}'s Pending Proposals__`)
    .setDescription(description)
    .setFooter( {text: `Page ${page}` } )
    .setThumbnail('attachment://ring.png')
    interaction.followUp( {
        embeds: [embed],
        components: [pageButtons],
        files: [DIAMOND_RING]
    } )
}

async function createMarriageList(client, interaction, user, data, page) {
    let userId = user.id
    let userName = user.username
    let startIndex = (page - 1) * 10
    let endIndex = startIndex + 9
    let description = ``
    
    for (let i = startIndex; i < data.length && i <= endIndex; i++) {
        let record = data[i]
        let proposer = record.proposer
        let proposee = record.proposee
        let start = record.start
        let end = record.end
        
        let partnerId = proposer != userId ? proposer : proposee
        let partner = await client.users.fetch(partnerId)
        let currentlyMarried = end == null ? true : false
        let startLocalToViewer = `<t:${Math.trunc(start / 1000)}>`

        if (currentlyMarried) {
            description += `💍 ${user} is currently married to ${partner}\n` +
            `**Married** ${startLocalToViewer}\n\n`
        } else {
            let endLocalToViewer = `<t:${Math.trunc(end / 1000)}>`
            description += `💔 ${user} was married to ${partner}\n` +
            `**Married**  ${startLocalToViewer}\n` +
            `**Divorced** ${endLocalToViewer}\n\n`
        }
    }

    if (!description) {
        description += `This user has never married anyone!\n`
    }

    let pageButtons = new ActionRowBuilder()
    let previous = new ButtonBuilder()
    .setCustomId(`marriage|marriages|${userId}|${page - 1}`)
    .setLabel(`Previous`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
    pageButtons.addComponents(previous)
    let next = new ButtonBuilder()
    .setCustomId(`marriage|marriages|${userId}|${page + 1}`)
    .setLabel(`Next`)
    .setStyle(ButtonStyle.Success)
    .setDisabled(true)
    pageButtons.addComponents(next)

    if (startIndex - 1 >= 0) {
        previous.setDisabled(false)
        .setLabel(`Page ${page - 1}`)
    }
    if (endIndex + 1 < data.length) {
        next.setDisabled(false)
        .setLabel(`Page ${page + 1}`)
    }
    
    let embed = new EmbedBuilder()
    .setColor(process.env.THEME)
    .setTitle(`__${userName}'s Marriages__`)
    .setDescription(description)
    .setFooter( {text: `Page ${page}` } )
    .setThumbnail('attachment://love.png')
    interaction.followUp( {
        embeds: [embed],
        components: [pageButtons],
        files: [LOVE]
    } )
}

async function prepareMarriagePage(client, interaction) {
    let args = (interaction.customId).split('|')
    let targetUserId = args[2]
    let page = Number(args[3])
    let targetUser = await client.users.fetch(targetUserId)
    let marriageData = await database.selectAndOrder(marriagesSchema, 'proposer, proposee, start, end', ['proposer', 'proposee'], [targetUser.id, targetUser.id], 'start')
    
    createMarriageList(client, interaction, targetUser, marriageData, page)
}

async function prepareProposalsPage(client, interaction) {
    let args = (interaction.customId).split('|')
    let targetUserId = args[2]
    let page = Number(args[3])
    let targetUser = await client.users.fetch(targetUserId)
    let proposalsData = await database.selectAndOrder(proposalsSchema, 'proposer, proposee, time', ['proposer', 'proposee'], [targetUser.id, targetUser.id], 'id')

    createProposalList(client, interaction, targetUser, proposalsData, page)
}

function coupleIds(id1, id2) {
    return id2 > id1 ? `${id1} | ${id2}` : `${id2} | ${id1}`
}

async function run(client, interaction) {
    await interaction.deferReply()
    const { options } = interaction
    const subcommand = options.getSubcommand()
    switch(subcommand) {
        case SUBCOMMANDS.PROPOSE:
            propose(interaction)
            break
        case SUBCOMMANDS.REVOKE:
            revoke(interaction)
            break
        case SUBCOMMANDS.ACCEPT:
            accept(interaction)
            break
        case SUBCOMMANDS.DECLINE:
            decline(interaction)
            break
        case SUBCOMMANDS.DIVORCE:
            divorce(interaction)
            break
        case SUBCOMMANDS.PROPOSALS:
            listproposals(client, interaction)
            break
        case SUBCOMMANDS.MARRIAGES:
            listmarriages(client, interaction)
            break
    }
}

const init = (client) => {
    database.createTable(proposalsSchema)
    database.createTable(marriagesSchema)

    client.on(Events.InteractionCreate, async (interaction) => {
        if ( !(interaction.isButton()) || !(interaction.customId.startsWith('marriage')) ) { return }
        await interaction.deferReply()
        let args = (interaction.customId).split('|')
        let pageType = args[1]
        
        switch(pageType) {
            case 'proposals':
                prepareProposalsPage(client, interaction)
                break
            case 'marriages':
                prepareMarriagePage(client, interaction)
                break
        }
    })
}

module.exports = {
    name: 'marriage',
    description: 'Marriage command',
    options: [
        {
            name: SUBCOMMANDS.PROPOSE,
            description: 'Propose to your lover.',
            type: 1, // SUB_COMMAND
            options: [{
                name: 'user',
                description: 'Lover',
                type: 6, // User
                required: true
            }]
        }, {
            name: SUBCOMMANDS.REVOKE,
            description: 'Revoke a marriage proposal.',
            type: 1, // SUB_COMMAND
            options: [{
                name: 'user',
                description: 'Target user',
                type: 6, //User
                required: true
            }]
        }, {
            name: SUBCOMMANDS.ACCEPT,
            description: 'Accept a marriage proposal.',
            type: 1, // SUB_COMMAND
            options: [{
                name: 'user',
                description: 'Target user',
                type: 6, //User
                required: true
            }]
        }, {
            name: SUBCOMMANDS.DECLINE,
            description: 'Decline a marriage proposal.',
            type: 1, // SUB_COMMAND
            options: [{
                name: 'user',
                description: 'Target user',
                type: 6, //User
                required: true
            }]
        }, {
            name: SUBCOMMANDS.DIVORCE,
            description: 'Divorce a partner',
            type: 1, // SUB_COMMAND
            options: [{
                name: 'user',
                description: 'Target user',
                type: 6, //User
                required: true
            }]
        }, {
            name: SUBGROUPS.LIST,
            description: 'List',
            type: 2, // SUB_COMMAND_GROUP
            options: [
                {
                    name: SUBCOMMANDS.PROPOSALS,
                    description: 'Lists all pending proposals for a user.',
                    type: 1, // SUB_COMMAND
                    options: [{
                        name: 'user',
                        description: 'Target user',
                        type: 6, //User
                        required: false
                    }]
                }, {
                    name: SUBCOMMANDS.MARRIAGES,
                    description: 'Lists everyone a user is married to.',
                    type: 1, // SUB_COMMAND
                    options: [{
                        name: 'user',
                        description: 'Target user',
                        type: 6, //User
                        required: false
                    }]
                }
            ]
        }

    ],
    init,
    run
}