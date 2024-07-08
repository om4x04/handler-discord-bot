const { Interaction } = require("discord.js");
const { findCommand } = require('../../functions');
module.exports = {
    name: 'interactionCreate',
    async callback(client, interaction) {
        if (!interaction.guild || !interaction.isCommand() || !interaction.isChatInputCommand()) return;
        let options = interaction.options?.data.filter(({ type }) => [1, 2].includes(type))

        const command = findCommand([interaction.commandName, ...options.map(({ name }) => name)]);

        const commandArguments = {};
        for (const arg of command?.arguments) {
            let value;

            switch (arg.type) {
                case 'string':
                    value = interaction.options.getString(arg.id);
                    break;
                case 'number':
                    value = interaction.options.getNumber(arg.id);
                    break;
                case 'boolean':
                    value = interaction.options.getBoolean(arg.id);
                    break;
                case 'user':
                    value = interaction.options.getUser(arg.id);
                    break;
                case 'channel':
                    value = interaction.options.getChannel(arg.id);
                    break;
                case 'role':
                    value = interaction.options.getRole(arg.id);
                    break;
                default:
                    value = null;
                    break;
            }

            commandArguments[arg.id] = value;
        }
        interaction.author = interaction.user;
        await command.callback(client, interaction, ...Object.values(commandArguments));
    }
}