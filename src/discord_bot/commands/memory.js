const { shuffleArray, color_log, delay, getEmojiURL, getBaseData, getReactionEmoji, gameEmojis, random_element, getButtonRow, getDisabledComponents, getFooter, errorEmbedArray } = require(`../../util/util`);
const { MessageEmbed, MessageActionRow } = require(`discord.js`)
// 2x2 == 2, 3x3 == 4, 4x4 == 8, 5x5 == 12
const MaxPoints = { 2: 2, 3: 4, 4: 8, 5: 12 };
module.exports = {
    async runCommand(client, i) {
        const { member: { guild }, user, options } = i;
        const EnemyUser = options.getUser(`enemy`);
        const boardSize = options.getString(`boardsize`) ? Number(options.getString(`boardsize`)) : 4;
        const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : `en`;
        const { alone, error1,  error3, request_user, request_enemy, game_user, game_enemy, request } = client.la[ls].commands.memory;
        if(!EnemyUser) {
            return i.reply({ embeds: errorEmbedArray(client, guild, user, 3, `${eval(error1)}`), ephemeral: true }).catch(console.warn)
        }

        if(EnemyUser.bot) {
            if(EnemyUser.id == client.user.id) {
                // no need of sending info
                // await i.reply(getBaseData(client, guild, `${client.allEmojis.accept} AI-MODE!`)).catch(console.warn);
            } else return i.reply({ embeds: errorEmbedArray(client, guild, user, 4, `${eval(error3)}`), ephemeral: true }).catch(console.warn)
        }
        
        // If the user (requester) or the enemy is already in a game-request return an error
        if(client.allGames.has(`Request_${user.id}`)) {
            return i.reply(getBaseData(client, guild, `${eval(request_user)}`)).catch(console.warn)
        }
        if(client.allGames.has(`Request_${EnemyUser.id}`)) {
            return i.reply(getBaseData(client, guild, `${eval(request_enemy)}`)).catch(console.warn)
        }

        // If the user (requester) or the enemy is already in a game return an error
        if(client.allGames.has(`Game_${user.id}`)) {
            return i.reply(getBaseData(client, guild, `${eval(game_user)}`)).catch(console.warn)
        }
        if(client.allGames.has(`Game_${EnemyUser.id}`)) {
            return i.reply(getBaseData(client, guild, `${eval(game_enemy)}`)).catch(console.warn)
        }
        // allow him / her to play alone
        if(EnemyUser.id == user.id) {
            await i.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setTitle(`${eval(alone.title)}`)
                        .setDescription(`${eval(alone.description)}`)
                        .setFooter(getFooter(client, guild))
                        .setColor(client.colors.main)
                        .setTimestamp()
                ], 
                components: [
                    getButtonRow([
                        {emoji: client.allEmojis.accept, id: `alonememory_accept`, style: `PRIMARY`},
                        {emoji: client.allEmojis.deny, id: `alonememory_deny`, style: `SECONDARY`},
                    ])
                ],
                ephemeral: true
            }).catch(console.warn);
    
            // get the message of the i 
            let message = await i.fetchReply().catch(console.warn);;
            
            // Create a message component i collector
            const filter = (i) => i.customId.includes(`alonememory_`) && i.message.id == message.id;
            
            const interacted = await message.awaitMessageComponent({ componentType: `BUTTON`, filter, max: 1, time: 60_000 }).catch(() => {});
            
            if(interacted && interacted.customId === `alonememory_accept`) {
                interacted.update(getBaseData(client, guild, `${eval(alone.accept)}`))
            } else if(interacted && interacted.customId === `alonememory_deny`) {
                return interacted.update(getBaseData(client, guild, `${eval(alone.deny)}`))
            }
        }

        const RequestData = { 
            content: `<@${EnemyUser.id}>`,
            embeds: [
                new MessageEmbed()
                    .setTitle(`${eval(request.title)}`)
                    .addField(`${eval(request.field1.key)}`, `${eval(request.field3.value)}`, true)
                    .addField(`${eval(request.field2.key)}`, `${eval(request.field3.value)}`, true)
                    .addField(`${eval(request.field3.key)}`, `${eval(request.field3.value)}`)
                    .setDescription(`${eval(request.description)}`)
                    .setFooter(getFooter(client, guild))
                    .setColor(client.colors.main)
                    .setImage(client.allImages.memory)
                    .setTimestamp()
            ], 
            components: [
                getButtonRow([
                    {emoji: client.allEmojis.accept, label: `${eval(request.buttons.accept)}`, id: `memory_accept`, style: `PRIMARY`},
                    {emoji: client.allEmojis.deny, label: `${eval(request.buttons.deny)}`, id: `memory_deny`, style: `SECONDARY`},
                    {emoji: client.allEmojis.cancel, label: `${eval(request.buttons.cancel)}`, id: `memory_cancel`, style: `DANGER`},
                ])
            ],
            ephemeral: false
        };
        let message;

        if(i.replied) {
            message = await i.channel.send(RequestData).catch(console.warn);
        }
        else {
            await i.reply(RequestData).catch(console.warn);
            // get the message of the i 
            message = await i.fetchReply().catch(console.warn);
        }


        // set them into the request collection
        client.allGames.set(`Request_${user.id}`, message.url);
        client.allGames.set(`Request_${EnemyUser.id}`, message.url);

        // Create a message component i collector
        const filter = (i) => i.customId.includes(`memory_`) && i.message.id == message.id;
        
        const collector = message.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 60_000 });
        
        if(EnemyUser.id == client.user.id) {
            setTimeout(() => {
                collector.stop(`ai`)
            }, client.ws.ping * 2 > 1000 ? 1000 : client.ws.ping * 2);
        }
        collector.on(`collect`, i => {
            // `modify` the customId
            let bId = i.customId.replace(`memory_`, ``); 
            // if one of the 2 users and the id is cancel, then stop
            if(bId == `cancel` && [EnemyUser.id, user.id].includes(i.user.id)) {
                // update the request message and respond to the i
                i.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${eval(request.cancelled)}`).setDescription(`\u200b`)]    
                }).catch(console.warn);
                return collector.stop(); 
            } 
            // if the user is not the requested one
            if(i.user.id != EnemyUser.id) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, user, 4, `${eval(request.not_allowed)}`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it`s deny
            if(bId == `deny`) {
                // update the request message and respond to the i
                i.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${eval(request.denied)}`).setDescription(`\u200b`)]    
                }).catch(console.warn);
                return collector.stop(); 
            } else  {
                // update the request message and respond to the i
                i.update({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: [message.embeds[0].setTitle(`${eval(request.accepted)}`).setDescription(`\u200b`)]    
                }).catch(console.warn);
                return collector.stop();
            }
        });
        // Once it has ended
        collector.on(`end`, (interacted, reason) => {
            // Remove them from the request collection
            client.allGames.delete(`Request_${user.id}`);
            client.allGames.delete(`Request_${EnemyUser.id}`);
            // if a selection has been made
            if(reason == `ai` || interacted.size > 0) {
                // if it got cancelled or denied, return
                if(reason != `ai` && [`cancel`, `deny`].includes(interacted.first().customId.replace(`memory_`, ``))) return;
                
                // start the game
                this.startGame(client, user, EnemyUser, guild, message.channel, boardSize, ls).catch((e) => {
                    console.error(e);
                    // Edit the message so that they know the game has crahsed
                    message.edit({
                        components: getDisabledComponents(message.components),
                        content: message.content,
                        embeds: errorEmbedArray(client, guild, user, 1, `${eval(request.error_start)}`)   
                    }).catch(console.warn)
                }).then((gameMessage) => {
                    // Edit the message so that they know the game has started!
                    message.edit({
                        components: getDisabledComponents(message.components),
                        content: message.content,
                        embeds: [message.embeds[0].setTitle(`${eval(request.started)}`).setDescription(`${eval(request.started_desc)}`)]    
                    }).catch(console.warn);
                    // continue handling this Game!
                    this.handleGame(gameMessage, boardSize, ls);
                })
            } else {
                // edit it that the time ran out
                message.edit({
                    components: getDisabledComponents(message.components),
                    content: message.content,
                    embeds: errorEmbedArray(client, guild, user, 5, `${eval(request.timeout)}`)
                }).catch(console.warn)
            }
        });
    },
    async startGame(client, user, EnemyUser, guild, channel, boardSize, ls) {
        return new Promise(async (resolve, reject) => {
            let ids = [];
            const { turn } = client.la[ls].commands.memory.game, style = `SECONDARY`, emoji = client.allEmojis.memoryGame.backside;
        
            // Push all existing ids into the array
            for(let i = 1; i <= boardSize; i++) for(let j = 1; j <= boardSize; j++) ids.push(`memory_card_${i}_${j}`);
            // get the empty card board
            const emptyCardBoard = [
                getButtonRow((ids).slice(0, boardSize).map(id => { return { emoji, id, style } })),
                getButtonRow(ids.slice(boardSize, boardSize * 2).map(id => { return { emoji, id, style } })),
                boardSize > 2 ? getButtonRow(ids.slice(boardSize * 2, boardSize * 3).map((id, index) => { if(boardSize == 3 && index >= 2) { return { label: `\u200b`, id, style, disabled: true} } else return { emoji, id, style } })) : null,
                boardSize > 3 ? getButtonRow(ids.slice(boardSize * 3, boardSize * 4).map(id => { return { emoji, id, style } })) : null,
                boardSize > 4 ? getButtonRow(ids.slice(boardSize * 4, boardSize * 5).map((id, index) => { if(boardSize == 5 && index >= 4) { return { label: `\u200b`, id, style, disabled: true} } else return { emoji, id, style } })) : null,
            ].filter(Boolean);
            /**
             * @INFO BOARD_EXPLANATION:
             * @INFO The board has ids for it's size!
             * @INFO Example Id: 3_4
             * @INFO | 1. Letter == Row Number (Index == 2 = 3 - 1) -
             * @INFO | 2. Letter == Colomn  Number (Indedx == 3 = 4 - 1)
            */

            // get a random player as the starter
            const CurrentUser = random_element([ user, EnemyUser ].filter(d => d.id != client.user.id));
            // send the game message
            var GameMessage = await channel.send({
                content: `${eval(turn)}`,
                components: emptyCardBoard
            }).catch(console.warn);

            const getFinalBoard = () => {
                const GameEmojis = shuffleArray(Object.values(client.allEmojis.memoryGame).filter(d => d != client.allEmojis.memoryGame.backside));
                let GameEmojiArray;
                // get 100% win gameBoard
                switch(boardSize){
                    case 2: GameEmojiArray = gameEmojis(GameEmojis.slice(0, 2)); break; // 2 different cards ( 2x2 = 4 == 2 wins)
                    case 3: GameEmojiArray = gameEmojis(GameEmojis.slice(0, 4)); break; // 4 different cards ( 3x3-1 = 8 == 4 wins)
                    case 4: GameEmojiArray = gameEmojis(GameEmojis); break; // 2 different cards ( 4x4 = 16 == 8 wins)
                    case 5: GameEmojiArray = gameEmojis([...GameEmojis, ...GameEmojis.slice(0, 4) ]); break; // 2 different cards ( 5x5-1 = 24, == 12 wins)
                }
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
                guildId: guild.id,
                boardSize: boardSize,
                finalBoard: getFinalBoard()
            });

            // Set them into the active game collection
            client.allGames.set(`Game_${user.id}`, GameMessage.url);
            client.allGames.set(`Game_${EnemyUser.id}`, GameMessage.url);

            // resolve the Message
            return resolve(GameMessage);
        });
    },
    async handleGame(GameMessage, boardSize, ls) {
        // static data
        const { client, id } = GameMessage;
        const { enemy, user, finalBoard } = client.memoryGame.get(id);
        const { aimatch, ainomatch, notplaying, notturn, firstpic, secondpic, editedpic, notsamecard, match, matchturn, currentturn, finishpic, end } = client.la[ls].commands.memory.game;    
        
        // Create a message component interaction collector
        const filter = (i) => i.customId.includes(`memory_card_`) && i.message.id == id;
        const collector = GameMessage.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 60_000 });
        
        collector.on(`collect`, async (i) => {
            const gameData = client.memoryGame.get(id);
            const { member: { guild }, member } = i;
            const { board, current } = gameData;
            const bId = i.customId.replace(`memory_card_`, ``);
            // if it's not a player of the game
            if(![ enemy.id, user.id ].includes(member.id)) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${eval(notplaying)}`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it's not the current User
            if(member.id != current.id) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${eval(notturn)}`),
                    ephemeral: true 
                }).catch(console.warn);
            }

            if(!gameData.current.first) {
                gameData.current.first = bId; // set the first pic 

                await i.reply({ 
                    embeds: [
                        new MessageEmbed().setColor(client.colors.main)
                        .setTitle(`${eval(firstpic.title)}`)
                        .setDescription(`${eval(firstpic.description)}`)
                        .setImage(getEmojiURL(guild, finalBoard[bId]))
                    ],
                    ephemeral: true
                }).catch(console.warn);
                // wait 3.5 secs
                await delay(3_500);
                // edit the image away, so that they can't abuse it...
                i.editReply({
                    embeds: [
                        new MessageEmbed().setColor(client.colors.main)
                        .setTitle(`${eval(editedpic)}`)
                    ],
                    ephemeral: true
                }).catch(console.warn);
            } else if(gameData.current.first == bId) {
                // if he picked the same emoji twice
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${eval(notsamecard)}`),
                    ephemeral: true 
                }).catch(console.warn);
            } else {
                gameData.current.second = bId;
                // Get both emojis from the finalBoard
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
                        // Update the message a last time
                        i.deferUpdate().catch(console.warn);
                        // End the game
                        return collector.stop(`ended`);
                    }

                    //show information that u got a match
                    await i.reply({ 
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${eval(match.title)}`)
                            .setDescription(`${eval(match.description)}`)
                        ],
                        ephemeral: true
                    }).catch(console.warn);
                    // just reset the current user, u are allowed to play again!
                    gameData.current.first = null;
                    gameData.current.second = null;
                    // set the data
                    client.memoryGame.set(id, gameData);
                    // reset the timer
                    collector.resetTimer(); 
                    // Update the Message
                    await GameMessage.edit({
                        content: `${eval(matchturn)}`,
                        components: gameData.board,
                    }).catch(console.warn);
                } else {
                    // change to the new current User
                    gameData.current.user = [ enemy.user, user.user ].find(d => d.id != gameData.current.id) || user.user;
                    gameData.current.id = gameData.current.user.id;
                    gameData.current.first = null;
                    gameData.current.second = null;
                    // set the data
                    client.memoryGame.set(id, gameData);
                    // reset the timer
                    collector.resetTimer(); 
                    // Update the Message
                    GameMessage.edit({
                        content: `${eval(currentturn)}`,
                        components: gameData.board,
                    }).catch(console.warn);
                    // show the emoji
                    await i.reply({ 
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${eval(secondpic.title)}`)
                            .setDescription(`${eval(secondpic.description)}`)
                            .setImage(getEmojiURL(guild, finalBoard[bId]))
                        ],
                        ephemeral: true
                    }).catch(console.warn);
                    // wait 3.5 secs
                    await delay(3_500);
                    // edit the image away, so that they can't abuse it...
                    await i.editReply({
                        embeds: [
                            new MessageEmbed().setColor(client.colors.main)
                            .setTitle(`${eval(finishpic)}`)
                        ],
                        ephemeral: true
                    }).catch(console.warn);


                    var aipic = gameData.current.user.id === client.user.id ? 1 : null;
                    await CheckMove();

                    function CheckMove(after_x_pics_100_per_cent){
                        return new Promise(async (res, rej) => {
                            await delay(1_500); // wait 3.5 secs before the next pic;        
                            // If the new current user is the bot ... ai 
                            if(gameData.current.user.id === client.user.id) {
                                var array = Object.keys(gameData.finalBoard).filter(d => {
                                    var picked = [];
                                    gameData.board.forEach(d => d.components.forEach(d => d.disabled ? picked.push(d.customId) : null));
                                    return !picked.includes(d);
                                })
                                // get the 100% match pic, board length OR the provide length
                                var pic_100 = after_x_pics_100_per_cent ? after_x_pics_100_per_cent : gameData.board.length;
                                // raise the pic amount
                                aipic++;
                                // if only 2 cards left 100% win
                                if(array.length == 2) {
                                    gameData.current.first = array[0];
                                    gameData.current.first = array[1];
                                } else {
                                    // 1 / 2, 1 / 3, 1 / 4, 1 / 5
                                    var picChance = aipic > pic_100 ? 1 : 1 / (array.length + array.length / 2);
                                    // Pic a random element
                                    gameData.current.first = random_element(array);
                                    //get the pic chance to see if the second should be the same aka match or not
                                    gameData.current.second = Math.random() < picChance ? array.filter(d => d != gameData.current.first).find(d => gameData.finalBoard[d] == gameData.finalBoard[gameData.current.first]) : random_element(array.filter(d => d != gameData.current.first));
                                }
                                // reset the ai pic if needed
                                aipic = aipic > pic_100 ? 0 : aipic;
                                
                                let aiMessage = `${eval(currentturn)}\n${eval(ainomatch)}`;
        
                                // get the: [rowIndex+1, ButtonIndex+1]
                                const first = gameData.current.first.split(`_`);
                                const second = gameData.current.second.split(`_`);                
                                // Get both emojis from the finalBoard
                                var firstEmoji = finalBoard[gameData.current.first];
                                var secondEmoji = finalBoard[gameData.current.second];
                                // If the AI got a MATCH
                                if(firstEmoji === secondEmoji) {
                                    aiMessage = `${eval(matchturn)}\n${eval(aimatch)}`; //change the aiMessage
                                    // raise the points
                                    gameData.enemy.points++;
                                    // edit the components 
                                    board[first[0] - 1].components[first[1] - 1].setEmoji(getReactionEmoji(firstEmoji)).setDisabled(true);
                                    board[second[0] - 1].components[second[1] - 1].setEmoji(getReactionEmoji(secondEmoji)).setDisabled(true);
                                    // transform it working again (discord.js is weird...)
                                    gameData.board = board.map(({components}) => new MessageActionRow().addComponents(components));
        
                                    // if total points reached, then end the game
                                    if(gameData.user.points + gameData.enemy.points >= MaxPoints[boardSize]) {
                                        // End the game
                                        return collector.stop(`ended`);
                                    }
                                } else {
                                    // just reset the current user, u are allowed to play again!
                                    gameData.current.user = [ enemy.user, user.user ].find(d => d.id != gameData.current.id) || user.user;
                                    gameData.current.id = gameData.current.user.id;
                                    gameData.current.first = null;
                                    gameData.current.second = null;
                                }
                                // set the data
                                client.memoryGame.set(id, gameData);
                                // reset the timer
                                collector.resetTimer(); 
                                // Update the Message
                                await GameMessage.edit({
                                    content: `${aiMessage}`,
                                    components: gameData.board,
                                }).catch(console.warn);
                                CheckMove();
                                return res(true); 
                            } else {
                                return res(false);
                            }
                        })
                    }
                }
            }
        })
        collector.on(`end`, async (interacted, reason) => { 
            const gameData = client.memoryGame.get(id)
            gameData.winner = gameData.user.points > gameData.enemy.points ? gameData.user.user : gameData.user.points != gameData.enemy.points ? gameData.enemy.user : null;
            
            let extraString1 = ``, extraString2 = ``;

            // Here u could add databasing functions to save the points
            await client.db.saveGame(gameData, "memory").then(() => {
                color_log([`Dim`], `Successfully saved the GAME (example of how to access user data is below [because lb etc. is exceeding the given task])`);
                // console.log(`New Game Data of:`, gameData.user.user.tag, client.db.cache.get(gameData.user.id))
                // console.log(`New Game Data of:`, gameData.enemy.user.tag, client.db.cache.get(gameData.enemy.id))
                extraString1 = ` (\`${client.db.cache.get(gameData.user.id).playedGames.filter(m => m.type == "memory").reduce((a,b) => a + b.points, 0)} in Total\`)`
                extraString2 = ` (\`${client.db.cache.get(gameData.enemy.id).playedGames.filter(m => m.type == "memory").reduce((a,b) => a + b.points, 0)} in Total\`)`
            }).catch(() => {
                console.log(`Failed saving the GAME Data`);
            }); // code the function in the databasing script...

            // Edit the message to the RESULT
            GameMessage.edit({
                content: `${eval(end.content)}`,
                components: getDisabledComponents(gameData.board),
                embeds: [
                    new MessageEmbed().setColor(client.colors.gameend)
                        .setTitle(`${eval(end.title)}`)
                        .addField(`${eval(end.field1.key)}`, `${eval(end.field1.value)}${extraString1}`, true)
                        .addField(`${eval(end.field2.key)}`, `${eval(end.field2.value)}${extraString2}`, true)
                ],
            }).catch(console.warn);
            
           
            // Remove them from the active game collection
            client.allGames.delete(`Game_${gameData.user.id}`);
            client.allGames.delete(`Game_${gameData.enemy.id}`);

            // delete the game
            client.memoryGame.delete(id);
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

