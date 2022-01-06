module.exports = async (client, interaction) => {
    if (!interaction?.isCommand()) return;
    const slashCommand = client.commands.get(interaction.commandName);
    if(!slashCommand) return;
    if(!interaction.member || !interaction.member.guild) {
            return interaction.reply({
                ephemeral: true,
                content: `${client.allEmojis.deny} **This Command only works in a Guild!**`
            }).catch(console.warn)
    }

    const { guild } = interaction.member;
    const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : "en";
    const { perms, error } = client.la[ls].commands.ping;
        
    if(guild) {
        const channel = guild.channels.cache.get(interaction.channelId) || await guild.channels.fetch(interaction.channelId).catch(() => {}) || false
        if(!channel.permissionsFor(guild.me).has(`EMBED_LINKS`)){
            return interaction.reply({
                ephemeral: true,
                content: `${eval(perms)}`
            }).catch(console.warn)
        }
    }
    try {
        await slashCommand.runCommand(client, interaction)
    } catch(e){
        if(e) console.warn(e)
        await interaction.reply({
            ephemeral: true,
            content: `${eval(error)}`
        }).catch(console.warn)
    }
}