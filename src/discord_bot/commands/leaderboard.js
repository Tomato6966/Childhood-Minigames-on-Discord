const { getAuthor, getFooter, errorEmbedArray } = require(`../../util/util`);
const { MessageEmbed } = require("discord.js");
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options, user } = i;
        const { memory, bot } = client.allEmojis;

        // Additional Command Options
        let Game = options?.getString(`game`);

        let data = client.db.cache.filter(d => d.type && d.type == "user");
        
        
        let sortedPoints = [...data.filter(d => Game != "all" ? d.playedGames.filter(d => d.type == Game) : d.playedGames).sort((a, b) => b.playedGames.reduce((a,b) => a + b.points, 0) - a.playedGames.reduce((a,b) => a + b.points, 0)).values()];
        let sortedAvgPoints = [...data.filter(d => Game != "all" ? d.playedGames.filter(d => d.type == Game) : d.playedGames).sort((a, b) => (Math.floor((b.playedGames.reduce((x,y) => x + y.points, 0) / b.playedGames.length)*100)/100) - (Math.floor((a.playedGames.reduce((x,y) => x + y.points, 0) / a.playedGames.length)*100)/100)).values()]
        const Option = options?.getString("sort");

        if(Option == "maxpoints") {
            return i.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                    .setColor(client.colors.main)
                    .setThumbnail(guild.iconURL({dynamic: true}))
                    .setFooter(getFooter(client, guild))
                    .setTitle(`Top 10 Leaderboard of __${guild.name}__\n> **Sorted for points**`)
                    .setDescription(`${sortedPoints.slice(0, 10).map((d, index) => {
                        let i = index + 1;
                        return `${i == 1 ? `:first_place:` : i == 2 ? `:second_place:` : i == 3 ? `:third_place:` : i} <@${d.id}> | \`${d.playedGames.reduce((a,b) => a + b.points, 0)}\``
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
                    .setTitle(`Top 10 Leaderboard of __${guild.name}__\n> **Sorted for Avg. Points**`)
                    .setDescription(`${sortedAvgPoints.slice(0, 10).map((d, index) => {
                        let i = index + 1;
                        return `${i == 1 ? `:first_place:` : i == 2 ? `:second_place:` : i == 3 ? `:third_place:` : i} <@${d.id}> | \`${Math.floor((d.playedGames.reduce((x,y) => x + y.points, 0) / d.playedGames.length)*100)/100}\``
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