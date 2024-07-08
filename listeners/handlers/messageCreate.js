const { findCommand } = require('../../functions');
const { prefix } = require('../../config.json');
module.exports = {
    name: 'messageCreate',
    async callback(client, message) {
        const { author, content, guild } = message
        if(author.bot || !guild || !content.startsWith(prefix)) return;
        
        let args = content.trim().slice(prefix.length).split(' ');
        const command = findCommand(args);
        args = args.slice(command?.name.split(' ').length);

        const commandArguments = {};
        for (const arg of command?.arguments) {
            let value;

            switch (arg.type) {
                case 'string':
                    value = args.filter(str => !str.includes('@') ?? !str.includes(',')).join(' ');
                    break;
                case 'number':
                    value = args.map(val => parseFloat(val)).find(value => !isNaN(value));
                    break;
                case 'boolean':
                    value = args.map(val => val === 'true' ? true : val === 'false' ? false : null).find(Boolean);
                    break;
                case 'member':
                    let guildMembers = client.users.cache;
                    value = message.mentions.members.first() ?? guildMembers.find(user => user.user.username.includes(args[0])) ?? guildMembers.get(args[0]);
                    break;
                case 'user':
                    let clientUsers = client.users.cache;
                    value = message.mentions.users.first() ?? clientUsers.find(user => user.username.includes(args[0])) ?? clientUsers.get(args[0]);
                    break;
                case 'channel':
                    let guildChannels = message.guild?.channels.cache;
                    value = message.mentions.channels.first() ?? guildChannels?.find(channel => channel.name.includes(args[0])) ?? guildChannels?.get(args[0])
                    break;
                case 'role':
                    let guildRoles = message.guild?.roles.cache;
                    value = message.mentions.roles.first() ?? guildRoles?.find(role => role.name.includes(args[0])) ?? guildRoles?.get(args[0])
                    break;
                default:
                    value = args.shift();
                    break;
            }
            args = args.slice(Array.isArray(value) ? value.length : 1);
            commandArguments[arg.id] = value;
        }

        message.user = author;
        await command.callback(client, message, ...Object.values(commandArguments));
    }
}