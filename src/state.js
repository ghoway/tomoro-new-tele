// src/state.js - Webhook version for Vercel
const userState = new Map(); // chatId -> state object

export function setState(chatId, state) {
    userState.set(chatId, state);
    console.log(`📝 State set for ${chatId}:`, JSON.stringify(state, null, 2));
}

export function getState(chatId) {
    return userState.get(chatId);
}

export function clearState(chatId) {
    userState.delete(chatId);
    console.log(`🗑️ State cleared for ${chatId}`);
}