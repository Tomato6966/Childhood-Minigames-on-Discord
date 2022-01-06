const { getBaseData, getDateTimeString } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild } } = i;
        const { bot } = client.allEmojis;
        //get the data and uptime timestamp
        const date = new Date();
        const timestamp = date.getTime() - Math.floor(client.uptime);
        //Example embed data design
        let data = getBaseData(client, guild, `${bot} **Online since ${getDateTimeString(timestamp).split(" ")[0]} <t:${Math.floor(timestamp / 1000)}:d><t:${Math.floor(timestamp / 1000)}:T>**`);
        data.embeds[0].setDescription(`**More detailled:** \`\`\`yml\n${getDateTimeString(timestamp)}\n\`\`\``);
        //reply
        return i.reply(data).catch(console.warn);
    },
    cmdData: {
        name: 'uptime',
        description: 'Shows for how long i\'ve been online',
        default_permission: undefined
    }
}