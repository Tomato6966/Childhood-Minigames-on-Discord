const { getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options, createdTimestamp } = i;
        const { bot, ping } = client.allEmojis;
        const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : "en";
        const { botping, api } = client.la[ls].commands.ping;
        // Additional Command Options
        const Option = options?.getString(`what_ping`);
        // If it should be the bot ping
        if (Option && Option == `botping`) {
            // get the ping by editing the interaction
            return i.reply(getBaseData(client, guild, `${eval(botping.ping)}`)).catch(console.warn).then(() => {
                // Edit the i to show the bot ping
                i.editReply(getBaseData(client, guild, `${eval(botping.result)}`)).catch(console.warn);
            });
        } else {
            // Otherwise just show the api ping
            return i.reply(getBaseData(client, guild, `${eval(api)}`)).catch(console.warn);
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