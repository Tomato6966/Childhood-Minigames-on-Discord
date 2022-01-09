const { MessageEmbed } = require(`discord.js`)
const { getFooter, getBaseData } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        const { member: { guild }, options } = i;
        const Option = options?.getString(`what_info`);
        const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : "en";
        const { memory, about_me } = client.la[ls].commands.info;
        
        if (Option && Option == `memory_game`) {
            await i.reply({ 
                embeds: [
                    new MessageEmbed()
                        .setColor(client.colors.main)
                        .setTitle(`${eval(memory.title)}`)
                        .addField(`${eval(memory.field1.key)}`, `${eval(memory.field1.value)}`)
                        .addField(`${eval(memory.field2.key)}`, `${eval(memory.field2.value)}`)
                        .setImage(client.allImages.memory)
                        .setFooter(getFooter(client, guild))
                ], 
                ephemeral: true 
            }).catch(console.warn);
        } else if(Option && Option == `ladder_game`) {await i.reply({ 
            embeds: [
                new MessageEmbed()
                    .setColor(client.colors.main)
                    .setTitle(`${client.allEmojis.dice} **Ladder Game**`)
                    .addField(`__What to do:__`, `> *You join the game and roll the dice, when u land on a \`LADDER\` Field you'll then get boosted up! Otherwise, when you land on a \`SNAKE\` Field you drop down ;(*\n> *You can set the DICEAMOUNT while starting it, the more dices the more fields you can walk at once!*\n> *You can also set a maximum PlayerAmount from 1-4, aka you can play alone too!*\n\n> *Up to 4 Players can play at the same time*`)
                    .setImage(client.allImages.ladder)
                    .setFooter(getFooter(client, guild))
            ], 
            ephemeral: true 
        }).catch(console.warn);
        } else {
            await i.reply(getBaseData(client, guild, `${eval(about_me.title)}`)).catch(console.warn);
        }
    },
    cmdData: {
        name: 'info',
        description: 'Information about me / stuff from me',
        options: [ 
            {
                choices: [
                        { name: 'about_me', value: 'about_me' },
                        { name: 'memory_game', value: 'memory_game' },
                        { name: 'ladder_game', value: 'ladder_game' }
                ],
                autocomplete: undefined,
                type: 3,
                name: 'what_info',
                description: 'What Info do you want to get?',
                required: false
            }
        ],
        default_permission: undefined
    }
}