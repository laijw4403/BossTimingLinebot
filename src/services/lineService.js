import { LINE_CONFIG } from '../config.js';

export const sendMessageToGroup = async (message) => {
  try {
    const url = 'https://api.line.me/v2/bot/message/push';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CONFIG.TOKEN}`
    };

    const postData = {
      to: LINE_CONFIG.GROUP_ID,
      messages: [{
        type: 'text',
        text: message
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    });
    
    console.log('Message sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 