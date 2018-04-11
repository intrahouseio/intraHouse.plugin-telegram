const Plugin = require('./lib/plugin');
const Telegram = require('./lib/telegram');

const plugin = new Plugin();

plugin.on('params', params => {
  start(params);
});


function start(options) {
  console.log('telegram --> start');
}
