const mineflayer = require('mineflayer');

let bot = null;
let checkInterval = null;

const serverConfig = {
  host: 'yourserver.aternos.me',      // Your Aternos server IP
  port: 25565,
  username: process.env.EMAIL,        // Set in Railway ENV
  password: process.env.PASSWORD,     // Set in Railway ENV
  auth: 'microsoft',
  version: '1.20.1'
};

function createBot() {
  bot = mineflayer.createBot(serverConfig);

  bot.once('spawn', () => {
    console.log('✅ Bot joined the server.');
    startAFKLoop();
  });

  bot.on('playerJoined', (player) => {
    if (player.username !== bot.username) {
      console.log(`👤 Player joined: ${player.username}. Bot leaving...`);
      bot.quit();
    }
  });

  bot.on('end', () => {
    console.log('🔁 Bot disconnected.');
    if (!checkInterval) {
      checkInterval = setInterval(tryReconnect, 30000); // Every 30 sec
    }
  });

  bot.on('error', (err) => {
    console.error('❌ Error:', err.message);
  });
}

function tryReconnect() {
  console.log('⏳ Checking if server is empty...');
  const tempBot = mineflayer.createBot({
    ...serverConfig,
    username: 'check_' + Math.floor(Math.random() * 9999)
  });

  tempBot.once('spawn', () => {
    const playersOnline = Object.keys(tempBot.players);
    console.log(`👥 ${playersOnline.length} player(s) online.`);

    if (playersOnline.length <= 1) {
      console.log('✅ Server empty. Bot will rejoin.');
      clearInterval(checkInterval);
      checkInterval = null;
      tempBot.quit();
      setTimeout(() => createBot(), 2000);
    } else {
      console.log('🚫 Still players online. Try again later.');
      tempBot.quit();
    }
  });

  tempBot.on('error', err => {
    console.log('❗ Error during check:', err.message);
  });
}

function startAFKLoop() {
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
      bot.chat('Still here...');
    }
  }, 60 * 1000); // Every 60 sec
}

createBot();
