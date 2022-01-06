const { getAuthor, getFooter, errorEmbedArray } = require(`../../util/util`);
const { MessageEmbed } = require("discord.js");
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member: { guild }, options, user } = i;
        const { memory, bot } = client.allEmojis;
        const MaxPoints = { 2: 2, 3: 4, 4: 8, 5: 12 };

        // Additional Command Options
        let User = options?.getUser(`user`);
        if(!User) User = user;

        const UserDB = client.db.cache.has(User.id) ? client.db.cache.get(User.id) : null;
        if(!UserDB) return i.reply({ 
            embeds: errorEmbedArray(client, guild, member.user, 6, `__${User.tag}__ hasn't ever played something.`),
            ephemeral: true 
        }).catch(console.warn);

        const playedGames = {
            memory: {
                all: UserDB.playedGames.filter(m => m.type == "memory").length > 0 ? UserDB.playedGames.filter(m => m.type == "memory") : [],
                guild: UserDB.playedGames.filter(d => d.guild == guild.id).filter(m => m.type == "memory").length > 0 ? UserDB.playedGames.filter(d => d.guild == guild.id).filter(m => m.type == "memory") : [],
            },
            total: {
                all: UserDB.playedGames,
                guild: UserDB.playedGames.filter(d => d.guild == guild.id),
            },
        }

        //most played board for memory total
        const mostplayedMemoryBoard = {
            all: playedGames.memory.all ? [
                playedGames.memory.all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 2).map(d => d.boardSize), playedGames.memory.all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 3).map(d => d.boardSize),
                playedGames.memory.all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 4).map(d => d.boardSize), playedGames.memory.all.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 5).map(d => d.boardSize),
            ].filter(d => d.length !== null || d.length > 0).sort((a, b) => b.length - a.length)[0][0] : "X",
            guild: playedGames.memory.guild ? [
                playedGames.memory.guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 2).map(d => d.boardSize), playedGames.memory.guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 3).map(d => d.boardSize),
                playedGames.memory.guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 4).map(d => d.boardSize), playedGames.memory.guild.sort((a, b) => a.boardSize - b.boardSize).filter(d => d.boardSize == 5).map(d => d.boardSize),
            ].filter(d => d.length !== null || d.length > 0).sort((a, b) => b.length - a.length)[0][0] : "X",
        };
        
        return i.reply({
            ephemeral: true,
            embeds: [
                new MessageEmbed()
                .setColor(client.colors.main)
                .setThumbnail(User.displayAvatarURL({dynamic: true}))
                .setAuthor(getAuthor(client, user))
                .setFooter(getFooter(client, guild))
                .setTitle(`Stats of __${User.tag}__`)
                .addField(`**__STAT-TYPE:__**`, `\u200b\n**GAMES:**\n\`\`\`-)\`\`\`\n**POINTS:**\n\`\`\`-)\`\`\`\n**Fav. Board:**\n\`\`\`-)\`\`\`\n**Avg. Points / Game:**\n\`\`\`-)\`\`\``, true)
                .addField(`**__GLOBAL STATS__**\n\n${memory} **MEMORY**`, `\`\`\`yml\n${playedGames.memory.all.length}\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${playedGames.memory.all.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${mostplayedMemoryBoard.all}x${mostplayedMemoryBoard.all} [m.P: ${MaxPoints[mostplayedMemoryBoard.all]}]\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${Math.floor((playedGames.memory.all.reduce((a,b) => a + b.points, 0) / playedGames.memory.all.length)*100)/100}\n\`\`\``, true)
                .addField(`**__GUILD STATS__**\n\n${memory} **MEMORY**`, `\`\`\`yml\n${playedGames.memory.guild.length}\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${playedGames.memory.guild.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${mostplayedMemoryBoard.guild}x${mostplayedMemoryBoard.guild} [m.P: ${MaxPoints[mostplayedMemoryBoard.guild]}]\n\`\`\`\n${memory} **MEMORY**\n\`\`\`yml\n${Math.floor((playedGames.memory.guild.reduce((a,b) => a + b.points, 0) / playedGames.memory.guild.length)*100)/100}\n\`\`\``, true)
                
                .addField(`\u200b`, `\u200b`)

                .addField(`**__STAT-TYPE:__**`, `\u200b\n**GAMES:**\n\`\`\`-)\`\`\`\n**POINTS:**\n\`\`\`-)\`\`\`\n**Avg. Points / Game:**\n\`\`\`-)\`\`\``, true)
                .addField(`**__GLOBAL STATS__**\n\n${bot} **ALL-GAMES**`, `\`\`\`yml\n${playedGames.total.all.length}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${playedGames.total.all.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${Math.floor((playedGames.memory.all.reduce((a,b) => a + b.points, 0) / playedGames.memory.all.length)*100)/100}\n\`\`\``, true)
                .addField(`**__GUILD STATS__**\n\n${bot} **ALL-GAMES**`, `\`\`\`yml\n${playedGames.total.guild.length}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${playedGames.total.guild.reduce((a,b) => a + b.points, 0)}\n\`\`\`\n${bot} **ALL-GAMES**\n\`\`\`yml\n${Math.floor((playedGames.memory.guild.reduce((a,b) => a + b.points, 0) / playedGames.memory.guild.length)*100)/100}\n\`\`\``, true)
                 
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
        ],
        default_permission: undefined
    }
}