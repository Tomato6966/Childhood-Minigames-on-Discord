const { getBaseData, errorEmbedArray } = require(`../../util/util`);
module.exports = {
    async runCommand(client, i) {
        // static Data Deconstruction
        const { member, member: { guild }, options, createdTimestamp, user } = i;
        const { bot, ping } = client.allEmojis;
        const Langs = {
            "bs": "Bosnia",
            "de": "German",
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "hi": "Hindi",
            "ku": "Kurdish",
            "uk": "Ukranian"
            
        }
        // Additional Command Options
        const Option = options?.getString(`change_language`);
        const ls = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : "en";
        const { missing_perms, error, current } = client.la[ls].commands.setlanguage;
        
        // If it should be the bot ping
        if (Option) {
            if(!member.permissions.has("ADMINISTRATOR") && !member.permissions.has("MANAGE_GUILD")) {
                    return i.reply({ embeds: errorEmbedArray(client, guild, user, 4, `${eval(missing_perms)}`), ephemeral: true }).catch(console.warn)
            }
            const guildData = client.db.cache.get(guild.id) || { lang: "en", type: "guild" }
            guildData.lang = Option;
            try {
                const ls2 = client.db.cache.has(guild.id) ? client.db.cache.get(guild.id).lang : "en";
                const { success } = client.la[ls2].commands.setlanguage;
                await client.db.set(guild.id, guildData);
                i.reply(getBaseData(client, guild, `${eval(success)}`)).catch(console.warn);
            } catch (e){
                    console.error(e);
                if(!member.permissions.has("ADMINISTRATOR") && !member.permissions.has("MANAGE_GUILD")) {
                    return i.reply({ embeds: errorEmbedArray(client, guild, user, 1, `${eval(error)}`), ephemeral: true }).catch(console.warn)
                }
            }

        } else {
            // Otherwise just show the api ping
            return i.reply(getBaseData(client, guild, `${eval(current)}`)).catch(console.warn);
        }
    },
    cmdData: {
        name: 'language',
        description: 'Changes the Language',
        options: [ 
            {
                choices: [
                        { name: 'german', value: 'de' },
                        { name: 'bosnia', value: 'bs' },
                        { name: 'english', value: 'en' },
                        { name: 'french', value: 'fr' },
                        { name: 'spanish', value: 'es' },
                        { name: 'hindi', value: 'hi' },
                        { name: 'kurdish', value: 'ku' },
                        { name: 'ukrainian', value: 'uk' },
                ],
                autocomplete: undefined,
                type: 3,
                name: 'change_language',
                description: 'What should be the new Language?',
                required: false
            }
        ],
        default_permission: undefined
    }
}