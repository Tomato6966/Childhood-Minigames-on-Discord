const { getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild } } = i;
        const { discord } = client.allEmojis;
        return i.reply({
            ephemeral: true,
            content: `${discord} **Official Discord Server:**\n> https://discord.gg/XGAHheQxde\n\n${discord} **Server of Developer:**\n> https://discord.gg/milrato`
        }).catch(console.warn);
        
    },
    cmdData: {
        name: 'support',
        description: 'The Support Server',
        default_permission: undefined
    }
}