const { getAuthor, getFooter, errorEmbedArray } = require(`../../util/util`);
const { MessageEmbed } = require("discord.js");
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options, user } = i;
        const { memory, bot, dice } = client.allEmojis;
        const MaxPoints = { 2: 2, 3: 4, 4: 8, 5: 12 };

        // Additional Command Options
        let User = options?.getUser(`user`) || user;
        let Game = options?.getString(`what_game`) || `memory`; 

        const UserDB = client.db.cache.has(User.id) ? client.db.cache.get(User.id) : null;
        if(!UserDB) return i.reply({ 
            embeds: errorEmbedArray(client, guild, member.user, 6, `__${User.tag}__ hasn't ever played something.`),
            ephemeral: true 
        }).catch(console.warn);

        const playedGames = {
            [Game]: {
                all: UserDB.playedGames.filter(m => m.type == Game).length > 0 ? UserDB.playedGames.filter(m => m.type == Game) : [],
                guild: UserDB.playedGames.filter(d => d.guild == guild.id).filter(m => m.type == Game).length > 0 ? UserDB.playedGames.filter(d => d.guild == guild.id).filter(m => m.type == Game) : [],
            },
            total: {
                all: UserDB.playedGames,
                guild: UserDB.playedGames.filter(d => d.guild == guild.id),
            },
        }

        
        //most played board for memory total
        const mostplayedMemoryBoard = {
            all: playedGames[Game].all ? [
                playedGames[Game].all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 2).map(d => d.boardSize), playedGames[Game].all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 3).map(d => d.boardSize),
                playedGames[Game].all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 4).map(d => d.boardSize), playedGames[Game].all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 5).map(d => d.boardSize),
            ].filter(d => d.length !== null || d.length > 0).sort((a, b) => b.length - a.length)[0][0] : "X",
            guild: playedGames[Game].guild ? [
                playedGames[Game].guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 2).map(d => d.boardSize), playedGames[Game].guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 3).map(d => d.boardSize),
                playedGames[Game].guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 4).map(d => d.boardSize), playedGames[Game].guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 5).map(d => d.boardSize),
            ].filter(d => d.length !== null || d.length > 0).sort((a, b) => b.length - a.length)[0][0] : "X",
        };
        
        const gameEmoji = Game == "memory" ? memory : dice;

        return i.reply({
            ephemeral: true,
            embeds: [
                new MessageEmbed()
                .setColor(client.colors.main)
                .setThumbnail(User.displayAvatarURL({dynamic: true}))
                .setAuthor(getAuthor(client, user))
                .setFooter(getFooter(client, guild))
                .setTitle(`Stats of __${User.tag}__`)
                .addField(`**__STAT-TYPE:__**`, `\u200b\n**GAMES:**\n\`\`\`-)\`\`\`\n**POINTS:**\n\`\`\`-)\`\`\`\n${Game == "memory" ? `**Fav. Board:**\n\`\`\`-)\`\`\`\n` : ``}**Avg. Points / Game:**\n\`\`\`-)\`\`\``, true)
                .addField(`**__GLOBAL STATS__**\n\n${gameEmoji} **${Game.toUpperCase()}**`, `\`\`\`yml\n${playedGames[Game].all.length}\n\`\`\`\n${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${playedGames[Game].all.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${Game == "memory" ? `${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${mostplayedMemoryBoard.all}x${mostplayedMemoryBoard.all} [m.P: ${MaxPoints[mostplayedMemoryBoard.all]}]\n\`\`\`\n` : ``}${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${Math.floor((playedGames[Game].all.reduce((a,b) => a + b.points, 0) / playedGames[Game].all.length)*100)/100}\n\`\`\``, true)
                .addField(`**__GUILD STATS__**\n\n${gameEmoji} **${Game.toUpperCase()}**`, `\`\`\`yml\n${playedGames[Game].guild.length}\n\`\`\`\n${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${playedGames[Game].guild.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${Game == "memory" ? `${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${mostplayedMemoryBoard.guild}x${mostplayedMemoryBoard.guild} [m.P: ${MaxPoints[mostplayedMemoryBoard.guild]}]\n\`\`\`\n` : ``}${gameEmoji} **${Game.toUpperCase()}**\n\`\`\`yml\n${Math.floor((playedGames[Game].guild.reduce((a,b) => a + b.points, 0) / playedGames[Game].guild.length)*100)/100}\n\`\`\``, true)
                
                .addField(`\u200b`, `\u200b`)

                .addField(`**__STAT-TYPE:__**`, `\u200b\n**GAMES:**\n\`\`\`-)\`\`\`\n**POINTS:**\n\`\`\`-)\`\`\`\n**Avg. Points / Game:**\n\`\`\`-)\`\`\``, true)
                .addField(`**__GLOBAL STATS__**\n\n${bot} **ALL-GAMES**`, `\`\`\`yml\n${playedGames.total.all.length}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${playedGames.total.all.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${Math.floor((playedGames[Game].all.reduce((a,b) => a + b.points, 0) / playedGames[Game].all.length)*100)/100}\n\`\`\``, true)
                .addField(`**__GUILD STATS__**\n\n${bot} **ALL-GAMES**`, `\`\`\`yml\n${playedGames.total.guild.length}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${playedGames.total.guild.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${Math.floor((playedGames[Game].guild.reduce((a,b) => a + b.points, 0) / playedGames[Game].guild.length)*100)/100}\n\`\`\``, true)
                 
            ],
        })
    },
    cmdData: {
        name: 'userstats',
        description: 'Get the Stats of a User',
        options: [ 
            {
                name: `user`,
                description: `Pic the exact User!`,
                required: false,
                type: 6
            },
            {
                choices: [
                        { name: 'memory', value: 'memory' },
                        { name: 'ladder', value: 'ladder' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'what_game',
                description: 'Of which game do you want the stats?',
                required: false
            }
        ],
        default_permission: undefined
    }
}