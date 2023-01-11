# cosmonaut - Discord Bot

## Goals
I embarked on this personal project in order to demonstrate my current level programming skills.
A secondary goal was to illustrate my ability to quicky learn a new development environment and be able to write features for it competently.
Finally, I've always wanted to write a bot for my own personal uses for Discord; Being able to develop bots on this platform for any interest I could ever have sounded like a really cool skill to have.

I saw no better option for this project than to program a Discord bot.
Not only did I chose to write this bot in JavaScript is something I am unfamiliar with, but I have always wanted to get involved with the Discord developer environment.
Knocking out my professional and personal goals in one project was not only time efficient, it was a great way to learn so many new technologies that I was unfamiliar with previously.

To list just a few new technologies I have learned to incorporate in my projects is __Optical Character Recognition (OCR)__, __Web-Scraping__, and making __API calls to Google and Discord__. I utilized OCR when writing a script to identify usernames from a screenshot to help my bot achieve the ability to compare lists. My bot also incorporates the use of API calls both to Discord and Google services in order to request information and respond to user input.

***
# Features

## ___Parse___

One of the problems I wanted to address was to provide a simple open-source solution to a problem in a game I play. When organizing a group of people to run a dungeon, it can be difficult to identify when someone isn't supposed to be there and remove them. My bot can automatically compare the users in a Discord channel to the users in that dungeon to find who isn't supposed to be there. This allows you to easily remove that person by running a simple command with an image provided.

### _Technologies Used_:

The main OCR technology I used was **Google Cloud Vision API**. 
However, I decided to have a backup option for when the Google Vision fails. Although not as accurate, I also make use of **Tesseract-OCR** which is much faster, as it runs locally and doesn't rely on an API call. This redundancy helps keep my bot up and running even if there are outages or unforseen issues.

A demonstration of this feature in use:

|Discord|In-Game|
|----|----|
|![DiscordVC](https://media.discordapp.net/attachments/1044495816489967626/1062809604158926979/image.png)|![InGameWho](https://media.discordapp.net/attachments/1044495816489967626/1062810992301580328/image.png)|

|Usage|
|----|
|![ParseUsage](https://media.discordapp.net/attachments/1044495816489967626/1062816932966973520/image.png)|

|Result|
|----|
|![ParseResult](https://media.discordapp.net/attachments/1044495816489967626/1062813956965679156/image.png)|

---

## ___Verify___

The parse feature begs a question: how do you maintain an accurate list of names for the users in your server?
In order for the parse feature to work, the users in your server must have their names match that of their In-game name (IGN). 
Luckily, this can be achieved through Discord's server-unique nickname feature.
Importantly, requiring manual verification by the individual users or moderation creates a lot of issues of personal responsibility and time that I simply wanted to avoid with my solution.

So, I created a command on my bot that asks the user for their IGN and for them to write a unique identifier on their profile. My bot then automatically scrapes their user webpage to verify their identity and if successful, updates their nickname on the Discord server.

### _Technologies Used_:

The incorporation of Puppeteer.js gave my bot the ability to verify user profiles on the web.
Puppeteer allows you to naviage to webpages via a headless chromium browser and perform all kinds of cool actions while you're there.

I knew this option wouldn't scale well in terms of memory usage and processing power but I decided it wouldn't affect my project as the number of requests would be low enough for it to not matter.
If however this becomes an issue in the futere, I will utilize API calls instead.

I had considered using an API for RealmEye but decided it would be easier and more reliable to simply scrape the page for necessary information. 
Additionally, I think the web scraping route was the smarter choice in the end as it taught me a lot of new skills in terms of creating tools to interact with websites that allow it.

|Usage|
|----|
|![VerifyUsage](https://media.discordapp.net/attachments/1044495816489967626/1062825424243150898/image.png)|

|Request|
|----|
|![VerifyRequest](https://cdn.discordapp.com/attachments/1044495816489967626/1062824552704516146/image.png)|

|User WebPage|
|----|
|![VerifyWebPage](https://media.discordapp.net/attachments/1044495816489967626/1062828228848390184/image.png)|

---

## ___Poll___

Having the ability to run a poll entirely within the bounds of a Discord server is extremely helpful.
Although it is possible to use 3rd party websites that provide this service, many people don't go through the effort to go there and participate; Maybe they don't even notice a poll was created in the first place.
The obvious next option would be to develop a solution entirely contained within the Discord environment, so that visibility and participation would be higher.

|Usage|
|----|
|![PollUsage](https://media.discordapp.net/attachments/1044495816489967626/1062861741966512188/image.png)|


|Description|Choices Menu|
|----|----|
|![PollDescription](https://cdn.discordapp.com/attachments/1044495816489967626/1062862687350042716/image.png)|![PollDescription](https://media.discordapp.net/attachments/1044495816489967626/1062863316390789230/image.png)|

|Secondary Menu|
|----|
|![PollSecondaryMenu](https://media.discordapp.net/attachments/1044495816489967626/1062863070940106942/image.png)|

|Poll|
|----|
|![PollRunning](https://media.discordapp.net/attachments/1044495816489967626/1062847668172361849/image.png)|

|Voting|
|----|
|![PollVoting](https://media.discordapp.net/attachments/1044495816489967626/1062846972949704806/image.png)|

|Results|
|----|
|![PollResults](https://media.discordapp.net/attachments/1044495816489967626/1062846797623607427/image.png)|

---

## ___Timer___

One issue I ran into when writing the Poll command was the need for input validation for time durations.
The slash command interface supplied by Discord allows you to specific input validation that happens before you even send the command.
However, because time inputs were are not officially supported, I implemented my own validation interface that follows a simple pattern.

*eg: 1w 2d 3h 4m 5s*

Through this interface, you can supply an input that will either return to you a conversion to milliseconds or it will throw an ***Invalid Time Format*** error for you to deal with.
I'm sure there are other similar implementations that would work for my case, but I decided to create my own since it was simple enough to design and would give me a lot of control if I wanted extra features.

|Usage|
|----|
|![TimerUsage](https://media.discordapp.net/attachments/1044495816489967626/1062868740204662855/image.png)|

|Example Output|
|----|
|![TimerExampleOutput](https://media.discordapp.net/attachments/1044495816489967626/1062869594525667398/image.png)|

---

## ___Clean___

A simple command I created for easily disconnecting everyone from a voice channel. 
There's not a lot to explain about this feature, just a simple, helpful tool for server moderation.

|Usage|
|----|
|![CleanUsage](https://media.discordapp.net/attachments/1044495816489967626/1062837249563168828/image.png)|

---

## ___Avatar___

Another utility command I created as suggestion from another user. This command allows a user to obtain the image used in a user's avatar on Discord. The bot replies with a message containing the full image link as supplied by the Discord servers.

I also gave the choice to obtain one's own avatar by not supplying the optional input user, in which the bot interprets as referring to yourself; You can input yourself manually if you so choose.

|Usage|
|----|
|![AvatarUsage](https://media.discordapp.net/attachments/1044495816489967626/1062870983293292575/image.png)|

|Result|
|----|
|![AvatarResult](https://cdn.discordapp.com/attachments/1044495816489967626/1062870480375255070/image.png)|