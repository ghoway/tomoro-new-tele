// src/commands/status.js - Webhook version for Vercel
import bot from '../bot.js';
import { mainMenu } from '../ui.js';

export async function showStatus(chatId, user) {
    const statusText = `📊 *Status Bot*\n\n✅ Bot aktif dan berjalan\n🌐 Mode: Webhook (Vercel)\n⚡ Serverless Functions\n\n👤 User ID: \`${user.telegram_id}\`\n🎫 Invitation Code: \`${user.invitationCode || 'BELUM DI SET'}\`\n🔑 SMS API Key: \`${user.apikey ? user.apikey.substring(0, 10) + '...' : '❌ BELUM DISET'}\``;
    
    try {
        await bot.sendMessage(chatId, statusText, { ...mainMenu, parse_mode: 'Markdown' });
        console.log('✅ Status message sent successfully');
    } catch (error) {
        console.error('❌ Failed to send status message:', error.message);
        // Fallback message
        try {
            await bot.sendMessage(chatId, '📊 Status: Bot aktif dan berjalan di mode webhook', mainMenu);
        } catch (fallbackError) {
            console.error('❌ Fallback status message failed:', fallbackError.message);
        }
    }
}