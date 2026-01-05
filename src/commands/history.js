// src/commands/history.js - Webhook version for Vercel
import bot from '../bot.js';
import { getDb } from '../db.js';
import { mainMenu } from '../ui.js';

export async function showHistory(chatId, user) {
    try {
        const db = getDb();
        if (!db) {
            await bot.sendMessage(chatId, '📜 Database tidak tersedia. History tidak dapat ditampilkan.', mainMenu);
            return;
        }

        const stmt = db.prepare('SELECT * FROM history WHERE customer_id = ? ORDER BY created_at DESC LIMIT 5');
        const rows = stmt.all(user.telegram_id);

        if (rows.length === 0) {
            try {
                await bot.sendMessage(chatId, '📜 Belum ada history registrasi.', mainMenu);
            } catch (error) {
                console.error('❌ Failed to send empty history message:', error.message);
            }
            return;
        }

        let msgHistory = '📜 *History Registrasi Terakhir*\n\n';
        rows.forEach((h, idx) => {
            msgHistory += `${idx + 1}. 📞 No Hp: \`${h.phoneNumber}\`
🔒 PIN: \`${h.pin}\`
🎫 Code: \`${h.invitationCode || 'N/A'}\`
🕑 Pada: \`${new Date(h.created_at).toLocaleString('id-ID')}\`\n\n`;
        });

        try {
            await bot.sendMessage(chatId, msgHistory, { ...mainMenu, parse_mode: 'Markdown' });
            console.log('✅ History message sent successfully');
        } catch (error) {
            console.error('❌ Failed to send history message:', error.message);
            // Fallback message
            try {
                await bot.sendMessage(chatId, `📜 Menemukan ${rows.length} history registrasi.`, mainMenu);
            } catch (fallbackError) {
                console.error('❌ Fallback history message failed:', fallbackError.message);
            }
        }
    } catch (error) {
        console.error('❌ Failed to show history:', error.message);
        try {
            await bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengambil history.', mainMenu);
        } catch (msgError) {
            console.error('❌ Failed to send error message:', msgError.message);
        }
    }
}