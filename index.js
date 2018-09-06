const Plugin = require('./lib/plugin');
const Telegram = require('./lib/telegram');

const plugin = new Plugin();
const users = {};
let telegram = null;

plugin.on('debug', mode => {});

plugin.on('params', params => {
  start(params);
});

plugin.on('infousers', list => {
  list.forEach(item => {
    users[Number(item.addr)] = item;
  });
});

function checkUser(id) {
  if (users.hasOwnProperty(id)) {
    return users[id];
  }
  return null ;
}

function telegram_user_not_found(id) {
  telegram.sendText(id, `Незарегистрированный пользователь ${id}. Руководство по настройке https://intrahouse.ru/shop/`);
}

function telegram_message({ from, text }) {
  const user = checkUser(from.id);
  if (user) {
    plugin.debug(`msg -> id:${from.id}, text:${text}`);
    telegram.sendText(from.id, text);
  } else {
    telegram_user_not_found(from.id)
  }
}

function telegram_debug(text) {
  plugin.debug(text);
}

function start(options) {
  plugin.debug("version: 0.0.2");

  telegram = new Telegram({ token: options.token, proxy: options.proxy === 'manual' ? options.HTTPProxy : options.proxy });
  telegram.on('debug', telegram_debug);
  telegram.on('msg_text', telegram_message);

  telegram.start();
}
