const { MessageEmbed, MessageActionRow, MessageButton } = require(`discord.js`)

/**
 * 
 * @param {*} upperlimit OPTIONAL, default Number.MAX_VALUE
 * @param {*} lowerlimit OPTIONAL, default 0
 * @returns a random number between given limits
 */
const random_number = (upperlimit = Number.MAX_VALUE, lowerlimit = 0) => {
    return Math.floor(Math.random() * (upperlimit - lowerlimit + 1) + lowerlimit);
};

/**
 * 
 * @param {*} array Required, if not provided [] will be returned
 * @returns a random element from the array
 */
const random_element = (array) => {
    if(!array) return []; // Returning so it doesn't crash

    //call a fake random number cause first ever math.random somehow doesn't give a random number
    const fakerandom = random_number(array.length - 1);
    
    //return the random element
    return array[random_number(array.length - 1)];
};

/**
 * 
 * @param {*} emoji required, if not provided "❌" will be returned
 * @returns a reaction emoji of a given string of a MESSAGE EMOJI (useful for custom emojis)
 */
const getReactionEmoji = (emoji) => {
    if(!emoji) return "❌"; // Returning so it doesn't crash
    
    if(emoji.includes(`<`)) {
        let transformed = emoji.replace(`<`, ``).replace(`>`, ``).split(`:`);
        return transformed[transformed.length - 1];
    } else {
        return emoji;
    }
}

/**
 * 
 * @param {*} Buttons Required, if not provided null will be returned
 * @returns a button row of a given object
 */
const getButtonRow = (Buttons) => {
    if(!Buttons) return null; // Returning so it doesn't crash

    return new MessageActionRow().addComponents(
        Buttons.map((d, index) => {
            if(!d.id || (!d.label && !d.emoji)) {
                color_log(`FgRed`, `Button Element with Index ${index} missing id and label/emoji`);
                return null;
            }
            let Button = new MessageButton();
            if(d.label) Button.setLabel(d.label);
            if(d.emoji) Button.setEmoji(d.emoji);
            if(d.id) Button.setCustomId(d.id);
            if(d.disabled) Button.setDisabled(d.disabled);
            if(d.style) Button.setStyle(d.style); 
            else Button.setStyle(`SECONDARY`);
            return Button;
        }).filter(Boolean)
    )
}

/**
 * 
 * @param {*} time in ms, Required, default = 10 ms (Less could cause bugs in timeouts and promises etc.)
 * @returns Promise of the given time 
 */
const delay = (time = 10) => {
    return new Promise((r, _) => setTimeout(() =>r(2), time))
}

/**
 * 
 * @param {*} n Required, if not provied "00" will be returned 
 * @returns Returns string of number less then 10 formatted to 2 letters long
 */
const set2string = (n) => {
    if(!n) return "00"; // Returning so it doesn't crash

    return (n < 10 ? '0' : '') + n;
}

/**
 * 
 * @param {*} n Required, if not provied "000" will be returned 
 * @returns formatted Millisconds in a length of 3
 */
const formatMS = (n) => {
    if(!n) return "000"; // Returning so it doesn't crash
    return n + (Number(n) < 100 ? '0' : ''); 
}

/**
 * @param {*} timestamp Optional, default = Current Time ( Date.now() ) 
 * @returns the current time string in a format of ddd DD-MM-YYYY HH:mm:ss.SSSS
 */
const getDateTimeString = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const DD = set2string(date.getDate()); //The Day
    const MM = set2string(date.getMonth() + 1); //The Month
    const YYYY = date.getFullYear(); //The Year
    const HH = set2string(date.getHours()); //Hours
    const mm = set2string(date.getMinutes()); //Minutes
    const ss = set2string(date.getSeconds()); //Seconds
    const SSSS = formatMS(date.getMilliseconds()); //Milliseconds
    const ddd = days[ date.getDay() ]; //get the day of the week
    //ddd DD-MM-YYYY HH:mm:ss.SSSS
    return `${ddd} ${DD}-${MM}-${YYYY} ${HH}:${mm}:${ss}.${SSSS}`
}

/**
 * 
 * @param {*} Usercolors (Required/Optional), default = ["FgRed"]
 * @param {*} text (Required/Optional), default = "No Text added"
 * @param {*} dateEnabled (Required/Optional), default = true
 * @returns a colored log, colros took from: "https://en.wikipedia.org/wiki/ANSI_escape_code#Colors"
 */
