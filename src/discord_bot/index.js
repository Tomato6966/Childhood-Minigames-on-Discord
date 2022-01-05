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
        color_log([`Dim`], `Loading the Events`);
        let amount = 0;
        const event_files = readdirSync(`./src/discord_bot/events/`).filter((file) => file.endsWith(`.js`));
        for(const file of event_files) {
            const event = require(`./events/${file}`)
            let eventName = file.split(`.`)[0];
            amount++; // increment the event loading counter
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
        // Loading the SlashCommands
        color_log([`Dim`], `Pulling the SlashCommands`);
        const slashCommands = await getSlashCommands(client).catch(console.warn);;
        if(slashCommands) color_log([`FgGreen`], `Found ${slashCommands.length} slash commands`);
        
        color_log([`Dim`], `Logging in the Bot and setting the Slash Commands`);
        
        // Log into the bot, but if something went wrong, error it and reject the promise
        client.login(token).catch((e) => {
            if(e) console.error(e);
            // reject (.catch) the promise
            reject(e);
        });
        
        // Once the bot is ready show it
        client.once("ready", async () => {
            try {
                if(loadGlobal){
                    await client.application.commands.set(slashCommands); // set the global commands
                    color_log([`FgGreen`], `Successfully pushed the Global Slash-Commands`);
                } else {
                    // get the guild and throw error if not on right guild
                    const guild = client.guilds.cache.get(toLoadGuild); 
                    if(!guild) throw new TypeError(`I'm not on the Guild with the Id ${toLoadGuild}`);
                    
                    await guild.commands.set(slashCommands); // set the guild commands
                    color_log([`FgGreen`], `Successfully pushed the Guild Slash-Commands`);
                }
                // resolve (.then) the promise
                resolve(true);
            } catch(e) {
                if(e) console.error(e);
                // reject (.catch) the promise
                reject(e)
            }
        })
        /* 
        
        // [ This is the faster way, because u dont need to login with the bot 
        //   but i changed it to have "less" dependencies for the hackathon ]
        
        const { REST } = require(`@discordjs/rest`);
        const { Routes } = require(`discord-api-types/v9`);
        // Create a new Rest entpoint
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
            // resolve (.then) the promise
            resolve(true)
        } catch(e) {
            if(e) console.error(e);
            // reject (.catch) the promise
            reject(e)
        }
        */
    })
}

/**
 * 
 * @param {*} client 
 * @param {*} configObject 
 * @returns Nothing, but loads the bot handlers and events
 */
const startBot = async (client, { token }) => {
    // Loading the SlashCommands
    if(client.commands.size === 0) {
        color_log([`Dim`], `Loading the Slash-Commands for the Bot Client`);
        const slashCommands = await getSlashCommands(client).catch(console.warn);;
        if(slashCommands) color_log([`FgGreen`], `Found and loaded ${slashCommands.length} Slash-Commands`);
    }
    
    // login with the bot token
    client.login(token);

    // load all events etc.
    let events = await loadEvents(client).catch(console.warn);
    if(events) color_log([`FgGreen`], `Found and loaded ${events} Events`);
    
    return true;
}




module.exports = {
    loadSlash,
    startBot,
}
