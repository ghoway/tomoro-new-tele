// src/handlers/startHandler.js - Webhook version for Vercel
import bot from '../bot.js';
import { upsertUser } from '../db.js';
import { mainMenu } from '../ui.js';

export async function handleStart(msg) {
    const chatId = msg.chat.id;
    const { first_name, last_name, username } = msg.from;

    const { user, isNew } = await upsertUser(chatId, first_name, last_name, username);
    const welcomeName = user.username ? `@${user.username}` : user.first_name;
    const message = isNew ? `Selamat datang, ${welcomeName}! 👋` : `Selamat datang kembali, ${welcomeName}! 👋`;

    try {
        await bot.sendMessage(chatId, message, mainMenu);
        console.log('✅ Start message sent successfully');
    } catch (error) {
        console.error('❌ Failed to send start message:', error.message);
        // Fallback message
        try {
            await bot.sendMessage(chatId, `Selamat datang! 👋`, mainMenu);
        } catch (fallbackError) {
            console.error('❌ Fallback message failed:', fallbackError.message);
        }
    }
}