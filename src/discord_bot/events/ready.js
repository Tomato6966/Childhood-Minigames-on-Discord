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
    // .name will be eval()
    const St_set = {
        delay: 15000,
        statuses: [
            { type: "PLAYING", name: "`/memory, Play Games of your Childhood!`" },
            { type: "WATCHING", name: "`${client.guilds.cache.size} Guilds & ${client.guilds.cache.filter((e) => e.memberCount).reduce((a, g) => a + g.memberCount, 0)} Members`" },
        ],
        counter: 0,
    }      
    // Loop through the statuses
    setInterval(() => { 
        //get the status from the current index 
        const status = St_set.statuses[St_set.counter];
        //Set the status
        client.user.setActivity({name: `${eval(status.name)}`, type: `${status.type}`}); 
        //raise the counter but if it's to big then reset it
        St_set.counter = St_set.counter < St_set.statuses.length-1 ? St_set.counter + 1 : 0;
    }, St_set.delay)
}