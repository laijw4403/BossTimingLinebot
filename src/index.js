import express from 'express';
import dotenv from 'dotenv';
import { App } from './app.js';
import { ReminderService } from './services/reminderService.js';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const lineBot = new App();
const reminderService = new ReminderService();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    if (events && events.length > 0) {
      await lineBot.handleWebhook(events[0]);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

reminderService.start();

// 使用環境變數
const PING_INTERVAL = process.env.PING_INTERVAL || 10 * 60 * 1000; // 預設 10 分鐘
const APP_URL = process.env.APP_URL; // 從環境變數讀取

// 只有在設定了 APP_URL 時才啟動 ping
if (APP_URL) {
  console.log('Starting auto-ping with interval:', PING_INTERVAL, 'ms');
  setInterval(async () => {
    try {
      const response = await fetch(`${APP_URL}/health`);
      console.log('Ping result:', response.status === 200 ? 'OK' : 'Failed');
    } catch (error) {
      console.error('Ping failed:', error);
    }
  }, PING_INTERVAL);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
