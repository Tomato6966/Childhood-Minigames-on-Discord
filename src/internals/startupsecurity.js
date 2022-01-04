const { createInterface } = require(`readline`);
const { questions } = require("../json/startupsecurity.json")
const { random_element, color_log, verifying_input, boxlog, delay } = require("../util/util.js");
const keyword = "Documatic"
module.exports = {
    start: async () => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        
        rl.question(`${[" | ", " | ", " | "].join("\n")}${random_element(questions)}\n | ::> `, async (answer) => {
            if(answer.toLowerCase() === keyword.toLowerCase()) {
                console.clear();
                await verifying_input(["BgBlue", "FgYellow"], "Verifying Input").catch(console.warn);
                

                //Display text with animation
                for(let i = 0; i <= 5; i++) {
                    console.clear();
                    boxlog(["BgGreen", "FgBlack"], `OMG NO WAY ${"!".repeat(i)}`, 100, 5);
                    await delay(200).catch(console.warn);
                }


                //wait 1 sek until next message
                await delay(1000).catch(console.warn);
                //Display text with animation
                for(let i = 0; i <= 3; i++) {
                    console.clear();
                    boxlog(["BgGreen", "FgBlack"], `How do you know that ${".".repeat(i)}`, 100, 5);
                    await delay(250).catch(console.warn);
                }


                //wait 1 sek until next message
                await delay(1000).catch(console.warn);
                //Display text with animation
                for(let i = 0; i <= 3; i++) {
                    console.clear();
                    boxlog(["BgGreen", "FgBlack"], `I'm bypassing you and starting the bot ${".".repeat(i)}`, 100, 5);
                    await delay(250).catch(console.warn);
                }


                rl.close(); //close the connection
                require(`./bot.js`)(); //start the bot
            } else {
                console.clear();

                //Display text
                var text = `WRONG ANSWER BAHAHAHAH You dumbo! It's "${keyword}"`;
                for(let i = 0; i <= text.length; i++) {
                    console.clear();
                    boxlog(["BgRed", "FgBlack"], `${text.slice(0, i)}`, 100, 5);
                    await delay(100).catch(console.warn);
                }
                //wait 1 second
                await delay(1000).catch(console.warn);
                
                rl.close(); //close the connection
            }
        })
    },
    quickStart: async () => {
        console.clear();
        boxlog(["BgGreen", "FgBlack"], `Now Starting the Bot`, 100, 5);
        require(`./bot.js`)(); //start the bot
    }
}