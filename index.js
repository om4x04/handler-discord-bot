const { Client } = require('discord.js');
const { load } = require('./functions');
const client = new Client({ intents: 3276799 });


client.login(require('./config.json').token).finally(() => {
    load(client);
});