import dotenv from 'dotenv';
import { Database } from './database.js';
import { BossService } from './services/bossService.js';
import { BOSS_RESPAWN_TIMES } from './config.js';

dotenv.config();

async function updateAllBosses() {
  try {
    const db = new Database();
    const bossService = new BossService(db);

    // 先更新有明確死亡時間的 Boss
    const bossDeaths = [
      { level: 50, time: '2024/11/02 12:14' },
      { level: 55, time: '2024/11/02 11:19' },
      { level: 60, time: '2024/11/02 17:20' },
      { level: 62, time: '2024/11/02 02:40' },
      { level: 63, time: '2024/11/02 18:37' },
      { level: 65, time: '2024/11/02 21:39' },
      { level: 68, time: '2024/11/02 05:42' },
      { level: 72, time: '2024/11/02 14:38' },
      { level: 77, time: '2024/11/02 20:18' },
      { level: 78, time: '2024/11/02 20:26' },
      { level: 85, time: '2024/11/01 12:32' },
      { level: 87, time: '2024/11/02 16:36' }
    ];

    console.log('更新 Boss 死亡時間...');
    for (const boss of bossDeaths) {
      if (boss.time !== '--') {
        console.log(`\n更新 ${boss.level} 級 Boss:`);
        await bossService.handleBossDeathWithDate(boss.level, new Date(boss.time));
      }
    }

    // 自動檢查所有 Boss 是否需要更新重生時間
    console.log('\n檢查未重生的 Boss...');
    const allBosses = await db.getAllBosses();
    const now = new Date();

    for (const boss of allBosses) {
      if (boss.nextAppearTime === '--' || boss.nextAppearTime === '#VALUE!') {
        continue; // 跳過沒有重生時間的 Boss
      }

      const nextAppearTime = new Date(boss.nextAppearTime.replace(/月|日/g, '/'));
      const timeDifferenceInHours = (now - nextAppearTime) / (1000 * 60 * 60);

      // 如果已經超過重生時間，就更新
      if (timeDifferenceInHours > 0) {
        console.log(`\n檢測到 ${boss.level} 級 Boss 已超過重生時間，進行更新...`);
        await bossService.handleBossNoShow(boss.level);
      }
    }

    // 顯示更新後的結果
    console.log('\n更新後的 Boss 時間:');
    const allTimes = await bossService.getAllBossTimes();
    console.log(allTimes);

  } catch (error) {
    console.error('更新時發生錯誤:', error);
  }
}

updateAllBosses(); 