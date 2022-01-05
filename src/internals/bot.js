const { Client, Intents, Collection } = require(`discord.js`);
const { color_log, delay } = require(`../util/util.js`);
const config = require(`../discord_bot/config/config.json`);
const BotLoader = require(`../discord_bot/index`);
const { createInterface } = require(`readline`);

module.exports = () => {

    color_log([`FgGreen`], `Creating the Bot Client`);
    const client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
        ],
        allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
        shards: 'auto',
        failIfNotExists: false
    });

    // define client variables
    client.allGames = new Collection();
    client.memoryGame = new Collection();
    client.commands = new Collection();
    client.allEmojis = require(`../json/emojis.js`);
    client.colors = require(`../json/colors.js`);
    client.allImages = require(`../json/images.js`);
    // client.db = require(`../json/database.js`); // Example way for ur database

    
    const rl = createInterface({ input: process.stdin, output: process.stdout });
            
    rl.question(`${[" | ", " | ", " | "].join("\n")}What do you want to do?\n | -) Enter '1' for Starting the Bot\n | -) Enter '2' for Loading the Slash Commands (1 time only, if loadGlobal == true)\n | -) Enter 'No (n)' for Stopping the process!\n | ::> `, async (answer) => {
        switch(answer) {
            case `1`: {
                BotLoader.startBot(client, config);
                rl.close();
            } break;
    
            case `2`: {
                BotLoader.loadSlash(client, config).then(() => {
                    rl.question(`${[" | ", " | ", " | "].join("\n")}What do you want to do?\n | -) Enter 'Yes (y)' for Starting the Bot\n | -) Enter 'No (n)' for Stopping the process!\n | ::> `, async (answer) => {
                        if(answer.toLowerCase().includes(`y`)) {
                            BotLoader.startBot(client, config);
                            rl.close();
                        } else {
                            color_log([`FgRed`], `Stopping the Programm in 1 Second ...`);
                            await delay(1000).catch(console.warn);
                            rl.close();
                            process.exit(1);
                        }
                    }) 
                }).catch(async (e) => {
                    color_log([`FgRed`], `Something went wrong! Stopping the Programm in 1 Second ...`);
                    await delay(1000).catch(console.warn);
                    rl.close();
                    process.exit(1);
                })
            } break;
    
            default : {
                color_log([`FgRed`], `Stopping the Programm in 1 Second ...`);
                await delay(1000).catch(console.warn);
                rl.close();
                process.exit(1);
            }
        }
    
    })
}