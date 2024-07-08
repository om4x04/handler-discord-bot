module.exports = { findCommand, getCommands, load, getSlashCommand };
const fs = require('fs-extra'); //fs

const commands = new Map();

function getCommands() {
    return [...commands.values()];
}

function findCommand(args) {
    args = args.join(' ');
    const commands = getCommands();
    return commands.find(({ name }) => args.startsWith(name));
}

function load(client) {
    const slashCommands = [];
    for (let dirName of ['commands', 'listeners']) {
        const dirs = fs.readdirSync(dirName, { withFileTypes: true });
        for (const dir of dirs) {
            if(dir.isDirectory()) {
                for (const file of fs.readdirSync(`./${dirName}/${dir.name}/`)) {
                    const data = require(`./${dirName}/${dir.name}/${file}`);
                    if (dirName === 'commands') {
                        slashCommands.push(getSlashCommand(data));
                        commands.set(data.name, data);
                    } else {
                        client.on(data.name, (...args) => data.callback(client, ...args));
                    }
                }  
            } else {
                const data = require(`./${dirName}/${dir.name}`);
                if (dirName === 'commands') {
                    slashCommands.push(getSlashCommand(data));
                    commands.set(data.name, data);
                } else {
                    client.on(data.name, async (...args) => data.callback(client, ...args));
                }
            }
        }
    }

    fetch(`https://discord.com/api/v10/applications/${client.user?.id}/commands`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${client.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(slashCommands)
    });
}

const commandOptionsTypes = {
    'string': 3,
    'number': 4,
    'boolean': 5,
    'member': 6,
    'user': 6,
    'channel': 7,
    'role': 8
}

function getSlashCommand(command) {
    const commands = getCommands();
    const commandName = command.name.split(' ');

    if (commandName.length > 3) {
        console.info(`[Command]:\nThe command ${command.name} is too long`);
        return;
    }

    const [name, groupOrSub] = commandName;
    const description = command.descriptions[0][1];

    let slashCommand = {
        name,
        description,
        type: 1,
        options: []
    };

    if (commandName.length === 1) {
        slashCommand.options = [...command.arguments?.map(({ id, type, description }) => ({
            name: id,
            type: commandOptionsTypes[type],
            description
        }))];
    } else if (commandName.length === 2) {
        slashCommand.options = [{
            type: 1,
            name: groupOrSub,
            description,
            options: commands
                .filter((command) => command.name.startsWith(`${name} ${groupOrSub}`))
                .map((command) => ({
                    type: 2,
                    name: command.name.split(' ')[1],
                    description,
                    options: command.arguments.map(({ id, type, description }) => ({
                        name: id,
                        type: commandOptionsTypes[type],
                        description
                    }))
                }))
        }];
    } else {
        slashCommand.options = [{
            type: 2,
            name: groupOrSub,
            description,
            options: commands
                .filter((command) => command.name.startsWith(`${name} ${groupOrSub}`))
                .map((command) => ({
                    type: 2,
                    name: command.name.split(' ')[2],
                    description: command.descriptions[0][1],
                    options: command.arguments.map(({ id, type, description }) => ({
                        name: id,
                        type: commandOptionsTypes[type],
                        description
                    }))
                }))
        }];
    }

    return slashCommand;
}