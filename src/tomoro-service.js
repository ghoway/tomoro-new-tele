// src/tomoro-service.js - Webhook version for Vercel
import axios from 'axios';
import tomoroHeader from './tomoro-header.js';
import crypto from 'crypto';

// Simple logger functions for Vercel
const loggerInfo = (message) => console.log(`ℹ️ ${message}`);
const loggerSuccess = (message) => console.log(`✅ ${message}`);
const loggerFailed = (message) => console.log(`❌ ${message}`);

export async function tomoroLogout(deviceCode, token) {
  try {
    const { data } = await axios.post(
      'https://api-service.tomoro-coffee.id/portal/app/member/logout',
      '',
      {
        headers: tomoroHeader(token, deviceCode),
      }
    );
    console.log('Logout response:', data);
  } catch (error) {
    console.log('failed logout:', error.message);
    throw error;
  }
}

export async function tomoroReqOtp(phoneNum, deviceCode) {
  try {
    loggerInfo(`Sending OTP to ${phoneNum}`);

    const r = await axios.get(
      'https://api-service.tomoro-coffee.id/portal/app/member/sendMessage',
      {
        params: {
          phone: phoneNum, // 8xxxxxxxx
          areaCode: '62',
          verifyChannel: 'SMS',
        },
        headers: tomoroHeader(deviceCode),
      }
    );
    
    if (r.data.success === false) {
      loggerFailed(r.data.msg);
      if (r.data.msg === 'Request too frequent. Please try again in 1 hour') {
        const response = {
          success: false,
          limit: true,
          msg: r.data.msg,
        };
        return response;
      }
      throw new Error(r.data.msg);
    }

    loggerSuccess(`OTP success send to ${phoneNum}`);
    return { success: true, serverRequestId: r.data.serverRequestId };
  } catch (error) {
    console.error('❌ OTP request failed:', error.message);
    throw error;
  }
}

export async function tomoroLoginOrRegister(phoneNum, verifyCode, deviceCode) {
  try {
    const { data } = await axios.post(
      'https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister',
      {
        phoneArea: '62',
        phone: phoneNum,
        verifyCode: verifyCode,
        language: 'id',
        deviceCode: '1',
        deviceName: '1',
        channel: 'google play',
        revision: '3.0.0',
        type: 2,
        source: '563ZYE',
      },
      {
        headers: tomoroHeader(deviceCode),
      }
    );
    return data;
  } catch (error) {
    console.error('❌ Login/Register failed:', error.message);
    throw error;
  }
}

export async function tomoroModifyData(
  deviceCode,
  token,
  email,
  nickname,
  gender,
  birthday,
  invitationCode
) {
  try {
    const res = await axios.post(
      'https://api-service.tomoro-coffee.id/portal/app/member/modifyData',
      {
        email: email,
        nickname: nickname,
        gender: parseInt(gender),
        birth: birthday,
        invitationCode: invitationCode,
      },
      {
        headers: tomoroHeader(deviceCode, token),
      }
    );
    return res;
  } catch (error) {
    console.error('❌ Modify data failed:', error.message);
    throw error;
  }
}

export async function setPassword(deviceCode, token, md5pass) {
  try {
    const { data } = await axios.post(
      'https://api-service.tomoro-coffee.id/portal/app/member/v2/setPassWord',
      {
        password: `${md5pass}`,
      },
      {
        headers: tomoroHeader(deviceCode, token),
      }
    );
    if (data.success === false) {
      console.log('❌ Set password failed response:', data);
      throw new Error('Failed to set PIN');
    }
    console.log('✅ PIN set successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Set password error:', error.message);
    throw error;
  }
}