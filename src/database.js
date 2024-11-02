import { google } from 'googleapis';
import { BOSS_RESPAWN_TIMES } from './config.js';

export class Database {
  constructor() {
    try {
      // 確保 JSON 字串正確解析
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = process.env.GOOGLE_SHEET_ID;

      if (!this.spreadsheetId) {
        throw new Error('Missing GOOGLE_SHEET_ID in environment variables');
      }
    } catch (error) {
      console.error('Error initializing Database:', error);
      console.error('GOOGLE_CREDENTIALS:', process.env.GOOGLE_CREDENTIALS);
      throw new Error('Failed to initialize database: ' + error.message);
    }
  }

  async getAllBosses() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Boss Timing!A2:E'
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        level: parseInt(row[0]),
        lastKilledTime: row[1] || '--',
        nextAppearTime: row[2] || '#VALUE!',
        interval: parseFloat(row[3]) || 0,
        hasRemind: row[4] === 'TRUE'
      }));
    } catch (error) {
      console.error('Error getting boss data:', error);
      throw error;
    }
  }

  async getBossByLevel(level) {
    try {
      const allBosses = await this.getAllBosses();
      return allBosses.find(boss => boss.level === level);
    } catch (error) {
      console.error(`Error getting boss level ${level}:`, error);
      throw error;
    }
  }

  async updateBossDeath(level, deathTime) {
    try {
      // 找到對應的行數
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Boss Timing!A2:A'
      });
      
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => parseInt(row[0]) === level) + 2; // +2 因為標題列和0-based index

      if (rowIndex < 2) {
        throw new Error(`找不到等級 ${level} 的 Boss`);
      }

      // 格式化時間
      const formattedDeathTime = `${deathTime.getMonth() + 1}月${deathTime.getDate()}日 ${String(deathTime.getHours()).padStart(2, '0')}:${String(deathTime.getMinutes()).padStart(2, '0')}`;
      
      // 計算重生時間
      const respawnHours = BOSS_RESPAWN_TIMES[level];
      const respawnTime = new Date(deathTime);
      respawnTime.setHours(respawnTime.getHours() + Math.floor(respawnHours));
      respawnTime.setMinutes(respawnTime.getMinutes() + (respawnHours % 1) * 60);
      
      const formattedRespawnTime = `${respawnTime.getMonth() + 1}月${respawnTime.getDate()}日 ${String(respawnTime.getHours()).padStart(2, '0')}:${String(respawnTime.getMinutes()).padStart(2, '0')}`;

      // 更新 Google Sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Boss Timing!B${rowIndex}:C${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[formattedDeathTime, formattedRespawnTime]]
        }
      });

      // 重置提醒狀態
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Boss Timing!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['FALSE']]
        }
      });

      return respawnTime;
    } catch (error) {
      console.error(`Error updating boss death for level ${level}:`, error);
      throw error;
    }
  }

  async getBossRespawnTime(level) {
    try {
      const boss = await this.getBossByLevel(level);
      return boss?.nextAppearTime || null;
    } catch (error) {
      console.error(`Error getting respawn time for level ${level}:`, error);
      throw error;
    }
  }

  async saveGroupId(groupId) {
    // 如果需要的話實作這個方法
    console.log('Group ID:', groupId);
  }

  async updateBossNextAppearTime(level, nextAppearTime) {
    try {
      // 找到對應的行數
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Boss Timing!A2:A'
      });
      
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => parseInt(row[0]) === level) + 2;

      if (rowIndex < 2) {
        throw new Error(`找不到等級 ${level} 的 Boss`);
      }

      // 格式化重生時間
      const formattedNextAppearTime = `${nextAppearTime.getMonth() + 1}月${nextAppearTime.getDate()}日 ${String(nextAppearTime.getHours()).padStart(2, '0')}:${String(nextAppearTime.getMinutes()).padStart(2, '0')}`;

      // 只更新重生時間
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Boss Timing!C${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[formattedNextAppearTime]]
        }
      });

      // 重置提醒狀態
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Boss Timing!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['FALSE']]
        }
      });

      return nextAppearTime;
    } catch (error) {
      console.error(`Error updating boss next appear time for level ${level}:`, error);
      throw error;
    }
  }
} 