# cosmonaut - Discord Bot

## Goals
I embarked on this personal project in order to demonstrate my current level programming skills.
A secondary goal was to illustrate my ability to quicky learn a new development environment and be able to write features for it competently.
Finally, I've always wanted to write a bot for my own personal uses for Discord; Being able to develop bots on this platform for any interest I could ever have sounded like a really cool skill to have.

I saw no better option for this project than to program a Discord bot.
Not only did I chose to write this bot in JavaScript is something I am unfamiliar with, but I have always wanted to get involved with the Discord developer environment.
Knocking out my professional and personal goals in one project was not only time efficient, it was a great way to learn so many new technologies that I was unfamiliar with previously.

To list just a couple new technologies I have learned to incorporate in my projects is __Optical Character Recognition (OCR)__ and making __API calls to Google and Discord__. I utilized OCR when writing a script to identify usernames from a screenshot to help my bot achieve the ability to compare lists. My bot also incorporates the use of API calls both to Discord and Google services in order to request information and respond to user input.

***
# Features

## ___Parse___

One of the problems I wanted to address was to provide a simple open-source solution to a problem in a game I play. When organizing a group of people to run a dungeon, it can be difficult to identify when someone isn't supposed to be there and remove them. My bot can automatically compare the users in a Discord channel to the users in that dungeon to find who isn't supposed to be there. This allows you to easily remove that person by running a simple command with an image provided.

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

|Usage|
|----|
|![VerifyUsage](https://media.discordapp.net/attachments/1044495816489967626/1062825424243150898/image.png)|

|Request|
|----|
|![VerifyRequest](https://cdn.discordapp.com/attachments/1044495816489967626/1062824552704516146/image.png)|

|User WebPage|
|----|
|![VerifyWebPage](https://media.discordapp.net/attachments/1044495816489967626/1062828228848390184/image.png)|

