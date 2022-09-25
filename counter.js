const exec = require('child_process').exec;
const { Client, GatewayIntentBits } = require('discord.js');
const { fstat } = require('fs');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]});
const fs = require('fs');
require('dotenv').config()



let processName = 'GenshinImpact.exe';
let DiscordAlertChannelID = '1023580463048175726';


let lastChange = {
    state: null,
    time: null
};
let collectiveTime = require('./collectiveTime.json');

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist /FI "IMAGENAME eq ${query}" /FO CSV`;
            break;
        case 'darwin':
            cmd = `ps -ax | grep ${query}`;
            break;
        case 'linux':
            cmd = `ps -A | grep ${query}`;
            break;
        default:
            break;
    }
    exec(cmd, {windowsHide: true}, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

client.once('ready', () => {
    console.log('Ready!');
    let alertChannel = client.channels.cache.get(DiscordAlertChannelID);

    setInterval(() => {
        isRunning(processName, (state) => {
            if (lastChange.state !== state) { // check for status change
                let alertMessage = '';
                let now = Date.now();
                if (state === true) { // if it is opened
                    alertMessage += `${processName} is opened`;
                    lastChange.time = now;
                } else {
                    alertMessage += `${processName} is closed`;
                    if (lastChange.state === true) {

                        let openedFor = now - lastChange.time;
                        if (!collectiveTime[processName]) collectiveTime[processName] = 0;
                        collectiveTime[processName] += openedFor
                        alertMessage += `, opened for \`${openedFor}\` ms\r\n`
                        alertMessage += `since \`${lastChange.time}\` to \`${now}\`\r\n`
                        alertMessage += `collective time of \`${collectiveTime[processName]}\` ms`
                    }

                }
                alertChannel.send(alertMessage);

                lastChange.state = state;
                lastChange.time = now;
                fs.writeFileSync('./collectiveTime.json', JSON.stringify(collectiveTime, null, 2));
            }
        })
    }, 1000);
});

client.login(process.env.DISCORDTOKEN)