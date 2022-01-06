# 😎 Documatic-Hackathon

*Offical Repository for the Documatic Hackathon, participated by [`Tomato#6966`](https://tomato6966.xyz)*

<a href="https://discord.com/api/oauth2/authorize?client_id=927938123936198787&permissions=2180368448&scope=bot%20applications.commands">
    <img src="https://imgur.com/8hftTNl.png" style="height: 350px;border-radius:50px;">
</a>
<a href="https://discord.gg/XGAHheQxde">
    <img src="https://discord.com/api/guilds/927935858810708040/widget.png?style=banner4" style="height: 350px;border-radius:50px;">
</a>


***

# 📋 Table of Contents

- [**__1. Bot Information__**](https://github.com/Tomato6966/Documatic-Hackathon/blob/main/README.md#-bot-information)
- [**__2. How does this Bot work ?__**](https://github.com/Tomato6966/Documatic-Hackathon/#-how-does-this-bot-work-)
- [**__3. All Games__**](https://github.com/Tomato6966/Documatic-Hackathon/#-all-games)
    - [3.1 Memory Game](https://github.com/Tomato6966/Documatic-Hackathon/#-memory-game)
- [**__4. Self Hosting Tutorial__**](https://github.com/Tomato6966/Documatic-Hackathon/#%EF%B8%8F-self-hosting-tutorial)
- [**__5. Commands List__**](https://github.com/Tomato6966/Documatic-Hackathon/#-commands-list)
- [**__6. To Do List and History__**](https://github.com/Tomato6966/Documatic-Hackathon/#-to-do-and-history)

***

## 🤖 Bot Information!

 - [Invite it, play with it, use it!](https://discord.com/api/oauth2/authorize?client_id=927938123936198787&permissions=2180368448&scope=bot%20applications.commands) but make sure to grant **`SLASH COMMAND` & `EMBED` PERMISSIONS**. Official Discord Server: https://discord.gg/XGAHheQxde
 - This Bot got coded for the [Documatic](https://www.documatic.com/) Hackathon hosted on their [Discord](https://discord.gg/qQ6cpFFtNF).
 - It's coded with nodejs v16.13 but needs nodejs v16.6 or higher, due to latest discord.js version. Technically it doesn't need any other packages, except the ones which are build in nodejs such as `fs`, `readline`, etc. but if you want you could add a custom DB, there is an example for it...
 - All Emojis used are provided in a Folder, which can be used, but not needed, because u can use [UNICODE](https://getemoji.com) Emojis too!
 - The Theme of this BOT is **"CHILD GAMES"**, this means it is inspiried by Games we used to play as a child!
 - It supports multiple languages and you can easily add more!
 - It has a OWN CODED DATABASE with JSON, aka it can corrupt on BIG DATAS soon, so you might adjust database.js (it's easy to change!!!! as you have functions for it!) I might add examples for something like enmap)
 - and more!

***

## ❓ How does this Bot work ?

 - It works fully via Slash Commands. means it needs to be invited with the `applications.commands` Scope.
 - Other wise, each game needs to ping a player with which you want to play with (in some you can play alone).
 - You can only play 1 Game at once.
 - You can only request 1 Player-Enemy at once.
 - Make sure to respond quick, otherwise the games might end.

***

## 👾 All Games

Currently there is only 1 Game:

### 💳 Memory Game

<img src="https://i.imgur.com/oAqi4N1.png" style="width: 50%">

 - The Memory Game is simple explained, it is like **MEMORY CARDS**.
 - You pic 2 Cards and remember them. If it's a **match** you get **1 Point**.
 - The one with the **most points** is the **winner**.
 - you can play with the **bot, he is an EASY AI**, aka it will calculate the % of when to win and always win after X different wrong pics
 - You can play with **yourself** (but you will get 1 win and 1 loose at the same time... aka you control player 1 and 2)
 - You have **1 Minute** to **pic 2 cards**. Otherwise the game will end!
 - [Here](https://www.ultraboardgames.com/memory/game-rules.php) are **offical Memory Rules**

***

## ⚙️ Self Hosting Tutorial

- `1.` Download [nodejs](https://nodejs.org) v16.6 or higher I recommend v16.13, if you need it for a LINUX VPS check out my [CHEATSHEET](https://github.com/Tomato6966/Debian-Cheat-Sheet-Setup/wiki/3.1-Install-nodejs-and-npm)
- `2.` Download this Repo as a [ZIP]() and Extract it (open a CMD in that FOLDER), or clone it: `git clone https://github.com/Tomato6966/Documatic-Hackathon`
- `3.` CD into it: `cd Documatic-Hackathon`
- `4.` type `npm install`
- `5.` to start it type `node bot.js` or `node index.js` and then choose what you wanna do (`n` for skipping "FUN QUESTION", the answer for it would be `Documatic`)
- `--` to deploy slash commands do `node index.js` --> `n` --> `2` --> then choose
- `--` to host 24/7 Buy a [VPS](https://bero.milrato.dev) and host it with [PM2](https://github.com/Tomato6966/Debian-Cheat-Sheet-Setup/wiki/4-pm2-tutorial) `npm i -g pm2` --> `pm2 start bot.js`
- `--` to stop hosting it type <kbd>ctrl</kbd>+<kbd>c</kbd> in the console
- `--` Yes you can type `npm start` / `npm run`

***

## 💪 Commands list

> All Commands work via slash Commands!

 - `/language [change_language:german/bosnia/english/frensh/hindi/kurdish/spansish/]` ... change the language of the bot in that guild

 - `/ping [what_ping:api_ping/bot]` ... show the ping of the bot 
 - `/uptime` ... show the uptime of the bot
 - `/info [what_info:about_me/memory_game]` ... show some information
 - `/invite` ... invite it
 - `/support` ... show support server

 - `/leaderboard game:memory/all_games sort:maxpoints/avg_points_per_game` ... shows the leaderboard of all games or specific games + adds option to define the sorting style
 - `/userstats [user:@user]` ... shows stats of user (global & guild stats [maybe soon option to define global or guild]
 - **`/memory enemy:@user [boardsize:2x2_up_to_2_Points/3x3_up_to_4_Points/4x4_up_to_8_Points/5x5up_to_12_Points]`** ... plays a game of memory with options like who is the enemy and how big the board should be!

> You can play with yourself and with the bot as an ai

***

## 👀 To Do and History
> - ✅ Handler add: `Slash Commands and Event Handler + Deployer Option in console` **02.01.2022 20:00**
> - ✅ Minigame add: `Ask Question and answer with Documatic to access Bot` **02.01.2022 20:21**
> - ✅ Command add: `/ping` **02.01.2022 20:46**
> - ✅ Command add: `/info what_info` **03.01.2022 20:00**
> - ✅ Feature add: `add option to choose quick start` **03.01.2022 20:17**
> - ✅ Command add: `/memory` **03.01.2022 21:00**
> - ✅ Command add: `/language change_language` **04.01.2022 17:23** (recode everything again)
> - ✅ Languageadd: `German` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Spain` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Hindi` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Bosnia` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `French` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Spanish` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Kurdish` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ Languageadd: `Ukrainian` **05.01.2022 18:45** (automated translation script with request and open google api to translate it)
> - ✅ DEBUG FOR BUGS: `Fix bugs in all languages and scripts + optimize it` **05.01.2022** 23:00 (5h of debugging & testing)
> - ✅ Command add: `/support` **06.01.2022 11:17**
> - ✅ Command add: `/uptime` **06.01.2022 11:17**
> - ✅ Command add: `/invite` **06.01.2022 11:17**
> - ✅ Feature add: `/memory --> play with yourself validation (get 1 win & 1 loose) (technically shouldn't change the lb)` **06.01.2022 13:10**
> - ✅ Feature add: `/memory --> Pick the bot to play with AI` **06.01.2022 13:57**
> - ✅ Feature add: `add bot.js to directly start the bot without userinput` **06.01.2022 14:00**
> - ✅ Command add: `/userstats user` **06.01.2022 14:20**
> - ✅ Command add: `/leaderboard game sort` **06.01.2022 14:43**
> - ❌ Add Game: `DOME`
> - ❌ Add Game: `Bubbles`
> - ❌ Add Game: `LADDERS`
> - ❌ Add Game: `"CUPS"`
> - ❌ Languageadd: `Arab`
> - ❌ Languageadd: `Czech`
> - ❌ Languageadd: `Dutch`
> - ❌ Languageadd: `chineese/japan`
> - ❌ Feature add: `sharding`
> - ❌ Feature add: `Automated Status Changer`

***

## [DEVELOPER - Discord Server 😎](https://discord.gg/milrato) | [Website](https://milrato.dev)
<a href="https://discord.gg/milrato"><img src="https://discord.com/api/guilds/773668217163218944/widget.png?style=banner2"></a>

***

## SUPPORT ME AND MILRATO DEVELOPMENT

> You can always Support me by inviting one of my **own Discord Bots**

[![2021's best Music Bot | Lava Music](https://cdn.discordapp.com/attachments/748533465972080670/817088638780440579/test3.png)](https://lava.milrato.dev)
[![Musicium Music Bot](https://cdn.discordapp.com/attachments/742446682381221938/770055673965707264/test1.png)](https://musicium.musicium.dev)
[![Milrato Multi Bot](https://cdn.discordapp.com/attachments/742446682381221938/770056826724679680/test1.png)](https://milrato.milrato.dev)

# Credits

> If consider using this Bot, make sure to credit me!
