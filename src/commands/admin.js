// src/commands/admin.js - Webhook version for Vercel
import bot from '../bot.js';
import { getDb } from '../db.js';

function isAdmin(chatId) {
    const hardcodedAdmins = ['5845170034'];
    const envAdmins = process.env.ADMIN_IDS?.split(',') || [];
    const allAdminIds = [...hardcodedAdmins, ...envAdmins];
    return allAdminIds.includes(String(chatId));
}

export async function showAdminPanel(chatId, messageId) {
    if (!isAdmin(chatId)) return;
    const text = "👑 *Admin Panel*\n\nSilakan pilih menu di bawah:";
    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "👥 List Detail User", callback_data: "admin_list_users_page_1" }],
                [{ text: "📜 Lihat History User", callback_data: "admin_history_select_user_page_1" }]
            ]
        }
    };
    try {
        if (messageId) {
            await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options }).catch(() => { });
        } else {
            await bot.sendMessage(chatId, text, options);
        }
    } catch (error) {
        console.error('❌ Failed to show admin panel:', error.message);
    }
}

export async function handleAdminCommand(msg) {
    await showAdminPanel(msg.chat.id, null);
}

export async function listAllUsers(chatId, page = 1, messageId) {
    if (!isAdmin(chatId)) return;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const db = getDb();
    if (!db) {
        try {
            await bot.sendMessage(chatId, '❌ Database tidak tersedia.', { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('❌ Failed to send database error:', error.message);
        }
        return;
    }

    const { total } = db.prepare('SELECT COUNT(*) as total FROM tg_users').get();
    const users = db.prepare('SELECT id, telegram_id, username, first_name, last_name FROM tg_users ORDER BY id DESC LIMIT ? OFFSET ?').all(limit, offset);
    
    let text = `👥 *List Detail User (Halaman ${page})*`;
    const keyboard = [];
    users.forEach(user => {
        const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
        const usernamePart = user.username ? `(@${user.username})` : '';
        const label = `${fullName} ${usernamePart} [${user.telegram_id}]`;

        keyboard.push([{ text: label, callback_data: `admin_user_details_${user.id}_${page}` }]);
    });

    const navigationRow = [];
    if (page > 1) navigationRow.push({ text: "⬅️ Sebelumnya", callback_data: `admin_list_users_page_${page - 1}` });
    if (total > page * limit) navigationRow.push({ text: `Selanjutnya ➡️`, callback_data: `admin_list_users_page_${page + 1}` });
    if (navigationRow.length > 0) keyboard.push(navigationRow);
    keyboard.push([{ text: "⬅️ Kembali ke Menu Admin", callback_data: "admin_panel_main" }]);

    try {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }).catch(() => { });
    } catch (error) {
        console.error('❌ Failed to list users:', error.message);
    }
}

export async function showUserDetails(chatId, userId, page, messageId) {
    if (!isAdmin(chatId)) return;
    const db = getDb();
    if (!db) {
        try {
            await bot.sendMessage(chatId, '❌ Database tidak tersedia.', { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('❌ Failed to send database error:', error.message);
        }
        return;
    }

    const user = db.prepare('SELECT telegram_id, username, first_name, last_name, invitationCode, apikey FROM tg_users WHERE id = ?').get(userId);
    if (!user) return;

    const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
    const usernamePart = user.username ? `(@${user.username})` : '';
    const userIdentifier = `${fullName} ${usernamePart}`;

    const reffCode = user.invitationCode || 'Tidak ada';
    const apiKeyStatus = user.apikey ? 'Sudah diset' : 'Tidak ada';

    let text = `👤 *Detail untuk ${userIdentifier}* [\`${user.telegram_id}\`]\n\n`;
    text += `└ Kode Reff: \`${reffCode}\`\n`;
    text += `└ Apikey: \`${apiKeyStatus}\``;

    const keyboard = [[{ text: "⬅️ Kembali ke List User", callback_data: `admin_list_users_page_${page}` }]];

    try {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }).catch(() => { });
    } catch (error) {
        console.error('❌ Failed to show user details:', error.message);
    }
}

