const { getFooter, avgPoints, getPoints} = require(`../../util/util`);
const { MessageEmbed } = require("discord.js");
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options } = i;

        // Additional Command Options
        const Game = options?.getString(`game`);

        const data = client.db.cache.filter(d => d.type && d.type == "user");
        const filterGame = (d) => Game != "all" ? { id: d.id, playedGames: d.playedGames.filter(d => d.type == Game) } : d

        const sortedPoints = [...data.map(filterGame).sort((a, b) => getPoints(b) - getPoints(a)).values()];
        const sortedAvgPoints = [...data.map(filterGame).sort((a, b) => avgPoints(b) - avgPoints(a)).values()];

        const Option = options?.getString("sort");

        if(Option == "maxpoints") {
            return i.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                    .setColor(client.colors.main)
                    .setThumbnail(guild.iconURL({dynamic: true}))
                    .setFooter(getFooter(client, guild))
                    .setTitle(`Top 10 Leaderboard of __${guild.name}__\n> **Sorted for points** | ${Game != "all" ? `${Game == `memory` ? client.allEmojis.memory : client.allEmojis.dice} **${Game.toUpperCase()}**` : `${client.allEmojis.bot} **ALL-GAMES**`}`)
                    .setDescription(`${sortedPoints.slice(0, 10).map((d, index) => {
                        let i = index + 1;
                        return `${i == 1 ? `:first_place:` : i == 2 ? `:second_place:` : i == 3 ? `:third_place:` : `\`${i}.\``} <@${d.id}> | \`${getPoints(d)}\``
                    }).join("\n\n")}`)
                ],
            })
        } else {
            return i.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                    .setColor(client.colors.main)
                    .setThumbnail(guild.iconURL({dynamic: true}))
                    .setFooter(getFooter(client, guild))
                    .setTitle(`Top 10 Leaderboard of __${guild.name}__\n> **Sorted for Avg. Points** | ${Game != "all" ? `${Game == `memory` ? client.allEmojis.memory : client.allEmojis.dice} **${Game.toUpperCase()}**` : `${client.allEmojis.bot} **ALL-GAMES**`}`)
                    .setDescription(`${sortedAvgPoints.slice(0, 10).map((d, index) => {
                        let i = index + 1;
                        return `${i == 1 ? `:first_place:` : i == 2 ? `:second_place:` : i == 3 ? `:third_place:` : `\`${i}.\``} <@${d.id}> | \`${avgPoints(d)}\``
                    }).join("\n\n")}`)
                ],
            })
        }
    },
    cmdData: {
        name: 'leaderboard',
        description: 'Get the leaderboard of this Guild',
        options: [ 
            {
                choices: [
                        { name: 'memory', value: 'memory' },
                        { name: 'ladder', value: 'ladder' },
                        { name: 'all_games', value: 'all' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'game',
                description: 'Of which game to get the stats from?',
                required: true
            },
            {
                choices: [
                        { name: 'maxpoints', value: 'maxpoints' },
                        { name: 'avg_points_per_game', value: 'avg_points_per_game' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'sort',
                description: 'After what do you want to sort?',
                required: true
            }
        ],
        default_permission: undefined
    }
}