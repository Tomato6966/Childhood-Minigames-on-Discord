const { getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options, createdTimestamp } = i;
        const { bot, ping } = client.allEmojis;
        // Additional Command Options
        const Option = options?.getString(`what_ping`);
        // If it should be the bot ping
        if (Option && Option == `botping`) {
            // get the ping by editing the interaction
            return i.reply(getBaseData(client, guild, `> ${ping} Pinging ...`)).catch(console.warn).then(() => {
                // Edit the i to show the bot ping
                i.editReply(getBaseData(client, guild, `> ${bot} **Bot Ping**: \`${Math.floor((Date.now() - createdTimestamp))} ms\`\n\n> ${ping} **Api Ping**: \`${Math.floor(client.ws.ping)} ms\``)).catch(console.warn);
            });
        } else {
            // Otherwise just show the api ping
            return i.reply(getBaseData(client, guild, `> ${ping} **Api Ping**: \`${Math.floor(client.ws.ping)} ms\``)).catch(console.warn);
        }
    },
    cmdData: {
        name: 'ping',
        description: 'Shows the Bot Ping',
        options: [ 
            {
                choices: [
                        { name: 'bot', value: 'botping' },
                        { name: 'discord_api', value: 'api' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'what_ping',
                description: 'What Ping do you want to get?',
                required: false
            }
        ],
        default_permission: undefined
    }
}