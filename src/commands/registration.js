// src/commands/registration.js - Webhook version for Vercel
import crypto from 'crypto';
import smssxck from 'smssxck';
import { tomoroLoginOrRegister, tomoroReqOtp, setPassword } from '../tomoro-service.js';
import bot from '../bot.js';
import { setState, clearState } from '../state.js';
import { getDb } from '../db.js';
import { mainMenu } from '../ui.js';

// Simple logger for Vercel
const loggerFailed = (message) => console.error(`❌ ${message}`);

async function handlePinInput(chatId, pin, user, state) {
    const { phoneNum, deviceCode, token } = state;
    const md5pass = crypto.createHash('md5').update(pin).digest('hex');
    
    try {
        await setPassword(deviceCode, token, md5pass);

        // Save to database
        const db = getDb();
        if (db) {
            try {
                const stmt = db.prepare('INSERT INTO history (customer_id, phoneNumber, pin, invitationCode) VALUES (?, ?, ?, ?)');
                stmt.run(user.telegram_id, phoneNum, pin, user.invitationCode || '');
                console.log('✅ Registration saved to database');
            } catch (dbError) {
                console.error('⚠️ Failed to save to database:', dbError.message);
            }
        }

        clearState(chatId);
        try {
            await bot.sendMessage(chatId, '✅ Registrasi sukses! 🎉\n\nAkun Tomoro Anda sudah terdaftar dan siap digunakan.', mainMenu);
        } catch (error) {
            console.error('❌ Failed to send success message:', error.message);
        }
    } catch (error) {
        clearState(chatId);
        console.error('❌ Failed to set PIN:', error.message);
        try {
            await bot.sendMessage(chatId, '❌ Gagal mengatur PIN. Silakan ulangi proses.', mainMenu);
        } catch (msgError) {
            console.error('❌ Failed to send error message:', msgError.message);
        }
    }
}

export async function handleRegistrationFlow(msg, user, state) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!state) {
        if (text === '📱 Registrasi Manual') {
            setState(chatId, { step: 'waiting_phone', type: 'registration', regType: 'manual' });
            try {
                await bot.sendMessage(chatId, '📱 *Registrasi Manual*\n\nKirim nomor HP (tanpa kode negara):\nContoh: `81234567890`', { parse_mode: 'Markdown' });
            } catch (error) {
                console.error('❌ Failed to send manual registration message:', error.message);
            }
            return;
        }
        if (text === '🤖 Registrasi Otomatis') {
            return startAutoRegistration(chatId, user);
        }
    }

    switch (state.step) {
        case 'waiting_phone':
            return handlePhoneInput(chatId, text, state);
        case 'waiting_otp':
            return handleOtpInput(chatId, text, user, state);
        case 'waiting_pin':
            return handlePinInput(chatId, text, user, state);
    }
}

async function handlePhoneInput(chatId, phoneNum, state) {
    const deviceCode = crypto.randomBytes(8).toString('hex');
    try {
        await tomoroReqOtp(phoneNum, deviceCode);
        setState(chatId, { ...state, step: 'waiting_otp', phoneNum, deviceCode });
        try {
            await bot.sendMessage(chatId, '📩 OTP sudah dikirim. Balas dengan kode OTP:');
        } catch (error) {
            console.error('❌ Failed to send OTP confirmation:', error.message);
        }
    } catch (err) {
        console.error('❌ Failed to send OTP:', err.message);
        try {
            await bot.sendMessage(chatId, '❌ Gagal mengirim OTP. Silakan masukkan nomor HP yang valid.');
        } catch (error) {
            console.error('❌ Failed to send OTP error message:', error.message);
        }
    }
}

async function handleOtpInput(chatId, otp, user, state) {
    const { phoneNum, deviceCode } = state;
    try {
        const res = await tomoroLoginOrRegister(phoneNum, otp, deviceCode);
        const token = res.data.token;
        setState(chatId, { ...state, step: 'waiting_pin', token });
        try {
            await bot.sendMessage(chatId, '🔒 Masukkan PIN (6 digit):');
        } catch (error) {
            console.error('❌ Failed to send PIN request:', error.message);
        }
    } catch (error) {
        console.error('❌ OTP verification failed:', error.message);
        clearState(chatId);
        try {
            await bot.sendMessage(chatId, '❌ OTP salah atau sudah kedaluwarsa. Silakan ulangi proses registrasi.', mainMenu);
        } catch (msgError) {
            console.error('❌ Failed to send OTP error message:', msgError.message);
        }
    }
}

async function startAutoRegistration(chatId, user) {
    if (!user.apikey) {
        try {
            await bot.sendMessage(chatId, '❌ APIKEY belum diset. Silakan set dulu di menu ⚙️ Pengaturan.');
        } catch (error) {
            console.error('❌ Failed to send API key error:', error.message);
        }
        return;
    }
    
    try {
        await bot.sendMessage(chatId, '🤖 *Registrasi Otomatis*\n\nFitur ini sedang dalam pengembangan untuk mode webhook.\n\nSilakan gunakan 📱 Registrasi Manual untuk sementara.', { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('❌ Failed to send auto registration message:', error.message);
    }
}