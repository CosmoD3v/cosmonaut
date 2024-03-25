# cosmonaut - Discord Bot

## Why I created a Discord bot...
I began writing this bot back in December because I saw the opportunity to simultaneously complete multiple goals I had set for myself.
I saw no better option for this project than to program a Discord bot because it acted as the catalyst for completing all these goals in one.
So, I embarked on this personal project to demonstrate my current level programming skills, learn a new programming language, and create a bot to solve problems I wanted to address.

1. I have been trying to think of a project to show off where my skills are as a programmer currently.
Putting in a lot of hours writing code the past year has allowed me to create a bot that could not only be used by myself and others, but would be a great project to show off on my portfolio.
This is but one of a few things I wanted to utilize to show off my competency as a Software Developer.

2. Another goal I completed was to illustrate my ability to quicky learn a new development environment and be able to competently write features for it.
I chose to write this bot in JavaScript, which is something I am unfamiliar with and wanted to learn.
It only took me a couple weeks of development to feel confident in my work flow and understanding of the language both in-general and with the Discord wrapper.

3. Finally, I've always wanted to write a bot for my own personal uses for Discord; Being able to develop bots on this platform for any interest I could ever have sounded like a really cool skill to have.
I have always wanted to get involved with the Discord developer environment and write my own integrations as it would be an awesome outlet to pour my ideas into.

Knocking out my professional and personal goals in one project was not only time efficient, it was a great way to learn so many new technologies that I was unfamiliar with previously. Here are just a few things I incorporated into my project in order to make it work...

## Technologies Used:
* __Optical Character Recognition (OCR)__
* __Web-Scraping__
* __API calls to Google and Discord__.

# Features (Explained)

## ___Parse___

One of the problems I wanted to address was to provide a simple open-source solution to a problem in a game I play. When organizing a group of people to run a dungeon, it can be difficult to identify when someone isn't supposed to be there and remove them. My bot can automatically compare the users in a Discord channel to the users in that dungeon to find who isn't supposed to be there. This allows you to easily remove that person by running a simple command with an image provided.

### _Technologies Used_:

The main OCR technology I used was **Google Cloud Vision API**. 
However, I decided to have a backup option for when the Google Vision fails. Although not as accurate, I also make use of **Tesseract-OCR** which is much faster, as it runs locally and doesn't rely on an API call. This redundancy helps keep my bot up and running even if there are outages or unforseen issues.

A demonstration of this feature in use:

