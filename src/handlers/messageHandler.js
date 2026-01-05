// src/handlers/messageHandler.js - Webhook version for Vercel
import bot from '../bot.js';
import { upsertUser } from '../db.js';
import { getState, clearState } from '../state.js';
import { mainMenu } from '../ui.js';
import { handleRegistrationFlow } from '../commands/registration.js';
import { handleSettingsFlow } from '../commands/settings.js';
import { showStatus } from '../commands/status.js';
import { showHistory } from '../commands/history.js';
import { handleAdminCommand } from '../commands/admin.js';

export async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

    // Get user data first
    const { user } = await upsertUser(chatId, msg.from.first_name, msg.from.last_name, msg.from.username);
    console.log(`💬 Processing message: "${text}" from ${chatId}`);

    // Check if user is in a state
    const state = getState(chatId);
    if (state) {
        if (text === '❌ Cancel' || text === '⬅️ Kembali ke Menu Utama') {
            clearState(chatId);
            try {
                await bot.sendMessage(chatId, '❌ Proses dibatalkan. Kembali ke menu utama.', mainMenu);
            } catch (error) {
                console.error('❌ Failed to send cancel message:', error.message);
            }
            return;
        }

        if (state.type === 'registration') return handleRegistrationFlow(msg, user, state);
        if (state.type === 'settings') return handleSettingsFlow(msg, user, state);

        try {
            await bot.sendMessage(chatId, '⚠️ Anda sedang dalam proses. Ketik ❌ Cancel untuk membatalkan.');
        } catch (error) {
            console.error('❌ Failed to send process message:', error.message);
        }
        return;
    }

    // Handle menu options
    switch (text) {
        case '📱 Registrasi Manual':
        case '🤖 Registrasi Otomatis':
            return handleRegistrationFlow(msg, user, null);
        case '⚙️ Pengaturan':
            return handleSettingsFlow(msg, user, null);
        case '📊 Status':
            return showStatus(chatId, user);
        case '📜 History':
            return showHistory(chatId, user);
        case '❌ Cancel':
        case '⬅️ Kembali ke Menu Utama':
            try {
                await bot.sendMessage(chatId, '✅ Anda sudah di menu utama.', mainMenu);
            } catch (error) {
                console.error('❌ Failed to send main menu message:', error.message);
            }
            return;
    }

    // Handle basic text responses
    const lowerText = text.toLowerCase();
    if (lowerText?.includes('halo') || lowerText?.includes('hi') || lowerText?.includes('hello')) {
        try {
            await bot.sendMessage(chatId, 'Halo! Saya siap membantu Anda! 🤖\n\nGunakan menu di bawah untuk registrasi Tomoro:', mainMenu);
        } catch (error) {
            console.error('❌ Failed to send hello message:', error.message);
        }
        return;
    }

    // Default response for unknown commands
    if (text?.startsWith('/')) {
        try {
            await bot.sendMessage(chatId, 'Perintah tidak dikenali. Gunakan /help untuk bantuan.');
        } catch (error) {
            console.error('❌ Failed to send command message:', error.message);
        }
    }
}