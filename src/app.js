import { CommandHandler } from './handlers/commandHandler.js';
import { BossService } from './services/bossService.js';
import { Database } from './database.js';
import { sendMessageToGroup } from './services/lineService.js';
import { HELP_MESSAGE } from './config.js';

export class App {
  constructor() {
    this.db = new Database();
    this.bossService = new BossService(this.db);
    this.commandHandler = new CommandHandler(this.bossService);
  }

  async handleWebhook(event) {
    if (event.type === 'message' && event.message?.type === 'text') {
      await this.commandHandler.handleCommand(event.message.text);
    }
    else if (event.type === 'join') {
      // 處理加入群組事件
      await this.db.saveGroupId(event.source.groupId);
      await sendMessageToGroup(HELP_MESSAGE);
    }
  }
} 