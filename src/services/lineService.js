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

    console.log('Attempting to send message:', {
      groupId: LINE_CONFIG.GROUP_ID,
      message: message
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    });

    // 檢查回應狀態
    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`LINE API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    // 檢查配額
    try {
      const quotaResponse = await fetch('https://api.line.me/v2/bot/message/quota', {
        headers: headers
      });
      
      if (!quotaResponse.ok) {
        console.error('Error checking quota:', await quotaResponse.json());
      } else {
        const quotaData = await quotaResponse.json();
        
        const consumptionResponse = await fetch('https://api.line.me/v2/bot/message/quota/consumption', {
          headers: headers
        });
        
        if (!consumptionResponse.ok) {
          console.error('Error checking consumption:', await consumptionResponse.json());
        } else {
          const consumptionData = await consumptionResponse.json();
          const remainingQuota = quotaData.value - consumptionData.totalUsage;
          
          console.log('訊息配額資訊:', {
            總配額: quotaData.value,
            已使用: consumptionData.totalUsage,
            剩餘: remainingQuota
          });
        }
      }
    } catch (quotaError) {
      console.error('Error checking message quota:', quotaError);
      // 配額檢查失敗不影響主要發送功能
    }
    
    console.log('Message sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending message:', {
      error: error.message,
      token: LINE_CONFIG.TOKEN ? '已設定' : '未設定',
      groupId: LINE_CONFIG.GROUP_ID,
      message
    });

    // 重新拋出錯誤，讓呼叫者知道發送失敗
    throw new Error(`發送訊息失敗: ${error.message}`);
  }
}; 