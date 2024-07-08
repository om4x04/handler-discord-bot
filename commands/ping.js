module.exports = {
    name: 'ping',
    descriptions: [['/ping', 'Get the latency']],
    arguments: [],
    async callback(client, interaction) {
        interaction.reply({
            content: `${client.ws.ping}ms`
        });
    }
}