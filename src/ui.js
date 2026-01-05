// src/ui.js - Webhook version for Vercel
export const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: '📱 Registrasi Manual' }],
            [{ text: '🤖 Registrasi Otomatis' }],
            [{ text: '⚙️ Pengaturan' }, { text: '📊 Status' }],
            [{ text: '📜 History' }],
            [{ text: '⬅️ Kembali ke Menu Utama' }],
            [{ text: '❌ Cancel' }],
        ],
        resize_keyboard: true,
    },
};

export const inlineMenu = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "📊 Status", callback_data: "/status" },
                { text: "⚙️ Settings", callback_data: "/settings" }
            ],
            [
                { text: "📝 History", callback_data: "/history" },
                { text: "ℹ️ Help", callback_data: "/help" }
            ]
        ]
    }
};