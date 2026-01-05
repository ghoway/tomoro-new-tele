// api/webhook.js - Main Webhook Handler
import dotenv from 'dotenv';
import { handleStart } from '../src/handlers/startHandler.js';
import { handleMessage } from '../src/handlers/messageHandler.js';
import { handleSettingsCallback } from '../src/commands/settings.js';
import { 
    showAdminPanel, 
    listAllUsers, 
    showUserDetails, 
    selectUserForHistory, 
    showHistoryList, 
    showHistoryDetails 
} from '../src/commands/admin.js';
import { botStartup } from '../src/commands/admin.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

console.log('🔧 Environment check:');
console.log('- BOT_TOKEN exists:', !!BOT_TOKEN);
console.log('- WEBHOOK_SECRET exists:', !!WEBHOOK_SECRET);

if (!BOT_TOKEN || BOT_TOKEN.trim() === '') {
  console.error('❌ BOT_TOKEN is required - please set in Vercel environment variables');
}

// Initialize bot startup
botStartup();

// Main webhook processor
const processUpdate = async (update) => {
  console.log('🔄 Processing update type:', Object.keys(update));
  
  if (update.message) {
    if (update.message.text?.startsWith('/start')) {
      await handleStart(update.message);
    } else {
      await handleMessage(update.message);
    }
  } else if (update.callback_query) {
    await handleCallback(update.callback_query);
  } else {
    console.log('ℹ️ Unhandled update type:', Object.keys(update));
  }
};

const handleCallback = async (callbackQuery) => {
  console.log('🔘 Processing callback:', callbackQuery.data);
  
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  try {
    // Handle settings callbacks
    if (data === 'set_invite' || data === 'set_apikey') {
      await handleSettingsCallback(callbackQuery, await import('../src/db.js').then(m => m.default.getUser(chatId)));
      return;
    }

    // Handle admin callbacks
    if (data.startsWith('admin_')) {
      const [action, ...params] = data.split('_');
      
      switch (action) {
        case 'admin':
          if (params[0] === 'panel' && params[1] === 'main') {
            await showAdminPanel(chatId, msg.message_id);
          }
          break;
          
        case 'list':
          if (params[0] === 'users' && params[1] === 'page') {
            await listAllUsers(chatId, parseInt(params[2]), msg.message_id);
          }
          break;
          
        case 'user':
          if (params[0] === 'details') {
            await showUserDetails(chatId, params[1], parseInt(params[2]), msg.message_id);
          }
          break;
          
        case 'history':
          if (params[0] === 'select' && params[1] === 'user' && params[2] === 'page') {
            await selectUserForHistory(chatId, parseInt(params[3]), msg.message_id);
          } else if (params[0] === 'list') {
            await showHistoryList(chatId, params[1], parseInt(params[2]), msg.message_id);
          } else if (params[0] === 'details') {
            await showHistoryDetails(chatId, params[1], msg.message_id);
          }
          break;
      }
      
      await bot.answerCallbackQuery(callbackQuery.id);
      console.log('✅ Admin callback processed successfully');
      return;
    }

    // Handle basic callbacks
    switch (data) {
      case '/status':
        const { showStatus } = await import('../src/commands/status.js');
        await showStatus(chatId, await import('../src/db.js').then(m => m.default.getUser(chatId)));
        break;
      case '/settings':
        const { handleSettingsFlow } = await import('../src/commands/settings.js');
        await handleSettingsFlow({ chat: { id: chatId }, text: '', from: {} }, await import('../src/db.js').then(m => m.default.getUser(chatId)), null);
        break;
      case '/history':
        const { showHistory } = await import('../src/commands/history.js');
        await showHistory(chatId, await import('../src/db.js').then(m => m.default.getUser(chatId)));
        break;
      case '/help':
        await bot.sendMessage(chatId, 'ℹ️ *Bantuan*\n\n/start - Mulai bot\n/status - Cek status\n/help - Bantuan ini\n\nBot berjalan di mode serverless!', { parse_mode: 'Markdown' });
        break;
      default:
        await bot.sendMessage(chatId, 'Perintah tidak dikenali');
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
    console.log('✅ Callback processed successfully');
  } catch (error) {
    console.error('❌ Failed to process callback:', error.message);
  }
};

// Webhook endpoint handler
export default async function handler(req, res) {
  console.log('🌐 Webhook received:', req.method);
  
  // Handle CORS and preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook secret if provided
  if (WEBHOOK_SECRET && WEBHOOK_SECRET.trim() !== '') {
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    if (signature !== WEBHOOK_SECRET) {
      console.log('❌ Invalid webhook signature');
      console.log('Expected:', WEBHOOK_SECRET);
      console.log('Received:', signature);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.log('ℹ️ No webhook secret set - skipping verification');
  }

  try {
    const update = req.body;
    
    // Log incoming update for debugging
    console.log('📨 Received update:', JSON.stringify(update, null, 2));
    
    // Process the update directly
    await processUpdate(update);
    
    // Send success response
    console.log('✅ Update processed successfully');
    res.status(200).json({ status: 'ok', processed: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}