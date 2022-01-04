const { MessageEmbed } = require("discord.js")
module.exports = {
    async runCommand(client, interaction) {
        const { member: { guild }, options, createdTimestamp } = interaction;
        const Option = options?.getString("what_ping");

        if (Option && Option == "botping") {
            await interaction.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`> ${client.allEmojis.ping} Pinging ...`)
                        .setFooter({text: guild ? guild.name : client.user.username, iconURL: guild ? guild.iconURL({dynamic: true}) : client.user.displayAvatarURL() })
                ], 
                ephemeral: true 
            }).catch(console.warn);
            interaction.editReply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`> ${client.allEmojis.bot} **Bot Ping**: \`${Math.floor((Date.now() - createdTimestamp))} ms\`\n\n> ${client.allEmojis.ping} **Api Ping**: \`${Math.floor(client.ws.ping)} ms\``)
                        .setFooter({text: guild ? guild.name : client.user.username, iconURL: guild ? guild.iconURL({dynamic: true}) : client.user.displayAvatarURL() })
                ],
                ephemeral: true 
            })
        } else {
            await interaction.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`> ${client.allEmojis.ping} **Api Ping**: \`${Math.floor(client.ws.ping)} ms\``)
                        .setFooter({text: guild ? guild.name : client.user.username, iconURL: guild ? guild.iconURL({dynamic: true}) : client.user.displayAvatarURL() })
                ],  
                ephemeral: true 
            }).catch(console.warn);
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