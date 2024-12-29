const mineflayer = require('mineflayer');
const colors = require('colors').enable();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Minecraft bot sozlamalari
const botUsername = 'zdsdefect'; // bot username
const botPassword = '1234pp'; // bot password
const botOptions = {
    host: 'bytemc.uz', // server hostname
    username: botUsername,
    password: botPassword,
    version: '1.16.5', // server versiyasi
};

// Telegram bot tokeni
const telegramToken = '7695499057:AAGemo7sjViuThGaWi66DOGePR6kuguo_V8';
const tgBot = new TelegramBot(telegramToken, { polling: true });

// Telegram chat ID-ni saqlash uchun fayl yo'li
const chatIdFilePath = './chat_id.json';

// Chat ID-ni o'qish funksiyasi
function loadChatId() {
    if (fs.existsSync(chatIdFilePath)) {
        const data = fs.readFileSync(chatIdFilePath, 'utf8');
        return JSON.parse(data).chatId || null;
    }
    return null;
}

// Chat ID-ni yozish funksiyasi
function saveChatId(chatId) {
    fs.writeFileSync(chatIdFilePath, JSON.stringify({ chatId }));
}

// Telegram chat ID-ni o'qish
let telegramChatId = loadChatId();

// Minecraft botni boshlash
function initBot() {
    const bot = mineflayer.createBot(botOptions);

    // Minecraft bot ulanishi
    bot.on('spawn', () => {
        console.log('BOT SPAWNED'.green);
        if (telegramChatId) {
            tgBot.sendMessage(telegramChatId, 'Bot Minecraft serverga muvaffaqiyatli ulanish hosil qildi!');
        }
    });

    // Minecraft bot serverdan chiqib ketganida
    bot.on('end', (reason) => {
        console.log('Bot serverdan chiqdi'.red);
        if (telegramChatId) {
            tgBot.sendMessage(telegramChatId, `Bot serverdan chiqdi: ${reason}`);
        }
        setTimeout(() => {
            initBot();
            console.log('BOT QAYTA ISHGA TUSHDI'.green);
        }, 10000);
    });

    // Serverdan keladigan xabarlarni tahlil qilish
    bot.on('messagestr', (message) => {
        console.log(`Bytemc: ${message}`.blue);

        // Telegramga xabar jo'natish
        if (telegramChatId) {
            tgBot.sendMessage(telegramChatId, `Bytemc: ${message}`);
        }

        // Login va Register
        if (message.includes('/register')) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
            console.log('REGISTER BO`LDI'.green);
        }
        if (message.includes('/login')) {
            bot.chat(`/login ${botPassword}`);
            console.log('LOGIN BO`LDI'.green);

            // Login muvaffaqiyatli bo'lgandan keyin /survival buyrug'i
            setTimeout(() => {
                bot.chat('/survival');
                console.log('SURVIVALGA KIRDI'.green);
            }, 2000); // 2 soniya kutish
        }
    });

    // Telegramdan Minecraftga xabar jo'natish
    tgBot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!telegramChatId) {
            telegramChatId = chatId;
            saveChatId(chatId); // Chat ID-ni saqlash
        }

        if (text === '/start') {
            tgBot.sendMessage(chatId, 'Minecraft botga ulanish muvaffaqiyatli!');
        } else if (text.startsWith('/')) {
            bot.chat(text); // Minecraftda buyrug'ini ishlatadi
        } else {
            bot.chat(text); // Oddiy xabarni Minecraftga yuboradi
        }
    });

    // Xatoliklarni boshqarish
    tgBot.on('polling_error', (error) => {
        console.error('Telegram polling error:', error);
    });
}

initBot();
