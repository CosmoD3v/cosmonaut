const { EmbedBuilder } = require("discord.js")

const run = async (client, interaction) => {
    const { options } = interaction
    let user = options.getMember('user') == null ? interaction.user : options.getMember('user').user
    let embed = new EmbedBuilder()
    .setColor(0xF4CECE)
    .setTitle(`${user.username}'s Avatar`)
    .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
    interaction.reply( { embeds: [embed] } )
}

const init = (client) => {}

module.exports = {
    name: 'avatar',
    description: `Get someone's profile picture`,
    options: [{
        name: 'user',
        description: 'Target user',
        type: 6, //User
        required: false
    }],
    init,
    run
}