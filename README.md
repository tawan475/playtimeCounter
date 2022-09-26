# playtimeCounter
count your play time and integrate with stuff

## Installation
1. First clone this repo\
`git clone https://github.com/tawan475/playtimeCounter.git`

2. Install dependencies\
`npm install`

3. Run with PM2\
`pm2 start pm2 start counter.js`\
if you don't have pm2 install it with\
`npm install --location=global pm2`

4. save it on start up\
`pm2 save`\
`pm2 startup`

## Config
Change `processToCount` to track your process\
Change `DiscordAlertChannelID` to change your Discord alert channel ID\
Add `DISCORDTOKEN` to .env to add your Discord bot's token\
And then restart!\
`pm2 restart counter`



## Helping by committing!
wanna add cool feature? commit it!
