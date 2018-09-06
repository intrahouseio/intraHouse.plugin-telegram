const Plugin = require('./lib/plugin');
const Telegram = require('./lib/telegram');

const plugin = new Plugin();
let telegram = null;
let debug = false;

plugin.on('params', params => {
  start(params);
});

plugin.on('debug', mode => {
  debug = mode;
});

function telegram_message({ from, text }) {
  if (debug) {
    plugin.debug(`msg: ${from.id}, ${text}`);
  }
  telegram.sendText(from.id, text);
}

function telegram_debug(text) {
  if (debug) {
    plugin.debug(text);
  }
}

function start(options) {
  plugin.debug("version: 0.0.1");

  telegram = new Telegram({ token: options.token, proxy: 'auto' });
  telegram.on('debug', telegram_debug);
  telegram.on('msg_text', telegram_message);

  telegram.start();
}
