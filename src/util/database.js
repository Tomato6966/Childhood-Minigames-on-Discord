const { Collection } = require("discord.js");
const { writeFile, readFile, existsSync } = require('fs');
const { delay } = require("./util.js");
let dbFile = `./src/json/database/data.json`;
/**
  * @returns promise of the WHOLE Db
 */
const getRawData = () => {
    return new Promise((resolve, reject) => {
        // get the file
        readFile(dbFile, (e, data) => {
            try {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                const jsonData = data ? JSON.parse(data) : {};
                    
                return resolve(jsonData);
            }catch (e){
                if (e) {
                    console.error(e);
                    reject(e);
                }
            }
        })
    })
}

/**
  * @returns promise of the Collection DB + updates db.cache,
 */
const updateCache = async () => {
    return new Promise(async (resolve, reject) => {
        const rawData = await getRawData().catch(console.error);
        if(rawData) {
            const DB = new Collection();
            if(rawData && Object.keys(rawData).length > 0 ) {
                for(const [key, value] of Object.entries(rawData))
                    DB.set(key, value);
            }
            module.exports.cache = DB;
            resolve(DB);
            return 
        }
    })
}


/**
 * Example Usage:
    const data = await client.db.get(message.guild.id);
 * @param {*} key 
 * @param {*} data 
 * @returns promise and then setted data
 */
const get = (key) => {
    return new Promise((resolve, reject) => {
        if(!key) reject(new Error("No Key added"));
        // get the file
        readFile(dbFile, (e, data) => {
            try {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                const jsonData = JSON.parse(data);

                if(!jsonData[`${key}`]) {
                    return resolve(undefined);
                }

                return resolve(jsonData[`${key}`]);
            }catch (e){
                if (e) {
                    console.error(e);
                    reject(e);
                }
            }
        })
    })
}

/**
 * Example Usage:
    const data = await client.db.set(message.guild.id, {
        prefix: "!"
    });
 * @param {*} key 
 * @param {*} data 
 * @returns promise and then setted data
 */
const set = (key, data) => {
    return new Promise(async (resolve, reject) => {
        if(!key) reject(new Error("No Key added"));
        if(!data || typeof data !== "object") reject(new Error("No Data of OBJECT added"));
        
        const rawData = await getRawData();
        rawData[`${key}`] = data;
        // update the file
        writeFile(dbFile, JSON.stringify(rawData), (e) => {
            try {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                updateCache();
                return resolve(data);
            }catch (e){
                if (e) {
                    console.error(e);
                    reject(e);
                }
            }
        });
    })
}



/**
 * Example Usage:
    const perGuildData = {
        "prefix": "!",
        "lang": "en"
    };
    var data = {};
    client.guilds.cache.each(({id}) => {return data[id] = perGuildData });
    
    data = await client.db.setRaw(data);
 * @param {*} key 
 * @param {*} data 
 * @returns promise and then setted data
 */
const setRawData = (data) => {
    return new Promise(async (resolve, reject) => {
        if(!data || typeof data !== "object") reject(new Error("No Data of OBJECT added"));
        // update the file
        writeFile(dbFile, JSON.stringify(data), (e) => {
            try {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                updateCache();
                return resolve(data);
            }catch (e){
                if (e) {
                    console.error(e);
                    reject(e);
                }
            }
        });
    })
}

/**
  * @param {*} path , the path to the database! (Optional)
  * sets the cache + returns the current db data
 */
const init = (path = dbFile) => {
    return new Promise(async (resolve, reject) => {
        if(path != dbFile) dbFile = path;
        try {
            if (!existsSync(path)) {
                writeFileSync(path, {}); // Create the file
            }
        } catch(err) {
            console.error(err)
        }
        const db = await updateCache(); //create the cache
        resolve(db);
    })
}

/**
  * Saves the game stats
 */
const saveGame = (gameData, Type = "default") => {
    return new Promise(async (resolve, reject) => {
        try {

            const rawData = await getRawData().catch(console.error);
            if(!rawData) return reject(new Error("No rawData found"));

            if(Type == "memory") {
                setUserData(gameData.user);
                setUserData(gameData.enemy);
            } else if(Type == "ladder") {
                gameData.players.forEach(d => {
                    setUserData(d);
                })
            }
            
            function setUserData(user) {
                if(Type == "memory") {
                    if(rawData[`${user.id}`]) {
                        if(rawData[`${user.id}`].playedGames) {
                            // add to the wongames
                            rawData[`${user.id}`].playedGames.push({
                                points: user.points,
                                guild: gameData.guildId,
                                boardSize: gameData.boardSize,
                                type: Type,
                            })
                        } else {
                            // set the first wongame
                            rawData[`${user.id}`].playedGames = [{
                                points: user.points,
                                guild: gameData.guildId,
                                boardSize: gameData.boardSize,
                                type: Type,
                            }];
                        }
                    } else {
                        // set the first user data 
                        rawData[`${user.id}`] = {
                            type: "user",
                            id: user.id,
                            playedGames: [{
                                points: user.points,
                                guild: gameData.guildId,
                                boardSize: gameData.boardSize,
                                type: Type,
                            }]
                        };
                    } 
                } else if(Type == "ladder") {
                    if(rawData[`${user.id}`]) {
                        if(rawData[`${user.id}`].playedGames) {
                            // add to the wongames
                            rawData[`${user.id}`].playedGames.push({
                                points: gameData.players.sort((a,b) => a.position - b.position).findIndex(p => p.id == user.id) * 1.5,
                                guild: gameData.guildId,
                                type: Type,
                            })
                        } else {
                            // set the first wongame
                            rawData[`${user.id}`].playedGames = [{
                                points: gameData.players.sort((a,b) => a.position - b.position).findIndex(p => p.id == user.id) * 1.5,
                                guild: gameData.guildId,
                                type: Type,
                            }];
                        }
                    } else {
                        // set the first user data 
                        rawData[`${user.id}`] = {
                            type: "user",
                            id: user.id,
                            playedGames: [{
                                points: gameData.players.sort((a,b) => a.position - b.position).findIndex(p => p.id == user.id) * 1.5,
                                guild: gameData.guildId,
                                type: Type,
                            }]
                        };
                    } 
                }
            }

            await setRawData(rawData);

            await updateCache();

            resolve(true);

        } catch(e){
            console.error(e);
            reject(e);
        }
    });
};

module.exports = {
    init,
    cache: new Collection(),
    get,
    set,
    getRawData,
    getRaw: getRawData,
    setRawData,
    setRaw: setRawData,
    updateCache,
    saveGame
}