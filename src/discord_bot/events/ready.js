const { color_log } = require("../../util/util.js");
module.exports = async (client) => {
    
    color_log(["FgGreen"], `Logged in in ${client.user.tag}`)
}