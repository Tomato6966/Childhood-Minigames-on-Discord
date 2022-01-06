const { color_log } = require(`../../util/util.js`);
module.exports = async (client, guild) => {
    color_log([`FgGreen`], `Left ${guild.name}`);
    const rawData = client.db.getRawData();
    delete rawData[guild.id];
    //Ensure the db
    await client.db.setRawData(rawData);
    color_log([`Dim`], `Removed ${guild.name} from the DB`);
    
}