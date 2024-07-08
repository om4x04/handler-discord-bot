module.exports = {
    name: 'avatar',
    descriptions: [['avatar', 'Grab the avatar of an user']],
    arguments: [{
        id: 'member', 
        type: 'user',
        description: 'Member'
    }],
    async callback(client, interaction, user) {
        const embeds = [{
            title: `${user.globalName} avatar's`,
            image: {
                url: user.avatarURL({ extension: 'png' })
            },
            timestamp: new Date().toISOString()
        }];
        interaction.reply({ embeds });
    }
}