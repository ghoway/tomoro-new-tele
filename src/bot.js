// src/bot.js - Webhook version for Vercel
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN || 'fake-token', { polling: false });

export default bot;