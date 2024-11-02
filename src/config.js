export const LINE_CONFIG = {
  TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  GROUP_ID: process.env.LINE_GROUP_ID
};

export const BOSS_RESPAWN_TIMES = {
  50: 4.5,
  55: 12,
  60: 6,
  62: 4,
  63: 12,
  65: 3,
  68: 9,
  72: 9,
  77: 12,
  78: 15,
  85: 8,
  87: 6,
  90: 48
};

export const HELP_MESSAGE = 
  "可用指令:\n" +
  "1. all time - 查看所有 Boss 的重生時間。\n" +
  "2. <Boss 等級> die - 記錄 Boss 的死亡當下時間。\n" +
  "3. <Boss 等級> dead <月/日> <時:分> - 記錄 Boss 的死亡時間。\n" +
  "   範例: '50 dead 09/30 14:30'\n" +
  "4. <Boss 等級> 0 - 標記 Boss 為未重生。\n" +
  "   範例: '50 0'\n" +
  "5. help - 查詢可用指令";
