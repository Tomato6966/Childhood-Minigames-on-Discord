const { delay, getEmojiURL, shuffleArray, getReactionEmoji, gameEmojis, random_element, getButtonRow, getDisabledComponents, getFooter, errorEmbedArray } = require(`../../util/util`);
const { MessageEmbed, MessageActionRow } = require(`discord.js`)
// 2x2 == 2, 3x3 == 4, 4x4 == 8, 5x5 == 12
const MaxPoints = { 2: 2, 3: 4, 4: 8, 5: 12 };
module.exports = {
    async runCommand(client, interaction) {
        const { member: { guild }, user, options } = interaction;
        const EnemyUser = options.getUser(`enemy`);
        const boardSize = options.getString(`boardsize`) ? Number(options.getString(`boardsize`)) : 5;
        
        if(!EnemyUser) {
            return interaction.reply({ embeds: errorEmbedArray(client, guild, user, 3, `**You need to ping a USER who is in this GUILD.**`), ephemeral: true }).catch(console.warn)
        }
        if(EnemyUser.id == user.id) {
            return interaction.reply({ embeds: errorEmbedArray(client, guild, user, 4, `**You can't play with yourself.**\nMake sure to ping a ENEMY!`), ephemeral: true }).catch(console.warn)
        }
        if(EnemyUser.bot) {
            return interaction.reply({ embeds: errorEmbedArray(client, guild, user, 4, `**You can't play with a Discord Bot.**\nMake sure to actually play against a real Human or select the AI-MODE!`), ephemeral: true }).catch(console.warn)
        }
        
        await interaction.reply({ 
            content: `<@${EnemyUser.id}>`,
            embeds: [
                new MessageEmbed()
                    .setTitle(`> ${client.allEmojis.memory} a new game-request for \`${boardSize}x${boardSize}\` MEMORY!`)
                    .addField(`__Player 1 (Challenger):__`, `> \`${user.tag}\` ${user}`, true)
                    .addField(`__Player 2 (Enemy):__`, `> \`${EnemyUser.tag}\` ${EnemyUser}`, true)
                    .addField(`__Board Size:__`, `> **\`${boardSize}x${boardSize}\`: _Win up to \`${MaxPoints[boardSize]} Points\`_!**`)
                    .setDescription(`***${EnemyUser} needs to accept <t:${Math.floor((Date.now() + 60_000) / 1000)}:R> or it will be cancelled!***`)
                    .setFooter(getFooter(client, guild))
                    .setColor(client.colors.main)
                    .setImage(client.allImages.memory)
                    .setTimestamp()
            ], 
            components: [
                getButtonRow([
                    {emoji: client.allEmojis.accept, label: `Accept Game Request`, id: `memory_accept`, style: `PRIMARY`},
                    {emoji: client.allEmojis.deny, label: `Deny Game Request`, id: `memory_deny`, style: `SECONDARY`},
                    {emoji: client.allEmojis.cancel, label: `Cancel Game Request`, id: `memory_cancel`, style: `DANGER`},
                ])
            ],
            ephemeral: false
        }).catch(console.warn);

        // get the message of the interaction 
        let message = await interaction.fetchReply().catch(console.warn);;

        // Create a message component interaction collector
        const filter = (i) => i.customId.includes(`memory_`) && i.message.id == message.id;
        
        const collector = message.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 60_000 });
        
        collector.on(`collect`, interaction => {
            // `modify` the customId
            let bId = interaction.customId.replace(`memory_`, ``); 
            // if one of the 2 users and the id is cancel, then stop
            if(bId == `cancel` && [EnemyUser.id, user.id].includes(interaction.user.id)) {
                // update the request message and respond to the interaction
                interaction.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${client.allEmojis.cancel} **Game Request has been cancelled**`).setDescription(`\u200b`)]    
                }).catch(console.warn);
                return collector.stop(); 
            } 
            // if the user is not the requested one
            if(interaction.user.id != EnemyUser.id) {
                return interaction.reply({ 
                    embeds: errorEmbedArray(client, guild, user, 4, `**Only ${EnemyUser.tag} is allowed to accept/deny a game!**`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it`s deny
            if(bId == `deny`) {
                // update the request message and respond to the interaction
                interaction.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${client.allEmojis.deny} **Game Request has been denied**`).setDescription(`\u200b`)]    
                }).catch(console.warn);
                return collector.stop(); 
            } else  {
                // update the request message and respond to the interaction
                interaction.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${client.allEmojis.accept} **Game Request has been accepted**`)]    
                }).catch(console.warn);
                return collector.stop();
            }
        });
        // Once it has ended
        collector.on(`end`, collected => {
            // if a selection has been made
            if(collected.size > 0) {
                // if it got cancelled or denied, return
                if([`cancel`, `deny`].includes(collected.first().customId.replace(`memory_`, ``))) return;
                
                // start the game
                this.startGame(client, user, EnemyUser, guild, message.channel, boardSize).catch((e) => {
                    console.error(e);
                    // Edit the message so that they know the game has crahsed
                    message.edit({
                        components: getDisabledComponents(message.components),
                        content: message.content,
                        embeds: errorEmbedArray(client, guild, user, 1, `Could not start the Game.\n\`\`\`${String(e.message ? e.message : e).substring(0, 1000)}\`\`\``)   
                    }).catch(console.warn)
                }).then((gameMessage) => {
                    // Edit the message so that they know the game has started!
                    message.edit({
                        components: getDisabledComponents(message.components),
                        content: message.content,
                        embeds: [message.embeds[0].setTitle(`${client.allEmojis.accept} **Game has started**`).setDescription(`> [Here](${gameMessage.url}) is the MESSAGE`)]    
                    }).catch(console.warn);
                    // continue handling this Game!
                    this.handleGame(gameMessage, boardSize);
                })
            } else {
                // edit it that the time ran out
                message.edit({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: errorEmbedArray(client, guild, user, 5, `**${EnemyUser.tag}** (${EnemyUser}) Sadly didn't accept the game request from **${user.tag}** (${user}).`)
                }).catch(console.warn)
            }
        });

    },
    async startGame(client, user, EnemyUser, guild, channel, boardSize) {
        return new Promise(async (resolve, reject) => {
            const ids = [], style = `SECONDARY`, emoji = client.allEmojis.memoryGame.backside;
            
            // Push all existing ids into the array
            for(let i = 1; i <= boardSize; i++) for(let j = 1; j <= boardSize; j++) ids.push(`memory_card_${i}_${j}`);
 
            // get the empty card board
            const emptyCardBoard = [
                getButtonRow(ids.slice(0, boardSize).map(id => { return { emoji, id, style } })),
                getButtonRow(ids.slice(boardSize, boardSize * 2).map(id => { return { emoji, id, style } })),
                boardSize > 2 ? getButtonRow(ids.slice(boardSize * 2, boardSize * 3).map((id, index) => { if(boardSize == 3 && index >= 2) { return { label: "\u200b", id, style, disabled: true} } else return { emoji, id, style } })) : null,
                boardSize > 3 ? getButtonRow(ids.slice(boardSize * 3, boardSize * 4).map(id => { return { emoji, id, style } })) : null,
                boardSize > 4 ? getButtonRow(ids.slice(boardSize * 4, boardSize * 5).map((id, index) => { if(boardSize == 5 && index >= 4) { return { label: "\u200b", id, style, disabled: true} } else return { emoji, id, style } })) : null,
            ].filter(Boolean);
            /**
             * @INFO BOARD_EXPLANATION:
             * @INFO The board has ids for it's size!
             * @INFO Example Id: 3_4
             * @INFO | 1. Letter == Row Number (Index == 2 = 3 - 1) -
             * @INFO | 2. Letter == Colomn  Number (Indedx == 3 = 4 - 1)
            */

            // get a random player as the starter
            const CurrentUser = random_element([ user, EnemyUser ]);
            
            // send the game message
            var GameMessage = await channel.send({
                content: `${client.allEmojis.memory} \` | \` **${CurrentUser.tag}**'s Turn!\nPick 2 Cards and remember them: ${CurrentUser}!`,
                components: emptyCardBoard
            }).catch(console.warn);

            const getFinalBoard = () => {
                const GameEmojis = Object.values(client.allEmojis.memoryGame).filter(d => d != client.allEmojis.memoryGame.backside);
                let GameEmojiArray;
                //get 100% win gameBoard
                switch(boardSize){
                    case 2: GameEmojiArray = gameEmojis(GameEmojis.slice(0, 2)); break; // 2 different cards ( 2x2 = 4 == 2 wins)
                    case 3: GameEmojiArray = gameEmojis(GameEmojis.slice(0, 4)); break; // 4 different cards ( 3x3-1 = 8 == 4 wins)
                    case 4: GameEmojiArray = gameEmojis(GameEmojis); break; // 2 different cards ( 4x4 = 16 == 8 wins)
                    case 5: GameEmojiArray = gameEmojis([...GameEmojis, ...GameEmojis.slice(0, 4) ]); break; // 2 different cards ( 5x5-1 = 24, == 12 wins)
                }
                console.log(GameEmojiArray);
                const GameBoard = {};
                
                for(let i = 1; i <= boardSize; i++) {
                    for(let j = 1; j <= boardSize; j++) {
                        if((boardSize == 5 || boardSize == 3) && i == boardSize && j == boardSize) continue;
                        GameBoard[`${i}_${j}`] = GameEmojiArray[0];
                        GameEmojiArray.shift(); // remove the first one
                    }
                }
                return GameBoard;
            }
            
            // set the Game into the collection;
            client.memoryGame.set(GameMessage.id, {
                user: {
                    id: user.id,
                    user: user,
                    points: 0
                },
                enemy: {
                    id: EnemyUser.id,
                    user: EnemyUser,
                    points: 0
                },
                current: {
                    id: CurrentUser.id, 
                    user: CurrentUser,
                    first: null,
                    second: null
                },
                board: emptyCardBoard,
                finalBoard: getFinalBoard()
            });

            // resolve the Message
            return resolve(GameMessage);
        });
    },
    async handleGame(GameMessage, boardSize) {
        // static data
        const { client, id } = GameMessage;
        const { enemy, user, finalBoard } = client.memoryGame.get(id);

        // Create a message component interaction collector
        const filter = (i) => i.customId.includes(`memory_card_`) && i.message.id == id;
        
        const collector = GameMessage.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 600_000 });
        
        collector.on(`collect`, async (interaction) => {
            let gameData = client.memoryGame.get(id);
            const { member: { guild }, member } = interaction;
            const { board, current } = gameData;
            const bId = interaction.customId.replace(`memory_card_`, ``);
            // if it's not a player of the game
            if(![ enemy.id, user.id ].includes(member.id)) {
                return interaction.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `**You are not participating in this Game!**\nIt's a game between ${user.user} & ${enemy.user}.`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it's not the current User
            if(member.id != current.id) {
                return interaction.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `**It is ${current.user}'s turn, please wait!**`),
                    ephemeral: true 
                }).catch(console.warn);
            }

            if(!gameData.current.first) {
                gameData.current.first = bId; //set the first pic 

                await interaction.reply({ 
                    embeds: [
                        new MessageEmbed().setColor(client.colors.main)
                        .setTitle(`${client.allEmojis.accept} This is the first Card REMEMBER IT!`)
                        .setDescription(`*You can pick your next card ...*`)
                        .setImage(getEmojiURL(guild, finalBoard[bId]))
                    ],
                    ephemeral: true
                }).catch(console.warn);
                // wait 5 secs
                await delay(5_000);
                // edit the image away, so that they can't abuse it...
                interaction.editReply({
                    embeds: [
                        new MessageEmbed().setColor(client.colors.main)
                        .setTitle(`${client.allEmojis.timeout} Now Pick your Next Card!`)
                    ],
                    ephemeral: true
                }).catch(console.warn);
            } else if(gameData.current.first == bId) {
                // if he picked the same emoji twice
                return interaction.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `**You can't pick the same card twice!**`),
                    ephemeral: true 
                }).catch(console.warn);
            } else {
                gameData.current.second = bId;
                
                var firstEmoji = finalBoard[gameData.current.first];
                var secondEmoji = finalBoard[gameData.current.second];
                
                if(firstEmoji === secondEmoji) {
                    // raise the points
                    if(gameData.user.id == gameData.current.id) {
                        gameData.user.points++;
                    } else {
                        gameData.enemy.points++;
                    }
                    

                    // get the: [rowIndex+1, ButtonIndex+1]
                    const first = gameData.current.first.split(`_`);
                    const second = gameData.current.second.split(`_`);
                    // edit the components 
                    board[first[0] - 1].components[first[1] - 1].setEmoji(getReactionEmoji(firstEmoji)).setDisabled(true);
                    board[second[0] - 1].components[second[1] - 1].setEmoji(getReactionEmoji(secondEmoji)).setDisabled(true);
                    // transform it working again (discord.js is weird...)
                    gameData.board = board.map(({components}) => new MessageActionRow().addComponents(components));
                    
                    // if total points reached, then end the game
                    if(gameData.user.points + gameData.enemy.points >= MaxPoints[boardSize]) {
                        gameData.winner = gameData.user.points > gameData.enemy.points ? gameData.user.user : gameData.enemy.user
                        // Send info
                        interaction.reply({
                            embeds: [
                                new MessageEmbed().setColor(client.colors.gameend)
                                    .setTitle(`🎉 The Winner with is **__${gameData.winner.tag}__**!`)
                                    .addField(`__Stats of Player 1:__`, `>>> **User:** ${gameData.user.user}\n**Points:** \`${gameData.user.points}\``, true)
                                    .addField(`__Stats of Player 2:__`, `>>> **User:** ${gameData.enemy.user}\n**Points:** \`${gameData.enemy.points}\``, true)
                            ],
                            ephemeral: false
                        }).catch(console.warn)
                        // delete the game
                        client.memoryGame.delete(id);
                        // Updatae the message a last time
                        GameMessage.edit({
                            content: `${client.allEmojis.memory} \` | \` **Game Ended**!`,
                            components: gameData.board,
                        }).catch(console.warn);
                        return collector.stop(`ended`);
                    }

                    await interaction.reply({ 
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${client.allEmojis.accept} Congrats you got a Match of ${finalBoard[bId]}, this grants you 1 Point!`)
                            .setDescription(`*You now have \`${gameData.user.id == gameData.current.id ? gameData.user.points : gameData.enemy.points}\` Points and your Enemy: \`${gameData.user.id !== gameData.current.id ? gameData.user.points : gameData.enemy.points} Points\`*\n\n*You can pick again!*`)
                        ],
                        ephemeral: true
                    }).catch(console.warn);

                    // just reste the current user, u are allowed to play again!
                    gameData.current.first = null;
                    gameData.current.second = null;
                    // set the data
                    client.memoryGame.set(id, gameData);

                    collector.resetTimer(); // reset the timer

                    await GameMessage.edit({
                        content: `${client.allEmojis.memory} \` | \` **${gameData.current.user.tag}** got another turn as he/she/they got a Match!\nPick 2 Cards and remember them: ${gameData.current.user}!`,
                        components: gameData.board,
                    }).catch(console.warn);

                } else {
                    // change to the new current User
                    gameData.current.user = [ enemy.user, user.user ].find(d => d.id != gameData.current.id);
                    gameData.current.id = gameData.current.user.id;
                    gameData.current.first = null;
                    gameData.current.second = null;
                    // set the data
                    client.memoryGame.set(id, gameData);
                    collector.resetTimer(); // reset the timer

                    GameMessage.edit({
                        content: `${client.allEmojis.memory} \` | \` **${gameData.current.user.tag}**'s Turn!\nPick 2 Cards and remember them: ${gameData.current.user}!`,
                        components: gameData.board,
                    }).catch(console.warn);
                    //show the emoji
                    await interaction.reply({ 
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${client.allEmojis.accept} This is the second Card, REMEMBER IT!`)
                            .setDescription(`*That's your last pick and they aren't matching.*`)
                            .setImage(getEmojiURL(guild, finalBoard[bId]))
                        ],
                        ephemeral: true
                    }).catch(console.warn);
                    // wait 5 secs
                    await delay(5_000);
                    // edit the image away, so that they can't abuse it...
                    interaction.editReply({
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${client.allEmojis.timeout} That was your second pick! The Cards aren't matching!`)
                        ],
                        ephemeral: true
                    }).catch(console.warn);


                }


            }
        })
        collector.on(`end`, (collected, reason) => { 
            if(reason && reason == `ended`) {
                // Do nothing
            } else {
                let gameData = client.memoryGame.get(id)

                GameMessage.edit({
                    content: `${client.allEmojis.timeout} **Time ran out!**${gameData ? `\n> **${gameData.current.user.tag}** didn't react in time!` : ``}`,
                    components: [],
                }).catch(console.warn);

                client.memoryGame.delete(id);
            }
        })
    },
    cmdData: {
        name: `memory`,
        description: `Play a Game of Memory (find same cards)`,
        options:  [
            {
                name: `enemy`,
                description: `Against who do you want to play?`,
                required: true,
                type: 6
            },
            {
                name: `boardsize`,
                description: `How big should the playboard be?`,
                required: false,
                choices: [
                    { name: '2x2_up_to_2_points', value: '2' },
                    { name: '3x3_up_to_4_points', value: '3' },
                    { name: '4x4_up_to_8_points', value: '4' },
                    { name: '5x5_up_to_12_points', value: '5' },
                ],
                autocomplete: undefined,
                type: 3,
            }
        ],
        default_permission: undefined
    }
}