const color_log = (Usercolors = ["FgRed"], text = "No Text added", dateEnabled = true) => { 
    const colors = require(`../json/validcolors.js`);

    var color = Usercolors.map(color => Object.keys(colors).includes(color) ? colors[color] : colors.FgWhite).join(``); 

    if(dateEnabled) {
        var DateString = getDateTimeString();
        //ddd DD-MM-YYYY HH:mm:ss.SSSS
        return console.log(
            colors.FgCyan, DateString, colors.Reset,
            colors.FgMagenta, `[::]`, colors.Reset, 
            color, text, colors.Reset
        );
    } else {
        return console.log(color, text, colors.Reset);
    }
}

/**
 * 
 * @param {*} Usercolors (Required/Optional), default = ["FgBlack", "BgRed"]
 * @param {*} text (Required/Optional), default = "No Text Added"
 * @param {*} totallength (Required/Optional), default = 100
 * @param {*} totalheight (Required/Optional), default = 5
 * @returns a colored Log with the provided colors and text and size inside of a COLOR BOX
 */
const boxlog = (Usercolors = ["FgBlack", "BgRed"], text = "No Text Added", totallength = 100, totalheight = 5) => {
    var displaytext = `${` `.repeat(Math.floor((totallength - text.length) / 2))}${text}${` `.repeat(Math.ceil((totallength - text.length) / 2))}`
    var blank = ` `.repeat(displaytext.length - 1)
    var before = ``, after = ``;
    for(let i = 0; i <= Math.floor((totalheight - text.split(`\n`).length) / 2); i++) {
        before += `${i > 0 ? ` ` : ``}${blank}\n`;
        after += `${i > 0 ? ` ` : ``}\n${blank}`;
    }
    return color_log(Usercolors, `${before}${displaytext}${after}`, false);
}

/**
 * 
 * @param {*} Usercolors (Required/Optional), default = ["FgBlack", "BgBlue"]
 * @param {*} text (Required/Optional), default = "Verifying ..."
 * @returns Promise( of showing a console animation )
 */
const verifying_input = async (Usercolors = ["FgBlack", "BgBlue"], text = "Verifying ...") => {
    return new Promise(async (r, _) => {
        for(const load of [`/`, `-`, `\\`, `|`, `/`, `-`, `\\`, `|`]){
            console.clear()
            boxlog(Usercolors, `[${load}] ${text} [${load}]`)
            await delay(250)
        }
        return r(true);
    })
}

/**
 * 
 * @param {*} components Required, if not provided [] will be returned
 * @returns all components but disabled 
 */
const getDisabledComponents = (MessageComponents) => {
    if(!MessageComponents) return []; // Returning so it doesn't crash

    return MessageComponents.map(({components}) => {
        return new MessageActionRow()
            .addComponents(components.map(c => c.setDisabled(true)))
    });
}

/**
 * 
 * @param {*} client Required
 * @param {*} guild Required
 * @returns a footer Object
 */
const getFooter = (client, guild) => {
    if(!client || !guild) return {
        text: "❌ Missing getAuthor Parameter client/guild"
    }; // Returning so it doesn't crash

    return { 
        text: guild ? guild.name : client.user.username, 
        iconURL: guild ? guild.iconURL({ dynamic: true }) : client.user.displayAvatarURL() 
    };
}

/**
 * 
 * @param {*} client Required
 * @param {*} guild Required
 * @returns a author Object
 */
