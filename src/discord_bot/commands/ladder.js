const { color_log, delay, getBaseData, random_element, getButtonRow, getDisabledComponents, getFooter, errorEmbedArray, random_number } = require(`../../util/util`);
const { MessageEmbed, MessageAttachment } = require(`discord.js`);
const Canvas = require('canvas');
// 2x2 == 2, 3x3 == 4, 4x4 == 8, 5x5 == 12
const { ladder: { SpecialMovesBoard, playerImages, positions, PlayerOffSets, boardSize, playersize, defaultplayersize } }= require("../../json/gameData.js")

module.exports = {
    async runCommand(client, i) {
        const { member: { guild }, user, options } = i;
        const DiceAmount = options.getString(`dice_amount`) ? Number(options.getString(`dice_amount`)) : 2
        const maxPlayers = options.getString(`maxplayers`) ? Number(options.getString(`maxplayers`)) : 4;

        // If the user (requester) or the enemy is already in a game-request return an error
        if(client.allGames.has(`Request_${user.id}`)) {
            return i.reply(getBaseData(client, guild, `${client.allEmojis.deny} **You are already having another Request, accept / deny it first!**\\n\\n> ${client.allGames.get(`Request_${user.id}`)}`)).catch(console.warn)
        }

        // If the user (requester) or the enemy is already in a game return an error
        if(client.allGames.has(`Game_${user.id}`)) {
            return i.reply(getBaseData(client, guild, `${client.allEmojis.deny} **You are already in a different Game, finish it first!**\\n\\n> ${client.allGames.get(`Game_${user.id}`)}`)).catch(console.warn)
        }


        const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : `en`;
        const {  } = client.la[ls].commands; //multilang (prob. no time to add this game to there...)
        

        // set them into the request collection

        const RequestData = { 
            embeds: [
                new MessageEmbed()
                    .setTitle(`A new Game has started! Click "join" to join it!`)
                    .addField(`__1 / ${maxPlayers} Players joined:__`, `${user}`, true)
                    .addField(`__${DiceAmount} Dices:__`, `${client.allEmojis.dice.repeat(DiceAmount)}`, true)
                    .setFooter(getFooter(client, guild))
                    .setColor(client.colors.main)
                    .setImage(client.allImages.ladder)
                    .setTimestamp()
            ], 
            components: [
                getButtonRow([
                    {emoji: client.allEmojis.accept, label: `Join Game`, id: `ladder_join`, style: `PRIMARY`, disabled: 1 == maxPlayers},
                    {emoji: client.allEmojis.dice, label: `Start Game`, id: `ladder_start`, style: `SUCCESS`},
                    {emoji: client.allEmojis.cancel, label: `Cancel Game`, id: `ladder_cancel`, style: `DANGER`},
                ])
            ],
            ephemeral: false
        };
        await i.reply(RequestData).catch(console.warn);
        // get the message of the i 
        let message = await i.fetchReply().catch(console.warn);
        
        client.allGames.set(`Request_${user.id}`, message.url);
        const joinedPlayers = [user.id];

        // Create a message component i collector
        const filter = (i) => i.customId.includes(`ladder_`) && i.message.id == message.id;
        
        const collector = message.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 60_000 });
        
        collector.on(`collect`, i => {
            // `modify` the customId
            let bId = i.customId.replace(`ladder_`, ``); 
            // if one of the 2 users and the id is cancel, then stop
            if(bId == `cancel`) {
                if(i.user.id == user.id) {
                    // update the request message and respond to the i
                    i.update({
                        components: getDisabledComponents(message.components),
                        embeds: [message.embeds[0].setTitle(`${client.allEmojis.cancel} **Cancelled it!**`)]    
                    }).catch(console.warn);
                    return collector.stop("end"); 
                } else {
                    return i.reply({
                        ephemeral: true,
                        content: `${client.allEmojis.deny} Only ${user} is allowed to cancel / start it!`
                    })
                }
            } 
            if(bId == `start`) {
                if(i.user.id == user.id) {
                    // update the request message and respond to the i
                    i.update({
                        components: getDisabledComponents(message.components),
                        embeds: [message.embeds[0].setTitle(`${client.allEmojis.dice} Started it!`)]    
                    }).catch(console.warn);
                    return collector.stop("start"); 
                } else {
                    return i.reply({
                        ephemeral: true,
                        content: `${client.allEmojis.deny} Only ${user} is allowed to cancel / start it!`
                    })
                }
            } 
            // if it`s deny
            if(bId == `join`) {
                if(joinedPlayers.includes(i.user.id)) {
                    return i.reply({
                        ephemeral: true,
                        content: `${client.allEmojis.deny} You already joined the game!`
                    })
                }
                if(joinedPlayers.length == maxPlayers) {
                    return i.reply({
                        ephemeral: true,
                        content: `${client.allEmojis.deny} There are already ${maxPlayers} Players!`
                    })
                }
                joinedPlayers.push(i.user.id)
                client.allGames.set(`Request_${i.user.id}`, message.url);
                const RequestData = { 
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`A new Game has started! Click "join" to join it!`)
                            .addField(`__${joinedPlayers.length} / ${maxPlayers} Players joined:__`, `${joinedPlayers.map(d => `<@${d}>`).join(", ")}`, true)
                            .addField(`__${DiceAmount} Dices:__`, `${client.allEmojis.dice.repeat(DiceAmount)}`, true)
                            .setFooter(getFooter(client, guild))
                            .setColor(client.colors.main)
                            .setImage(client.allImages.ladder)
                            .setTimestamp()
                    ], 
                    components: [
                        getButtonRow([
                            {emoji: client.allEmojis.accept, label: `Join Game`, id: `ladder_join`, style: `PRIMARY`, disabled: joinedPlayers.length == maxPlayers},
                            {emoji: client.allEmojis.dice, label: `Start Game`, id: `ladder_start`, style: `SUCCESS`},
                            {emoji: client.allEmojis.cancel, label: `Cancel Game`, id: `ladder_cancel`, style: `DANGER`},
                        ])
                    ],
                    ephemeral: false
                };
                // update the request message and respond to the i
                i.update(RequestData).catch(console.warn);
            }
        });
        // Once it has ended
        collector.on(`end`, (interacted, reason) => {
            for(const joinedPlayer of joinedPlayers) {
                client.allGames.delete(`Request_${joinedPlayer}`);
            }
            // Remove them from the request collection
            client.allGames.delete(`Request_${user.id}`);
            // if a selection has been made
            if(reason == `start`) {
                // start the game
                this.startGame(client, user, joinedPlayers, guild, message.channel, DiceAmount, ls).catch((e) => {
                    console.error(e);
                    // Edit the message so that they know the game has crahsed
                    message.edit({
                        components: getDisabledComponents(message.components),
                        embeds: errorEmbedArray(client, guild, user, 1, `Could not start the Game!\n${e.message}`)   
                    }).catch(console.warn)
                }).then((gameMessage) => {
                    // Edit the message so that they know the game has started!
                    message.edit({
                        components: getDisabledComponents(message.components),
                        embeds: [message.embeds[0].setTitle(`Game has started`)]    
                    }).catch(console.warn);
                    // continue handling this Game!
                    this.handleGame(gameMessage, DiceAmount, ls);
                })
            } else if (reason != "end"){
                // edit it that the time ran out
                message.edit({
                    components: getDisabledComponents(message.components),
                    embeds: errorEmbedArray(client, guild, user, 5, `${user} Sadly didn't start the game`)
                }).catch(console.warn)
            }
        });
    },
    async startGame(client, user, joinedPlayers, guild, channel, DiceAmount, ls) {
        return new Promise(async (resolve, reject) => {        

            // get a random player as the starter
            const CurrentUser = random_element(joinedPlayers.filter(d => d != client.user.id));


            const canvas = Canvas.createCanvas(934, boardSize);
            const ctx = canvas.getContext(`2d`);
            const bgimg = await Canvas.loadImage(client.allImages.ladder);
            ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);
            for(const player of joinedPlayers) {
                const index = joinedPlayers.findIndex(d => d == player);
                const playerImage = await Canvas.loadImage(playerImages[index]);
                ctx.drawImage(playerImage, positions[index].x, positions[index].y, defaultplayersize, defaultplayersize);
            }
            const attachment = new MessageAttachment(await canvas.toBuffer(), `board.png`);


            // send the game message
            var GameMessage = await channel.send({
                content: `${client.allEmojis.dice} **It's <@${CurrentUser}> turn! Come roll the dice!**`,
                files: [attachment],
                embeds: [
                    new MessageEmbed()
                    .setColor(client.colors.main)
                    .setImage(`attachment://board.png`)
                    .setFooter(getFooter(client, guild))
                    .setAuthor({
                        name: `${client.users.cache.get(CurrentUser) ? client.users.cache.get(CurrentUser).username : CurrentUser}' Turn!`,
                        iconURL: `${client.users.cache.get(CurrentUser) ? client.users.cache.get(CurrentUser).displayAvatarURL({dynamic: true}) : client.user.displayAvatarURL()}`,
                    })
                    .addFields(joinedPlayers.map((d, index) => {
                            return {
                                name: `__Player ${index + 1}:__`, 
                                value: `User: <@${d}>\nPosition: \`0\``, 
                                inline: false
                            }
                    }))
                ],
                components: [
                    getButtonRow([
                        {emoji: client.allEmojis.dice, label: `Roll Dice`, id: `ladder_dice`, style: `SUCCESS`},
                    ])
                ],
            }).catch(console.warn);

            // set the Game into the collection;
            client.ladderGame.set(GameMessage.id, {
                guildId: guild.id,
                players: joinedPlayers.map(d => {
                    return {
                        id: d,
                        position: 0,
                        rolledAmount: 0,
                    }
                }),
                current: {
                    id: CurrentUser,
                    rolled_dice: false,
                }
            });

            // Set them into the active game collection
            client.allGames.set(`Game_${user.id}`, GameMessage.url);
            for(const joinedPlayer of joinedPlayers) {
                client.allGames.set(`Game_${joinedPlayer}`, GameMessage.url);
            }

            // resolve the Message
            return resolve(GameMessage);
        });
    },
    async handleGame(GameMessage, DiceAmount, ls) {
        // static data
        const { client, id } = GameMessage;
        // Create a message component interaction collector
        const filter = (i) => i.customId.includes(`ladder_`) && i.message.id == id;
        const collector = GameMessage.createMessageComponentCollector({ componentType: `BUTTON`, filter, time: 60_000 });
        
        collector.on(`collect`, async (i) => {
            //static stuff
            const gameData = client.ladderGame.get(id);
            const { member: { guild }, member } = i;
            const { current } = gameData;
            //if not the right id somehow, return
            if(i.customId != "ladder_dice") return;
            // if it's not a player of the game
            if(![ ...gameData.players.map(d => d.id) ].includes(member.id)) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${client.allEmojis.deny} **You are not participating in this game!**`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it's not the current User
            if(member.id != current.id) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${client.allEmojis.deny} **It's not your turn, please wait for <@${current.id}> to pic!**`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            // if it's not the current User
            if(gameData.current.rolled_dice) {
                return i.reply({ 
                    embeds: errorEmbedArray(client, guild, member.user, 4, `${client.allEmojis.deny} **It's already rolling the dice ... please wait!**`),
                    ephemeral: true 
                }).catch(console.warn);
            }
            //set the current data "rolled_dice" to true, to prevent spam
            gameData.current.rolled_dice = true;
            var indexOfPlayer = gameData.players.findIndex(a => a.id == gameData.current.id);
            //reply with information
            await i.reply({ 
                content: `**Player ${indexOfPlayer + 1} (<@${gameData.current.id}>) is rolling the dice:**\n> ${client.allEmojis.diceRoll}`
            }).catch(console.error);
            //get the rolled data
            const rolled = await this.roll_dice(DiceAmount * 6, DiceAmount);
            //get the positions etc.
            const oldPosition = gameData.players.find(a => a.id == gameData.current.id).position;
            const newRawPosition = oldPosition + rolled;
            const specialMove = SpecialMovesBoard[newRawPosition] ? SpecialMovesBoard[newRawPosition] : false
            const newPosition = SpecialMovesBoard[newRawPosition] ? SpecialMovesBoard[newRawPosition].position : newRawPosition;
            //change the data of the player
            gameData.players[indexOfPlayer] = {
                id: gameData.current.id,
                position: newPosition,
                rolledAmount: gameData.players[indexOfPlayer].rolledAmount + 1
            };


            /**
             * @INFO BOARD IMAGE DISPLAY:
             */
            let attachment;
            //create the canvas
            const canvas = Canvas.createCanvas(934, boardSize);
            const ctx = canvas.getContext(`2d`);
            //load the background
            const bgimg = await Canvas.loadImage(client.allImages.ladder);
            ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);
            //Display the position of each player
            for(const player of gameData.players) {
                const index = gameData.players.findIndex(d => d.id == player.id);
                //if no real position yet, do this
                if(!player.rolledAmount || player.rolledAmount < 1) {
                    const playerImage = await Canvas.loadImage(playerImages[index]);
                    ctx.drawImage(playerImage, positions[index].x, positions[index].y, defaultplayersize, defaultplayersize);
                } else {
                    const otherplayerIndexes = gameData.players.filter(d => d.id != player.id && d.position == player.position);
                    const fieldSize = boardSize / 10;
                    const offSet = otherplayerIndexes.length > 0 ? PlayerOffSets[index] : { x: 10, y: 10 };
                    const imgPosPercent = 100 - (player.position >= 100 ? 0 : Math.floor((player.position / 10) % 10) * 10) ; // y
                    const imgPosPercent_col = Math.floor((player.position / 1) % 10 * 10) === 0 ? 100 : Math.floor((player.position / 1) % 10 * 10) // x 
                    const cords = {
                        x: boardSize * (imgPosPercent_col/100) - fieldSize + offSet.x,
                        y: boardSize * (imgPosPercent/100) - fieldSize + offSet.y
                    }
                    const size = {
                        width: otherplayerIndexes.length > 0 ? playersize : playersize + playersize / 2, 
                        height: otherplayerIndexes.length > 0 ? playersize : playersize + playersize / 2,
                    }
                    const playerImage = await Canvas.loadImage(playerImages[index]);
                    ctx.drawImage(playerImage, cords.x, cords.y, size.width, size.height);
                }
            }
            //set the attachment
            attachment = new MessageAttachment(await canvas.toBuffer(), `board.png`);
            



            //if the user won the game
            if(newPosition >= 100) {
                gameData.winner = {
                    id: gameData.current.id,
                    position: newPosition,
                    rolledAmount: gameData.players[indexOfPlayer].rolledAmount,
                };
                client.ladderGame.set(id, gameData);
                collector.stop();
            } else {
                //get the newplayer
                const nextPlayerIndex = gameData.players.length - 1 === indexOfPlayer ? 0 : indexOfPlayer + 1;
                gameData.current.id = gameData.players[nextPlayerIndex].id;
                gameData.current.rolled_dice = false;
                //save the data
                client.ladderGame.set(id, gameData);
                // reset the timer
                collector.resetTimer(); 
                // Update the Message
                await GameMessage.edit({
                    content: `${client.allEmojis.dice} It's <@${gameData.current.id}> turn! Come roll the dice!`,
                    files: [attachment],
                    embeds: [
                        new MessageEmbed()
                        .setColor(client.colors.main)
                        .setImage(`attachment://board.png`)
                        .setFooter(getFooter(client, guild))
                        .setAuthor({
                            name: `${client.users.cache.get(gameData.current.id) ? client.users.cache.get(gameData.current.id).username : gameData.current.id}' Turn!`,
                            iconURL: `${client.users.cache.get(gameData.current.id) ? client.users.cache.get(gameData.current.id).displayAvatarURL({dynamic: true}) : client.user.displayAvatarURL()}`,
                        })
                        .addFields(gameData.players.map((d, index) => {
                                return {
                                    name: `__Player ${index + 1}:__`, 
                                    value: `User: <@${d.id}>\nPosition: \`${d.position}\``, 
                                    inline: false
                                }
                        }))
                    ],
                }).catch(console.warn);
            }

            //show the result
            await i.editReply({ 
                content: `${client.allEmojis.dice} **\`Player ${indexOfPlayer + 1}\` (<@${gameData.players[indexOfPlayer].id}>) rolled \`${rolled}\`** and got to the Field: \`Field ${newRawPosition}\`!\n${specialMove ? `${specialMove.type == "snake" ? `${client.allEmojis.snake} **OHNO**! He/She/They stepped on a \`${specialMove.type} Field\` and will move backwards to` : `${client.allEmojis.ladder} **LUCKY**! He/She/They stepped on a \`${specialMove.type} Field\` and will move forwards to`}` : `He/She/They will move to`}  \`Field ${newPosition}\`!`
            }).catch(console.error);
            
            //wait 3 secs
            await delay(3_500);

            //delete the reply
            i.deleteReply().catch(console.error);
        })
        collector.on(`end`, async (interacted, reason) => { 
            const gameData = client.ladderGame.get(id);

            if(!gameData.winner) gameData.winner = gameData.players.sort((a,b) => b.position - a.position)[0]; //if the time ran out, then the one who got the furthest wins!

           
            // Remove them from the active game collection
            for(const player of gameData.players) {
                client.allGames.delete(`Game_${player.id}`);
            }

            // Here u could add databasing functions to save the points
            await client.db.saveGame(gameData, "ladder").then(() => {
                color_log([`Dim`], `Successfully saved the GAME (example of how to access user data is below [because lb etc. is exceeding the given task])`);
                // console.log(`New Game Data of:`, gameData.players[9].tag, client.db.cache.get(gameData.players[9].id))
            }).catch(() => {
                console.log(`Failed saving the GAME Data`);
            }); // code the function in the databasing script...
            
            // Edit the message to the RESULT
            GameMessage.edit({
                content: `${client.allEmojis.win} **The Game has ended and <@${gameData.winner.id}> Won after Rolling the dice \`${gameData.winner.rolledAmount} times\`**!${gameData.winner.position < 100 ? `\n> Because the time ran out, he got the furthest to the Position ${gameData.winner.position}` : ``}`,
                components: getDisabledComponents(gameData.board),
                embeds: [
                    new MessageEmbed().setColor(client.colors.gameend)
                        .setTitle(`${client.allEmojis.dice} **The Game has ended**`)
                        .setImage(`attachment://board.png`)
                        .addFields(gameData.players.map(d => {
                            return {
                                id: d.id, 
                                totalPoints: `${client.db.cache.get(d.id).playedGames.filter(m => m.type == "ladder").reduce((a,b) => a + b.points, 0)}`,
                                position: d.position,
                                rolledAmount: d.rolledAmount,
                            }
                        }).map((d, index) => {
                                const sortedIndex = gameData.players.sort((a,b) => b.position - a.position).findIndex(p => p.id == d.id)
                                return {
                                    name: `__Player ${index + 1}:__`, 
                                    value: `User: <@${d.id}>\n${sortedIndex == 0 ? ":first_place:" : sortedIndex == 1 ? ":second_place:" : sortedIndex == 2 ? ":third_place:" : sortedIndex}. Place ( \`== ${gameData.players.length > 1 ? sortedIndex == gameData.players.length - 1 ? 0 : (gameData.players.length - sortedIndex) * 1.5 : 0} Points\`) | Position: \`${d.position}\`\nTotal Points: \`${d.totalPoints}\``, 
                                    inline: false
                                }
                            }))
                ],
            }).catch(console.warn);
            

            // delete the game
            client.ladderGame.delete(id);
        })
    },
    async roll_dice(maxNumber, minNumber) {
        return new Promise(async (resolve, reject) => {
            const rolled_number = random_number(maxNumber, minNumber);
            resolve(rolled_number);
            return;
        })
    },
    cmdData: {
        name: `ladder`,
        description: `Play a Game of LADDER (snakes and ladders..)`,
        options:  [
            {
                name: `dice_amount`,
                description: `do you want 1 or 2 dices?`,
                required: false, 
                choices: [
                    { name: '1', value: '1' },
                    { name: '2', value: '2' },
                    { name: '3', value: '3' },
                    { name: '4', value: '4' },
                ],
                autocomplete: undefined,
                type: 3
            },
            {
                name: `maxplayers`,
                description: `How many plays including you can play?`,
                required: false,
                choices: [
                    { name: '1', value: '1' },
                    { name: '2', value: '2' },
                    { name: '3', value: '3' },
                    { name: '4', value: '4' },
                ],
                autocomplete: undefined,
                type: 3,
            }
        ],
        default_permission: undefined
    }
}

