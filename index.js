// require the security start option
const security = require("./src/internals/startupsecurity.js");
//create an interface for asking the start type
const { createInterface } = require(`readline`);
const rl = createInterface({ input: process.stdin, output: process.stdout });
//ask how the bot should start
rl.question(`${[" | ", " | ", " | "].join("\n")}What do you want to do?\n | -) Enter 'Yes (y)' Normal Start\n | -) Enter 'No (n)' for Quick Start (Skips the Quiz)\n | ::> `, async (answer) => {
    if(answer.toLowerCase().includes(`y`)) {
        rl.close(); //close the connection
        security.start(); //normal start the bot
    } else {
        rl.close(); //close the connection
        security.quickStart(); //quick start the bot
    }
})