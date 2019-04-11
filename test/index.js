const child = require('child_process');
const modulepath = './index.js';

const unitid = 'telegram'

const params = {
  token: '',
  proxy: 'auto',
}

const config = [];

const ps = child.fork(modulepath, [unitid]);

ps.on('message', data => {
  if (data.type === 'get' && data.tablename === `params/${unitid}`) {
    ps.send({ type: 'get', params });
  }

  if (data.type === 'get' && data.tablename === `config/${unitid}`) {
    ps.send({ type: 'get', config: {} });
  }

  if (data.type === 'data') {
    console.log('-------------data-------------', new Date().toLocaleString());
    console.log(data.data);
    console.log('');
  }

  if (data.type === 'channels') {
    console.log('-----------channels-----------', new Date().toLocaleString());
    console.log(data.data);
    console.log('');
  }

  if (data.type === 'debug') {
    console.log('-------------debug------------', new Date().toLocaleString());
    console.log(data.txt);
    console.log('');
  }
});

ps.on('close', code => {
  console.log('close');
});

ps.send({type: 'debug', mode: true });

// setTimeout(() => ps.send({ type: 'sub', data: { sendTo: [{ addr: '76739448' }], txt: { txt: 'test', img: 'snap_1554806144191.jpg' } } }), 1500)
