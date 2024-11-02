import dotenv from 'dotenv';
import { Database } from './database.js';
import { BossService } from './services/bossService.js';

dotenv.config();

async function test() {
  try {
    const db = new Database();
    const bossService = new BossService(db);

    // 測試獲取所有 Boss 時間
    console.log('測試 all time:');
    var allTimes = await bossService.getAllBossTimes();
    console.log(allTimes);

    // 測試記錄 Boss 死亡
    console.log('\n測試 50 die:');
    await bossService.handleBossDeath(50);

    // 測試特定時間死亡
    console.log('\n測試 55 dead 10/2 14:30:');
    const specificDate = new Date('2024/10/2 14:30');
    await bossService.handleBossDeathWithDate(55, specificDate);

    // 測試 Boss 未重生 (使用新的 0 指令)
    console.log('\n測試 55 0:');
    await bossService.handleBossNoShow(55);

    // 顯示最終結果
    console.log('\n最終 Boss 時間:');
    allTimes = await bossService.getAllBossTimes();
    console.log(allTimes);

  } catch (error) {
    console.error('測試時發生錯誤:', error);
  }
}

test(); 