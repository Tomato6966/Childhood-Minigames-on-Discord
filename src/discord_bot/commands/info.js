const { MessageEmbed } = require(`discord.js`)
const { getFooter, getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        const { member: { guild }, options } = i;
        const Option = options?.getString(`what_info`);

        if (Option && Option == `memory_game`) {
            await i.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`> ${client.allEmojis.memory} Memory Game`)
                        .addField(`__What to do:__`, `>>> A player is offered to play with you (you can optionally decide the board size (~Gametime)), after he/she/they accepted the Game starts.\n\nThe User who's turn it is pics 2 Cards and remembers their faces and position. If they are again they can pic again, and if they get a Match (== 2 Cards with the same face) they get 1 Point.\n\nThe Player with the most Points wins (after all matches are found or the game ended).\n\nIf you get a Match, you can pic again.\n\nYou have 1 Minute to pic 2 cards, otherwise the Game will end!\n\n[*Click here to see official Memory Rules*](https://www.ultraboardgames.com/memory/game-rules.php)`)
                        .addField(`__Available Playing Options:__`, `>>> **\`2x2 Board\` *... up to \`2 Points\`***\n**\`3x3 Board\` *... up to \`4 Points\`***\n**\`4x4 Board\` *... up to \`8 Points\`***\n**\`5x5 Board\` *... up to \`12 Points\`***`)
                        .setImage(client.allImages.memory)
                        .setFooter(getFooter(client, guild))
                ], 
                ephemeral: true 
            }).catch(console.warn);
        } else {
            await i.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`> ${client.allEmojis.bot} Hey I'm **${client.user.username}** and I provide you well known and liked Child-Games on Discord!\nTo get started type a \`/\` and select me!`)
                        .setFooter({text: guild ? guild.name : client.user.username, iconURL: guild ? guild.iconURL({dynamic: true}) : client.user.displayAvatarURL() })
                ],  
                ephemeral: true 
            }).catch(console.warn);
        }
    },
    cmdData: {
        name: 'info',
        description: 'Information about me / stuff from me',
        options: [ 
            {
                choices: [
                        { name: 'about_me', value: 'about_me' },
                        { name: 'memory_game', value: 'memory_game' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'what_info',
                description: 'What Info do you want to get?',
                required: false
            }
        ],
        default_permission: undefined
    }
}