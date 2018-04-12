const Plugin = require('./lib/plugin');
const TelegramBot = require('node-telegram-bot-api');

const plugin = new Plugin();
const BASE = {};

let bot = null;

plugin.on('params', params => {
  start(params);
});

function createUser(id) {
  if (!BASE[id]) {
    BASE[id] = {
      id: id,
      access: true,
    };
  }
  bot.sendMessage(id, 'Registration successful. Thank you!');
}

function command_start(msg) {
  const option = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [[{ text: 'My phone number', request_contact: true }], ['Cancel']]
    }
  };

  bot.sendMessage(msg.chat.id, 'For registration I need your number', option);
}

function command_reg(msg) {
  const id = msg.chat.id;
  createUser(id);
}

function message(msg) {
  const id = msg.chat.id;

  if (msg.reply_to_message) {
    const id = msg.chat.id;
    const phone_number = msg.contact.phone_number;
      createUser(id);
      // console.log(phone_number);
  }

  if (!msg.entities && msg.text && BASE[id]) {
      console.log(msg.text);
  }
}

function start(options) {
  const token = '578902439:AAHQudZo296l17lMfpLu1GE-4e8mKLxCM4A';
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, command_start);
  bot.onText(/\/reg/, command_reg);
  bot.on('message', message);
}
