const { MessageEmbed, MessageActionRow, MessageButton } = require(`discord.js`)

/**
 * 
 * @param {*} upperlimit OPTIONAL, default Number.MAX_VALUE
 * @param {*} lowerlimit OPTIONAL, default 0
 * @returns a random number between given limits
 */
const random_number = (upperlimit, lowerlimit) => {
    let min = lowerlimit ? lowerlimit : 0;
    let max = upperlimit ? upperlimit : Number.MAX_VALUE;
    return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * 
 * @param {*} array 
 * @returns a random element from the array
 */
const random_element = (array) => {
    //call a fake random number cause first ever math.random somehow doesn't give a random number
    const fakerandom = random_number(array.length - 1);
    //return the random element
    return array[random_number(array.length - 1)];
};

/**
 * 
 * @param {*} emoji 
 * @returns a reaction emoji of a given string of a MESSAGE EMOJI (useful for custom emojis)
 */
const getReactionEmoji = (emoji) => {
    if(emoji.includes(`<`)) {
        let transformed = emoji.replace(`<`, ``).replace(`>`, ``).split(`:`);
        return transformed[transformed.length - 1];
    } else {
        return emoji;
    }
}

/**
 * 
 * @param {*} Buttons 
 * @returns a button row of a given object
 */
const getButtonRow = (Buttons) => {
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
 * @param {*} time in ms
 * @returns Promise of the given time 
 */
const delay = (time) => {
    return new Promise((r, _) => setTimeout(() =>r(2), time))
}

/**
 * 
 * @param {*} n 
 * @returns Returns string of number less then 10 formatted to 2 letters long
 */
const set2string = (n) => {
    return (n < 10 ? '0' : '') + n;
}

/**
 * 
 * @param {*} n 
 * @returns formatted Millisconds in a length of 3
 */
const formatMS = (n) => {
    return n + (Number(n) < 100 ? '0' : '');
}

/**
 * 
 * @returns the current time string in a format of ddd DD-MM-YYYY HH:mm:ss.SSSS
 */
const getDateTimeString = () => {
    const date = new Date();
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
 * @param {*} Usercolors 
 * @param {*} text 
 * @param {*} dateEnabled 
 * @returns 
 */
const color_log = (Usercolors, text, dateEnabled = true) => { 
    const colors = require(`../json/validcolors.js`)
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
        console.log(color, text, colors.Reset)
    }
}

/**
 * 
 * @param {*} Usercolors 
 * @param {*} text 
 * @param {*} totallength 
 * @param {*} totalheight 
 */
const boxlog = (Usercolors, text, totallength = 100, totalheight = 5) => {
    var displaytext = `${` `.repeat(Math.floor((totallength - text.length) / 2))}${text}${` `.repeat(Math.ceil((totallength - text.length) / 2))}`
    var blank = ` `.repeat(displaytext.length - 1)
    var before = ``, after = ``;
    for(let i = 0; i <= Math.floor((totalheight - text.split(`\n`).length) / 2); i++) {
        before += `${i > 0 ? ` ` : ``}${blank}\n`;
        after += `${i > 0 ? ` ` : ``}\n${blank}`;
    }
    color_log(Usercolors, `${before}${displaytext}${after}`, false)
}

/**
 * 
 * @param {*} Usercolors 
 * @param {*} text 
 * @returns 
 */
const verifying_input = async (Usercolors, text) => {
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
 * @param {*} components
 * @returns all components but disabled 
 */
const getDisabledComponents = (MessageComponents) => {
    return MessageComponents.map(({components}) => {
        return new MessageActionRow()
            .addComponents(components.map(c => c.setDisabled(true)))
    });
}

/**
 * 
 * @param {*} client
 * @param {*} guild
 * @returns a footer Object
 */
const getFooter = (client, guild) => {
    return { 
        text: guild ? guild.name : client.user.username, 
        iconURL: guild ? guild.iconURL({ dynamic: true }) : client.user.displayAvatarURL() 
    };
}

/**
 * 
 * @param {*} client
 * @param {*} guild
 * @returns a author Object
 */
const getAuthor = (client, user) => {
    return { 
        name: user ? user.tag : client.user.username, 
        iconURL: user ? user.displayAvatarURL({ dynamic: true }) : client.user.displayAvatarURL(),
        url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2180368448&scope=bot%20applications.commands`
    };
}

const errorEmbedArray = (client, guild, user, type, text) => {
    let messages = [
        `${client.allEmojis.error} \` | \` Something went wrong.`, // type == 0
        `${client.allEmojis.error} \` | \` An Error occurred.`, // type == 1
        `${client.allEmojis.error} \` | \` Wrong Command Execution.`, // type == 2
        `${client.allEmojis.error} \` | \` Missing Parameter.`, // type == 3
        `${client.allEmojis.perms} \` | \` Not allowed.`, // type == 4
        `${client.allEmojis.timeout} \` | \` Time ran out.`, // type == 5
    ]
    return [
        new MessageEmbed()                    
            .setFooter(getFooter(client, guild))
            .setAuthor(getAuthor(client, user))
            .setColor(client.colors.error)
            .setTitle(`${type ? messages[type] : messages[0]}`)
            .setDescription(`>>> ${text}`)
            .setTimestamp()
    ]
}
const gameEmojis = (array) => {
    return shuffleArray([...array, ...array ])
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        j = Math.floor(Math.random() * (i + 1)); //call it twice cause Math.random() is not purely random
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const getEmojiURL = (guild, emoji) => {
    var Emoji = guild.emojis.cache.get(getReactionEmoji(emoji));
    return Emoji.url;
}

module.exports = {
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
    gameEmojis
};