const Plugin = require('./lib/plugin');
const Telegram = require('./lib/telegram');

const plugin = new Plugin();

plugin.on('params', params => {
  start(params);
});

function message(msg) {
  console.log(msg);
}

function start(options) {
  const telegram = new Telegram({ token: options.token, proxy: 'auto' });
  telegram.on('msg_text', message);
}
