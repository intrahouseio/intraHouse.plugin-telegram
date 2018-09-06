const Plugin = require('./lib/plugin');
const Telegram = require('./lib/telegram');

const plugin = new Plugin();
let telegram = null;

plugin.on('params', params => {
  start(params);
});

plugin.on('debug', mode => {
});

function telegram_message({ from, text }) {
  plugin.debug(`msg -> id:${from.id}, text:${text}`);
  telegram.sendText(from.id, text);
}

function telegram_debug(text) {
  plugin.debug(text);
}

function start(options) {
  plugin.debug("version: 0.0.1");

  telegram = new Telegram({ token: options.token, proxy: options.proxy === 'manual' ? options.HTTPProxy : options.proxy });
  telegram.on('debug', telegram_debug);
  telegram.on('msg_text', telegram_message);

  telegram.start();
}