export async function selectUserForHistory(chatId, page = 1, messageId) {
    if (!isAdmin(chatId)) return;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const db = getDb();
    if (!db) {
        try {
            await bot.sendMessage(chatId, '❌ Database tidak tersedia.', { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('❌ Failed to send database error:', error.message);
        }
        return;
    }

    const { total } = db.prepare('SELECT COUNT(*) as total FROM tg_users').get();
    const users = db.prepare('SELECT id, telegram_id, username, first_name, last_name FROM tg_users ORDER BY id DESC LIMIT ? OFFSET ?').all(limit, offset);
    
    let text = `📜 *Pilih User untuk Dilihat History-nya (Hal. ${page})*`;
    const keyboard = [];
    users.forEach(user => {
        const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
        const usernamePart = user.username ? `(@${user.username})` : '';
        const label = `${fullName} ${usernamePart} [${user.telegram_id}]`;

        keyboard.push([{ text: label, callback_data: `admin_history_list_${user.id}_${page}` }]);
    });

    const navigationRow = [];
    if (page > 1) navigationRow.push({ text: "⬅️ Sebelumnya", callback_data: `admin_history_select_user_page_${page - 1}` });
    if (total > page * limit) navigationRow.push({ text: `Selanjutnya ➡️`, callback_data: `admin_history_select_user_page_${page + 1}` });
    if (navigationRow.length > 0) keyboard.push(navigationRow);
    keyboard.push([{ text: "⬅️ Kembali ke Menu Admin", callback_data: "admin_panel_main" }]);

    try {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }).catch(() => { });
    } catch (error) {
        console.error('❌ Failed to select user for history:', error.message);
    }
}

export async function showHistoryList(chatId, userId, page, messageId) {
    if (!isAdmin(chatId)) return;
    const db = getDb();
    if (!db) {
        try {
            await bot.sendMessage(chatId, '❌ Database tidak tersedia.', { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('❌ Failed to send database error:', error.message);
        }
        return;
    }

    const histories = db.prepare('SELECT h.id, h.created_at FROM history h WHERE h.customer_id = ? ORDER BY h.created_at DESC LIMIT 20').all(userId);
    const user = db.prepare('SELECT username, telegram_id, first_name, last_name FROM tg_users WHERE id = ?').get(userId);

    const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
    const usernamePart = user.username ? `(@${user.username})` : '';
    const userIdentifier = `${fullName} ${usernamePart}`;

    let text = `📜 *History untuk ${userIdentifier}*`;
    const keyboard = [];

    if (histories.length > 0) {
        histories.forEach(h => {
            const date = new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
            keyboard.push([{ text: date, callback_data: `admin_history_details_${h.id}` }]);
        });
    } else {
        text = `Tidak ada history untuk ${userIdentifier}.`;
    }
    keyboard.push([{ text: "⬅️ Kembali ke Pilih User", callback_data: `admin_history_select_user_page_${page}` }]);

    try {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }).catch(() => { });
    } catch (error) {
        console.error('❌ Failed to show history list:', error.message);
    }
}

export async function showHistoryDetails(chatId, historyId, messageId) {
    if (!isAdmin(chatId)) return;
    const db = getDb();
    if (!db) {
        try {
            await bot.sendMessage(chatId, '❌ Database tidak tersedia.', { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('❌ Failed to send database error:', error.message);
        }
        return;
    }

    const history = db.prepare('SELECT h.phoneNumber, h.pin, h.created_at, h.customer_id FROM history h WHERE h.id = ?').get(historyId);
    if (!history) return;

    const date = new Date(history.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });

    let text = `📜 *Detail History*\n\n`;
    text += ` └ 🕒 Waktu: \`${date}\`\n`;
    text += ` └ 📞 Nomor: \`${history.phoneNumber}\`\n`;
    text += ` └ 🔒 PIN: \`${history.pin}\``;

    // Cari tahu user ini ada di halaman berapa di menu 'selectUserForHistory'
    const { rank } = db.prepare('SELECT COUNT(*) as rank FROM tg_users WHERE id <= ?').get(history.customer_id);
    const page = Math.ceil(rank / 10);

    const keyboard = [[{ text: "⬅️ Kembali ke List History", callback_data: `admin_history_list_${history.customer_id}_${page}` }]];

    try {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }).catch(() => { });
    } catch (error) {
        console.error('❌ Failed to show history details:', error.message);
    }
}

export async function botStartup() {
    const adminId = '5845170034'; // ID Telegram kamu
    const startTime = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'long',
        timeStyle: 'medium'
    });

    const message = `✅ *Bot is Running!*\nWelcome to Tomoro Account Creator Bot\n\n*${startTime} WIB*`;

    try {
        await bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
        console.log(`✅ Startup notification sent to admin ID: ${adminId}`);
    } catch (error) {
        console.error(`❌ Failed to send startup notification to admin ID: ${adminId}. Error: ${error.message}`);
        console.error("Make sure admin has started a conversation with the bot first.");
    }
}