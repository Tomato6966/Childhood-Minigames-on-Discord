const { Collection } = require(`discord.js`);
const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v9`);
const { color_log } = require(`../util/util.js`);
const { readdirSync } = require(`fs`);
/**
 * 
 * @param {*} client 
 * @returns slash Commands ARRAY + adds them to the client.commands
 */
const getSlashCommands = async (client) => {
    return new Promise((resolve, _) => {
        const slashCommands = [];
        client.commands = new Collection();
        const command_files = readdirSync(`./src/discord_bot/commands`).filter(file => file.endsWith(`.js`));
        for(const file of command_files) {
            const command = require(`./commands/${file}`);
            slashCommands.push(command.cmdData);
            client.commands.set(command.cmdData.name, command);
        }
        resolve(slashCommands)
    })
}

const loadEvents = async (client) => {
    return new Promise((resolve, _) => {
        let amount = 0;
        const event_files = readdirSync(`./src/discord_bot/events/`).filter((file) => file.endsWith(".js"));
        for(const file of event_files) {
            const event = require(`./events/${file}`)
            let eventName = file.split(".")[0];
            amount++; //increment the event loading counter
            client.on(eventName, event.bind(null, client));
        }
        resolve(amount)
    })
}

/**
 * 
 * @param {*} client 
 * @param {*} configObject 
 * @returns Promise (true) and loads the slash with the REST API
 */
const loadSlash = async (client, { token, BotUserId, loadGlobal, toLoadGuild }) => {
    return new Promise(async (resolve, reject) => {
        //Loading the SlashCommands
        color_log([`Dim`], `Pulling the SlashCommands`);
        let slashCommands = await getSlashCommands(client).catch(console.warn);;
        if(slashCommands) color_log([`FgGreen`], `Found ${slashCommands.length} slash commands`);
        
        //Create a new Rest entpoint
        const rest = new REST({ version: `9` }).setToken(token);

        try {
            color_log([`Dim`], `Pushing the SlashCommands`);
            if(loadGlobal) {
                await rest.put(Routes.applicationCommands(BotUserId), { 
                    body: slashCommands 
                });
                color_log([`FgGreen`], `Successfully pushed the Global Slash-Commands`);
            } else {
                await rest.put(Routes.applicationGuildCommands(BotUserId, toLoadGuild), { 
                    body: slashCommands 
                })
                color_log([`FgGreen`], `Successfully pushed the Guild Slash-Commands`);
            }
            //resolve (.then) the promise
            resolve(true)
        } catch(e) {
            if(e) console.error(e);
            //reject (.catch) the promise
            reject(e)
        }
    })
}

/**
 * 
 * @param {*} client 
 * @param {*} configObject 
 * @returns Nothing, but loads the bot handlers and events
 */
const startBot = async (client, { token }) => {
    //Loading the SlashCommands
    let slashCommands;
    if(!client.commands || client.commands.size === 0) {
        color_log([`Dim`], `Loading the Slash Commands for the Bot Client`);
        slashCommands = await getSlashCommands(client).catch(console.warn);;
        if(slashCommands) color_log([`FgGreen`], `Found and loaded ${slashCommands.length} Slash Commands`);
    }
    
    if(!client.allEmojis) {
        client.allEmojis = require("../json/emojis.js");
    }
    if(!client.colors) {
        client.colors = require("../json/colors.js");
    }
    if(!client.allImages) {
        client.allImages = require("../json/images.js");
    }

    //login with the bot token
    client.login(token)  

    color_log([`Dim`], `Loading the Events`);

    //load all events etc.
    let events = await loadEvents(client).catch(console.warn);
    if(events) color_log([`FgGreen`], `Found and loaded ${events} Events`);
    
    color_log([`Dim`], `Loading the Games`);
    client.memoryGame = new Collection();
    
    return true;
}




module.exports = {
    loadSlash,
    startBot,
}
