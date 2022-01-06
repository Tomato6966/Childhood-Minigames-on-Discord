const { color_log } = require(`../../util/util.js`);
module.exports = async (client, guild) => {
    color_log([`FgGreen`], `Joined ${guild.name}`);
    //Ensure the db
    await client.db.set(guild.id, { lang: "en", type: "guild" });
    color_log([`Dim`], `Added ${guild.name} to the DB with ENGLISH`);
    
}