
const { Client, Intents, Collection } = require(`discord.js`);
const { color_log } = require(`./src/util/util.js`);
const config = require(`./src/discord_bot/config/config.json`);
const BotLoader = require(`./src/discord_bot/index`);
const { readdirSync } = require(`fs`);
(async () => {
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
    client.ladderGame = new Collection();
    client.commands = new Collection();
    client.allEmojis = require(`./src/json/emojis.js`);
    client.colors = require(`./src/json/colors.js`);
    client.allImages = require(`./src/json/images.js`);


    client.db = require(`./src/util/database.js`);
    await client.db.init(); // initialize the database

    // Multiple Languages
    client.la = {};
    readdirSync(`./src/json/languages`).filter(file => file.endsWith(`.json`)).forEach((lang => {
        client.la[`${lang.replace(`.json`, ``)}`] = require(`./src/json/languages/${lang}`)
    }));
    Object.freeze(client.la);
    BotLoader.startBot(client, config);
})();