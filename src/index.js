import express from 'express';
import dotenv from 'dotenv';
import { App } from './app.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const lineBot = new App();

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
