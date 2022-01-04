module.exports = async (client, interaction) => {
    if (!interaction?.isCommand()) return;
    const slashCommand = client.commands.get(interaction.commandName);
    if(!slashCommand) return;
   
    if(interaction.member) {
        const { guild } = interaction.member;
        if(guild) {
            const channel = guild.channels.cache.get(interaction.channelId) || await guild.channels.fetch(interaction.channelId).catch(() => {}) || false
            if(!channel.permissionsFor(guild.me).has("EMBED_LINKS")){
                return interaction.reply({
                    ephemeral: true,
                    content: "❌ **I am missing the \`EMBED_LINKS\` Permission!**"
                }).catch(console.warn)
            }
        }
    }
    try {
        await slashCommand.runCommand(client, interaction)
    } catch(e){
        if(e) console.warn(e)
        await interaction.reply({
            ephemeral: true,
            content: "❌ **Something went wrong while running this Command!**"
        }).catch(console.warn)
    }
}