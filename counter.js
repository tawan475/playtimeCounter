const exec = require('child_process').exec;
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]});
const fs = require('fs');
require('dotenv').config()



let processToCount = ['GenshinImpact.exe', 'Code.exe'];
let DiscordAlertChannelID = '1023580463048175726';


let lastChange = {};
let collectiveTime = require('./collectiveTime.json');

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist`;
            break;
        case 'darwin':
            cmd = `ps -ax`;
            break;
        case 'linux':
            cmd = `ps -A`;
            break;
        default:
            break;
    }
    exec(cmd, {windowsHide: true, timeout: 1}, (err, stdout, stderr) => {
        let processRunning = processToCount.map(toCheck => {
            return {
                name: toCheck,
                state: stdout.toLowerCase().indexOf(toCheck.toLowerCase()) > -1
            }
        })
        cb(processRunning);
    });
}

client.once('ready', () => {
    console.log('Ready!');
    let alertChannel = client.channels.cache.get(DiscordAlertChannelID);

    setInterval(() => {
        isRunning(processToCount, (processStates) => {
            processStates.forEach((processState) => {
                let lastState = lastChange[processState.name] ? lastChange[processState.name] : {};
                if (lastState.state !== processState.state) { // check for status change
                    let alertMessage = '';
                    let now = Date.now();
                    if (processState.state === true) { // if it is opened
                        alertMessage += `${processState.name} is opened`;
                        lastState.time = now;

                        alertChannel.send(alertMessage);
                        console.log(alertMessage);
                    } else if (processState.state === false && lastState.state === true) {
                        alertMessage += `${processState.name} is closed`;

                        let openedFor = now - lastState.time;
                        if (!collectiveTime[processState.name]) collectiveTime[processState.name] = 0;
                        collectiveTime[processState.name] += openedFor;

                        alertMessage += `, opened for \`${openedFor}\` ms\r\n`;
                        alertMessage += `since \`${lastState.time}\` to \`${now}\`\r\n`;
                        alertMessage += `collective time of \`${collectiveTime[processState.name]}\` ms`;
                        alertChannel.send(alertMessage);
                        console.log(alertMessage);
                    }

                    lastState.state = processState.state;
                    lastState.time = now;
                    lastChange[processState.name] = lastState
                    fs.writeFileSync('./collectiveTime.json', JSON.stringify(collectiveTime, null, 2));
                }
            })
        })
    }, 1000);
});

client.login(process.env.DISCORDTOKEN)
