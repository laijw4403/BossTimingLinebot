import schedule from 'node-schedule';
import { Database } from '../database.js';
import { sendMessageToGroup } from './lineService.js';

export class ReminderService {
  constructor() {
    this.db = new Database();
  }

  start() {
    // 每分鐘檢查一次
    schedule.scheduleJob('* * * * *', async () => {
      try {
        await this.checkAndSendMessages();
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    });
  }

  async checkAndSendMessages() {
    const bosses = await this.db.getAllBosses();
    const now = new Date();
    const fiveMinutesInMillis = 5 * 60 * 1000;

    for (const boss of bosses) {
      // 只檢查一次無效的時間和提醒狀態
      if (boss.hasRemind || !boss.nextAppearTime || boss.nextAppearTime === '#VALUE!') {
        continue;
      }

      const appearTime = new Date(boss.nextAppearTime.replace(/月|日/g, '/'));
      const timeUntilAppear = appearTime - now;

      if (timeUntilAppear > 0 && timeUntilAppear <= fiveMinutesInMillis) {
        console.log(`Sending reminder for boss ${boss.level}`);
        const message = `${boss.level} 即將重生於: ${boss.nextAppearTime}`;
        await sendMessageToGroup(message);
        await this.db.updateBossRemindStatus(boss.level, true);
      }
    }
  }
} 