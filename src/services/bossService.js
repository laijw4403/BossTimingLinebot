import { BOSS_RESPAWN_TIMES } from '../config.js';
import { sendMessageToGroup } from './lineService.js';
import { formatDate } from '../utils/dateUtils.js';

export class BossService {
  constructor(database) {
    this.db = database;
  }

  async getAllBossTimes() {
    try {
      const bosses = await this.db.getAllBosses();
      let response = '目前所有 Boss 重生資訊：\n';
      
      for (const boss of bosses) {
        if (boss.lastKilledTime !== '--') {
          response += `${boss.level}: ${boss.nextAppearTime}\n`;
        } else {
          response += `${boss.level}: 尚未擊殺\n`;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error getting all boss times:', error);
      throw error;
    }
  }

  async handleBossDeath(bossLevel) {
    try {
      if (!BOSS_RESPAWN_TIMES[bossLevel]) {
        await sendMessageToGroup(`無效的 Boss 等級: ${bossLevel}`);
        return;
      }

      const now = new Date();
      now.setMinutes(now.getMinutes() - 1); // 往前推1分鐘，確保計算準確
      
      const respawnTime = await this.db.updateBossDeath(bossLevel, now);
      await sendMessageToGroup(`${bossLevel} Boss 下次重生時間: ${formatDate(respawnTime)}`);
    } catch (error) {
      console.error('Error handling boss death:', error);
      throw error;
    }
  }

  async handleBossDeathWithDate(bossLevel, deathDate) {
    try {
      if (!BOSS_RESPAWN_TIMES[bossLevel]) {
        await sendMessageToGroup(`無效的 Boss 等級: ${bossLevel}`);
        return;
      }

      const respawnTime = await this.db.updateBossDeath(bossLevel, deathDate);
      await sendMessageToGroup(`${bossLevel} Boss 下次重生時間: ${formatDate(respawnTime)}`);
    } catch (error) {
      console.error('Error handling boss death with date:', error);
      throw error;
    }
  }

  async handleBossNoShow(bossLevel) {
    try {
      if (!BOSS_RESPAWN_TIMES[bossLevel]) {
        await sendMessageToGroup(`無效的 Boss 等級: ${bossLevel}`);
        return;
      }

      const boss = await this.db.getBossByLevel(bossLevel);
      if (!boss) {
        await sendMessageToGroup(`找不到該 Boss 的等級: ${bossLevel}`);
        return;
      }

      if (boss.nextAppearTime === '--' || boss.nextAppearTime === '#VALUE!') {
        await sendMessageToGroup(`${bossLevel} Boss 尚未有重生時間記錄`);
        return;
      }

      const now = new Date();
      const lastRespawnTime = new Date(boss.nextAppearTime.replace(/月|日/g, '/'));
      const timeDifferenceInHours = (now - lastRespawnTime) / (1000 * 60 * 60);

      if (timeDifferenceInHours > 0) {
        const respawnInterval = BOSS_RESPAWN_TIMES[bossLevel];
        const respawnCycles = Math.ceil(timeDifferenceInHours / respawnInterval);
        
        // 計算新的重生時間，但不更新死亡時間
        const newNextAppearTime = new Date(lastRespawnTime.getTime() + 
          (respawnCycles * respawnInterval * 60 * 60 * 1000));
        
        await this.db.updateBossNextAppearTime(bossLevel, newNextAppearTime);
        await sendMessageToGroup(`${bossLevel} Boss 下次重生時間: ${formatDate(newNextAppearTime)}`);
      } else {
        await sendMessageToGroup(`${bossLevel} Boss 目前時間還未到重生時間`);
      }
    } catch (error) {
      console.error('Error handling boss no show:', error);
      throw error;
    }
  }
} 