|Discord|In-Game|
|----|----|
|![DiscordVC](https://media.discordapp.net/attachments/1044495816489967626/1062809604158926979/image.png?ex=660da893&is=65fb3393&hm=b943032f11cd6ce9bcaf485d16071a43f91cd7c14c9ceda7c34454fcf3230f80&=&format=webp&quality=lossless)|![InGameWho](https://media.discordapp.net/attachments/1044495816489967626/1062810992301580328/image.png?ex=660da9de&is=65fb34de&hm=fc954fb1605ede5ba834490ec7f659bdc3808ba71797d1527b19797c609e609e&=&format=webp&quality=lossless)|

|Usage|
|----|
|![ParseUsage](https://media.discordapp.net/attachments/1044495816489967626/1062816932966973520/image.png?ex=660daf67&is=65fb3a67&hm=e19156c96fac9abfdf4c2f9d542636e94e27a686b024cf8e1f6c7aab5c0ec5d8&=&format=webp&quality=lossless)|

|Result|
|----|
|![ParseResult](https://media.discordapp.net/attachments/1044495816489967626/1062813956965679156/image.png?ex=660daca1&is=65fb37a1&hm=2f5b65f2306e134c2cd195450c9e977f0da3c9cae3b27aed1b2078a07c02cee8&=&format=webp&quality=lossless)|

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
Additionally, I think the web scraping route was the smarter choice in the end, as it taught me a lot of new skills in terms of creating tools to interact with websites that allow it.

|Usage|
|----|
|![VerifyUsage](https://media.discordapp.net/attachments/1044495816489967626/1062825424243150898/image.png?ex=660db74f&is=65fb424f&hm=f2bc2ebe6b3e34b7558cefc1055e389b24787f99a271594fa7a052edb8c68fbd&=&format=webp&quality=lossless)|

|Request|
|----|
|![VerifyRequest](https://media.discordapp.net/attachments/1044495816489967626/1062824552704516146/image.png?ex=660db67f&is=65fb417f&hm=73619790e2fa3e69093ecd463aa21abb08f5ee6404735a7cb2f34288605b3c0d&=&format=webp&quality=lossless)|

|User WebPage|
|----|
|![VerifyWebPage](https://cdn.discordapp.com/attachments/1044495816489967626/1062828228848390184/image.png?ex=660db9ec&is=65fb44ec&hm=3ae837e48aaa14a4aa7b842dbd180031a64b57a7a6eb8cd4667d831f49306f69&)|

---

## ___Poll___

Having the ability to run a poll entirely within the bounds of a Discord server is extremely helpful.
Although it is possible to use 3rd party websites that provide this service, many people don't go through the effort to go there and participate; Maybe they don't even notice a poll was created in the first place.
The obvious next option would be to develop a solution entirely contained within the Discord environment, so that visibility and participation would be higher.

|Usage|
|----|
|![PollUsage](https://media.discordapp.net/attachments/1044495816489967626/1062861741966512188/image.png?ex=660dd922&is=65fb6422&hm=5b7ecd2df74d244062c44f2dd08baa505388b464b363064090a357ad400c328b&=&format=webp&quality=lossless)|


|Description|Choices Menu|
|----|----|
|![PollDescription](https://media.discordapp.net/attachments/1044495816489967626/1062862687350042716/image.png?ex=660dda03&is=65fb6503&hm=084caf32a28b639508e26b46849df561610853f3dd10987f777200df29e718d7&=&format=webp&quality=lossless)|![ChoicesMenu](https://cdn.discordapp.com/attachments/1044495816489967626/1062863316390789230/image.png?ex=660dda99&is=65fb6599&hm=a870826d77ea14ed75d6efa91934c9d24f061d1fce85389b9990e19e273351c1&)|

|Secondary Menu|
|----|
|![PollSecondaryMenu](https://media.discordapp.net/attachments/1044495816489967626/1062863070940106942/image.png?ex=660dda5f&is=65fb655f&hm=79161084dc74f7e5916f630c29650290bab1fddcc6dc5dfd84c29fc88e6dd44c&=&format=webp&quality=lossless)|

|Poll|
|----|
|![PollRunning](https://cdn.discordapp.com/attachments/1044495816489967626/1062847668172361849/image.png?ex=660dcc06&is=65fb5706&hm=c2ed75df866b99b9ce17208e24330dc062d1a49ab849d526aea3580ec44a3740&)|

|Voting|
|----|
|![PollVoting](https://media.discordapp.net/attachments/1044495816489967626/1062846972949704806/image.png?ex=660dcb61&is=65fb5661&hm=482d15bc618ec0d04af1e72d4e6504fce68994a26daefb111434024fa81cb9fd&=&format=webp&quality=lossless)|

|Results|
|----|
|![PollResults](https://media.discordapp.net/attachments/1044495816489967626/1062846797623607427/image.png?ex=660dcb37&is=65fb5637&hm=11fb67ceb1114709ff3d8a78c7c4ee946464966392ad3662745aaf253d5458ee&=&format=webp&quality=lossless)|

---

## ___Timer___

One issue I ran into when writing the Poll command was the need for input validation for time durations.
The slash command interface supplied by Discord allows you to perform input validation that happens before you even send the command.
However, because time inputs were are not officially supported, I implemented my own validation interface that follows a simple pattern.

*eg: 1w 2d 3h 4m 5s*

Through this interface, you can supply an input that will either return to you a conversion to milliseconds or it will throw an ***Invalid Time Format*** error for you to deal with.
I'm sure there are other similar implementations that would work for my case, but I decided to create my own since it was simple enough to design and would give me a lot of control if I wanted extra features.

|Usage|
|----|
|![TimerUsage](https://media.discordapp.net/attachments/1044495816489967626/1062868740204662855/image.png?ex=660ddfa6&is=65fb6aa6&hm=4de6e783657f4b8567f30e253e8e471e0b5f0425f41937f43c3491c2a45b70d7&=&format=webp&quality=lossless)|

|Example Output|
|----|
|![TimerExampleOutput](https://media.discordapp.net/attachments/1044495816489967626/1062869594525667398/image.png?ex=660de072&is=65fb6b72&hm=b9b1ae8209a6bcec46caeb03eec2f0088ffb1cb0689c2fc4d36990130f8e833b&=&format=webp&quality=lossless)|

---

## ___Clean___

A simple command I created for easily disconnecting everyone from a voice channel. 
There's not a lot to explain about this feature, just a simple, helpful tool for server moderation.

|Usage|
|----|
|![CleanUsage](https://media.discordapp.net/attachments/1044495816489967626/1062837249563168828/image.png?ex=660dc252&is=65fb4d52&hm=67fb3837df99d2457c8ace9443db16b0f1a4e957c99b2ef827ca0dd939719e58&=&format=webp&quality=lossless)|

---

## ___Avatar___

Another utility command I created as suggestion from another user. This command allows a user to obtain the image used in a user's avatar on Discord. The bot replies with a message containing the full image link as supplied by the Discord servers.

I also gave the choice to obtain one's own avatar by not supplying the optional input user, in which the bot interprets as referring to yourself; You can input yourself manually if you so choose.

|Usage|
|----|
|![AvatarUsage](https://media.discordapp.net/attachments/1044495816489967626/1062870983293292575/image.png?ex=660de1bd&is=65fb6cbd&hm=b99bf6656cb452eb70987b6556bfa876eb35277dd51e8cc571ef93f6af321cac&=&format=webp&quality=lossless)|

|Result|
|----|
|![AvatarResult](https://media.discordapp.net/attachments/1044495816489967626/1062870480375255070/image.png?ex=660de145&is=65fb6c45&hm=637429a3f624a84906755c64aa30b3be8916990af902b82345a16465681197e5&=&format=webp&quality=lossless&width=354&height=350)|