const { color_log } = require(`../../util/util.js`);
module.exports = async (client) => {
    color_log([`FgGreen`], `Logged in in ${client.user.tag}`);

    /*
    * EXAMPLE WAY OF MANIPULATING THE DB SO THAT THE TYPE IS FORCE-SET TO MEMORY OF "ONLY USERS" AND "ONLY PLAYED GAMES"

    const rawData = await client.db.getRawData();
    console.log("ITERATE", Object.entries(rawData).length);
    for(const [key, value] of Object.entries(rawData)) {
        if(value.type && value.type == "user") {
            rawData[key].playedGames.map(d => {
                d[`type`] = "memory";
            });
        } else continue;
    }
    client.db.setRawData(rawData);
    
    */
}