const { getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild } } = i;
        const { bot } = client.allEmojis;
        return i.reply({
            ephemeral: true,
            content: `${bot} **Invite me ${client.user}:**\n> https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2180368448&scope=bot%20applications.commands\n\n||**Make sure to keep the SLASHCOMMAND Permission!**||`
        }).catch(console.warn);
        
    },
    cmdData: {
        name: 'invite',
        description: 'Add me to your Server!',
        default_permission: undefined
    }
}