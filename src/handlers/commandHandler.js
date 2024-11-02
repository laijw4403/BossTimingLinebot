import { HELP_MESSAGE } from '../config.js';
import { sendMessageToGroup } from '../services/lineService.js';

export class CommandHandler {
  constructor(bossService) {
    this.bossService = bossService;
  }

  async handleCommand(command) {
    try {
      if (command === "all time") {
        const times = await this.bossService.getAllBossTimes();
        await sendMessageToGroup(times);
      } 
      else if (command === "help") {
        await sendMessageToGroup(HELP_MESSAGE);
      }
      else if (match = command.match(/^(\d+) die$/)) {
        await this.bossService.handleBossDeath(parseInt(match[1]));
      }
      else if (match = command.match(/^(\d+) dead (\d{1,2}\/\d{1,2}) (\d{1,2}:\d{2})$/)) {
        const deathDate = new Date(match[2] + ' ' + match[3]);
        await this.bossService.handleBossDeathWithDate(parseInt(match[1]), deathDate);
      }
      else if (match = command.match(/^(\d+) 0$/)) {
        await this.bossService.handleBossNoShow(parseInt(match[1]));
      }
    } catch (error) {
      console.error('Command handling error:', error);
    //   await sendMessageToGroup('指令處理發生錯誤，請稍後再試');
    }
  }
} 