const getAuthor = (client, user) => {
    if(!client || !user) return {
        name: "❌ Missing getAuthor Parameter client/user"
    }; // Returning so it doesn't crash

    return { 
        name: user ? user.tag : client.user.username, 
        iconURL: user ? user.displayAvatarURL({ dynamic: true }) : client.user.displayAvatarURL(),
        url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2180368448&scope=bot%20applications.commands`
    };
}

/**
 * 
 * @param {*} client Required
 * @param {*} guild Required 
 * @param {*} user Required
 * @param {*} type Optional, default = 0
 * @param {*} text [Required/Optional], default = "No Description Added"
 * @returns 
 */
const errorEmbedArray = (client, guild, user, type = 0, text = "No Description Added") => {
    if(!client || !guild || !user) return [
        new MessageEmbed()
            .setColor("RED")
            .setTitle("❌ Missing ErrorEmbedArray Parameter \`client\`/\`guild\`/\`user\`")
    ]; // Returning so it doesn't crash

    let messages = [
        `${client.allEmojis.error} \` | \` Something went wrong.`, // type == 0
        `${client.allEmojis.error} \` | \` An Error occurred.`, // type == 1
        `${client.allEmojis.error} \` | \` Wrong Command Execution.`, // type == 2
        `${client.allEmojis.error} \` | \` Missing Parameter.`, // type == 3
        `${client.allEmojis.perms} \` | \` Not allowed.`, // type == 4
        `${client.allEmojis.timeout} \` | \` Time ran out.`, // type == 5
        `${client.allEmojis.timeout} \` | \` Not found.`, // type == 6
    ]
    return [
        new MessageEmbed()                    
            .setFooter(getFooter(client, guild))
            .setAuthor(getAuthor(client, user))
            .setColor(client.colors.error)
            .setTitle(`${messages[type]}`)
            .setDescription(`>>> ${text}`)
            .setTimestamp()
    ]
}

/**
 * 
 * @param {*} array Required, if not provided [] will be returned 
 * @returns returns the game Emojis (the array are the different cards, but u need two of them ...)
 */
const gameEmojis = (array) => {
    if(!array) return []; // Returning so it doesn't crash

    return shuffleArray([...array, ...array ])
}

/**
 * 
 * @param {*} array Required, if not provided [] will be returned 
 * @returns returns a shuffled Array based on the "Fisher–Yates Shuffle" Algorithm (https://en.wikipedia.org/wiki/Fisher–Yates_shuffle)
 */
const shuffleArray = (array) => {
    if(!array) return []; // Returning so it doesn't crash

    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        j = Math.floor(Math.random() * (i + 1)); //call it twice cause Math.random() is not purely random
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * 
 * @param {*} guild Required, if not provided null will be returned 
 * @param {*} emoji Required, if not provided null will be returned 
 * @returns returns a URL from a given EMOJI, if the bot shares the GUILD
 */
const getEmojiURL = (guild, emoji) => {
    if(!guild || !emoji) return null;

    var Emoji = guild.emojis.cache.get(getReactionEmoji(emoji));
    return Emoji ? Emoji.url : null;
}

/**
 * 
 * @param {*} client Required if not provided error object will be returned
 * @param {*} guild Required if not provided error object will be returned
 * @param {*} text Required, default = "❌ No Text Added"
 * @param {*} Ephemeral Optional, default = true
 * @param {*} Color Optional default = client.colors.main
 * @returns a base OBJECT RESPONSE DATA for replying an interaction (can be used for sending messages too) as an RICH-EMBED
*/
const getBaseData = (client, guild, text = "❌ No Text Added", Ephemeral = true, Color, Components = []) => {
    if(!client || !guild) return { 
        ephemeral: Ephemeral, 
        content: `❌ Missing BaseData Parameters (CLIENT and GUILD)`
    };

    return { 
        embeds: [ 
            new MessageEmbed()
                .setTitle(text)
                .setColor(Color ? Color : client.colors.main)
                .setFooter(getFooter(client, guild))
        ], 
        ephemeral: true,
        components: Components
    }
}

/**
 * @INFO Exporting all Functions so that they can be used
 */
module.exports = {
    getBaseData,
    random_number,
    boxlog,
    delay,
    color_log,
    random_element,
    verifying_input,
    getButtonRow,
    getReactionEmoji,
    getDisabledComponents,
    getFooter,
    getAuthor,
    errorEmbedArray,
    shuffleArray,
    getEmojiURL,
    gameEmojis,
    getDateTimeString,
    avgPoints: (d) => d.playedGames ? Math.floor((d.playedGames.reduce((x,y) => x + y.points, 0) / d.playedGames.length)*100)/100 : Math.floor((d.reduce((x,y) => x + y.points, 0) / d.length)*100)/100,
    getPoints: (d) => d.playedGames ? d.playedGames.reduce((a,b) => a + b.points, 0) : d.reduce((a,b) => a + b.points, 0)
};