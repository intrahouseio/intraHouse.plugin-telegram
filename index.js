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

plugin.on('info', data => {
  data.sendTo.forEach(user => {

    /* control notifications ON
    const hours = new Date().getHours();
    plugin.debug(`info -> id:${user.addr}, text:${data.txt}`);
    telegram.sendText(user.addr, data.txt, 9 <= hours && hours <= 18);
    */
    if (data.img === undefined) {
      plugin.debug(`send_txt -> id:${user.addr}, text:${data.txt}`);
      telegram.sendText(user.addr, data.txt);
    } else {
      plugin.debug(`send_img -> id:${user.addr}, text:${data.txt}`);
      telegram.sendImg(user.addr, data.img, data.txt);
    }
  });
});

function checkUser(id) {
  if (users.hasOwnProperty(id)) {
    return users[id];
  }
  return null ;
}

function telegram_user_not_found(id) {
  telegram.sendText(id, `User is not registered ${id}.`);
}

function telegram_message({ from, text }) {
  const user = checkUser(from.id);
  if (user) {
    plugin.debug(`msg -> id:${from.id}, text:${text}`);
    plugin.setChannelsData([{ id: 'incoming_message', value: text, ext: { userid: from.id, update: Date.now()} }])
    plugin.setChannelsData([{ id: 'incoming_message', value: '#' + text, ext: { userid: from.id, update: Date.now()} }])
    // telegram.sendText(from.id, `Received: ${text}`);
  } else {
    telegram_user_not_found(from.id)
  }
}

function telegram_debug(text) {
  plugin.debug(text);
}

function start(options) {
  plugin.debug("version: 0.0.16");

  plugin.setChannels([{ id: 'incoming_message', desc: 'incoming_message' }]);

  telegram = new Telegram({ token: options.token, proxy: options.proxy === 'manual' ? options.HTTPProxy : options.proxy });
  telegram.on('debug', telegram_debug);
  telegram.on('msg_text', telegram_message);

  telegram.start();
}
