// src/commands/settings.js - Webhook version for Vercel
import bot from '../bot.js';
import { setState, clearState } from '../state.js';
import { getDb } from '../db.js';
import { mainMenu } from '../ui.js';

export async function handleSettingsFlow(msg, user, state) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!state) {
        try {
            await bot.sendMessage(chatId, '⚙️ *Pengaturan*\n\nSilakan pilih pengaturan yang ingin diubah:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🎫 Set Invitation Code', callback_data: 'set_invite' }],
                        [{ text: '🔑 Set APIKEY', callback_data: 'set_apikey' }],
                    ],
                },
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('❌ Failed to send settings menu:', error.message);
        }
        return;
    }

    if (state.step === 'waiting_invitation_code') {
        const db = getDb();
        if (db) {
            try {
                const stmt = db.prepare('UPDATE tg_users SET invitationCode = ? WHERE telegram_id = ?');
                stmt.run(text, chatId);
                clearState(chatId);
                await bot.sendMessage(chatId, '✅ Invitation code berhasil diupdate', mainMenu);
            } catch (error) {
                console.error('❌ Failed to update invitation code:', error.message);
                clearState(chatId);
                try {
                    await bot.sendMessage(chatId, '❌ Gagal mengupdate invitation code', mainMenu);
                } catch (msgError) {
                    console.error('❌ Failed to send error message:', msgError.message);
                }
            }
        } else {
            clearState(chatId);
            try {
                await bot.sendMessage(chatId, '❌ Database tidak tersedia. Tidak dapat mengupdate invitation code', mainMenu);
            } catch (error) {
                console.error('❌ Failed to send database error message:', error.message);
            }
        }
        return;
    }

    if (state.step === 'waiting_apikey') {
        const db = getDb();
        if (db) {
            try {
                const stmt = db.prepare('UPDATE tg_users SET apikey = ? WHERE telegram_id = ?');
                stmt.run(text, chatId);
                clearState(chatId);
                await bot.sendMessage(chatId, '✅ APIKEY berhasil disimpan', mainMenu);
            } catch (error) {
                console.error('❌ Failed to update API key:', error.message);
                clearState(chatId);
                try {
                    await bot.sendMessage(chatId, '❌ Gagal menyimpan APIKEY', mainMenu);
                } catch (msgError) {
                    console.error('❌ Failed to send error message:', msgError.message);
                }
            }
        } else {
            clearState(chatId);
            try {
                await bot.sendMessage(chatId, '❌ Database tidak tersedia. Tidak dapat menyimpan APIKEY', mainMenu);
            } catch (error) {
                console.error('❌ Failed to send database error message:', error.message);
            }
        }
        return;
    }
}

export async function handleSettingsCallback(callbackQuery, user) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    switch (data) {
        case 'set_invite':
            setState(chatId, { step: 'waiting_invitation_code', type: 'settings' });
            try {
                await bot.sendMessage(chatId, '🎫 Masukkan invitation code baru:');
            } catch (error) {
                console.error('❌ Failed to send invitation code request:', error.message);
            }
            break;
        case 'set_apikey':
            setState(chatId, { step: 'waiting_apikey', type: 'settings' });
            try {
                await bot.sendMessage(chatId, '🔑 Masukkan APIKEY SMS provider:');
            } catch (error) {
                console.error('❌ Failed to send API key request:', error.message);
            }
            break;
    }

    try {
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('❌ Failed to answer callback query:', error.message);
    }
}