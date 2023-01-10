const { EmbedBuilder } = require("discord.js")

function disconnectUsers(channel) {
    channel.members.forEach(user => {
        user.voice.disconnect()
    });
}

const run = async (client, interaction) => {
    const guild = client.guilds.cache.get(process.env.GUILDID)
    const member = guild.members.cache.get(interaction.user.id)
    const isInVoice = member.voice.channel

    let embed = new EmbedBuilder()
    embed.setColor(0xF4CECE)
    if (!isInVoice) {
        embed
        .setDescription('**You must be in a voice channel to perform this command.**')
        interaction.reply( {embeds: [embed]} )
        return
    }
    
    let channel = client.channels.cache.get(member.voice.channel.id)
    disconnectUsers(channel)
    embed.setDescription(` **${member.user.username} cleaned \`${channel.name}\`!** `)
    interaction.reply( {embeds: [embed]} )
}

const init = (client) => {}

module.exports = {
    name: 'clean',
    description: 'Cleans the voice channel you are in.',
    init,
    run
}