require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Story bot is alive");
});

app.listen(process.env.PORT || 10000);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let gameActive = false;
let lastPlayer = null;
let timeout = null;
let eliminated = new Set();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    console.log("Message received:", message.content);

    if (message.author.bot) return;

    if (message.content === "!startstory") {
        if (gameActive) return message.reply("A game is already running!");
        gameActive = true;
        eliminated.clear();
        lastPlayer = null;

        message.channel.send("📖 Story Builder Started! (3-7 words per turn)");
        resetTimer(message.channel);
        return;
    }

    if (message.content === "!endstory") {
        if (!gameActive) return;
        gameActive = false;
        clearTimeout(timeout);
        if (lastPlayer) {
            message.channel.send(`🏆 ${lastPlayer} wins!`);
        }
        return;
    }

    if (!gameActive) return;
    if (eliminated.has(message.author.id)) return;

    const words = message.content.trim().split(/\s+/);

    if (words.length < 3 || words.length > 7) {
        eliminated.add(message.author.id);
        message.reply("❌ You broke the 3-7 word rule. You're eliminated!");
        return;
    }

    lastPlayer = message.author;
    message.react("✅");
    resetTimer(message.channel);
});

function resetTimer(channel) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        gameActive = false;
        if (lastPlayer) {
            channel.send(`⏰ Time's up! 🏆 ${lastPlayer} wins!`);
        }
    }, 60000);
}

client.login(process.env.BOT_TOKEN);