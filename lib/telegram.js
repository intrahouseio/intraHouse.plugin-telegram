const EventEmitter = require('events');
const request = require('request');


class Telegram extends EventEmitter {

  constructor(options) {
    super();
    this.options = {
      interval: 10,
      proxy: null,
      proxyError: 3,
      proxyTimeout: 15,
      ...options,
    };
    this.params = {
      offset: 0,
      proxy: null,
      poll_req: null,
      poll_timer: null,
      poll_error: 0,
    };
    this.start();
  }

  checkProxy(host, callback) {
    return request({ url: 'https://api.telegram.org/bot/test', proxy: `http://${host}` }, (error, response, body) => {
      if (error === null && response.statusCode === 404 ) {
        callback(host);
      }
    });
  }


  getProxy(callback) {
    const temp = { list: [], enabled: true };
    const timer = setTimeout(check, this.options.proxyTimeout * 1000);

    function check() {
      if (temp.enabled) {
        callback(null);
      }
    }

    function result(host) {
      if (temp.enabled) {
        temp.enabled = false;
        clearTimeout(timer);
        temp.list.forEach(item => {
          item.abort();
        });
        temp.list = null;
        callback(host);
      }
    }

    request('https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list.txt', (error, response, body) => {
      if (error === null && response.statusCode === 200) {
        const data = body.split('\n').slice(4, -2);
        data.forEach(item => {
          const parse = item.split(' ');
          const host = parse[0];
          temp.list.push(this.checkProxy(host, result));
        });
      }
    });
  }

  parseMessages(messages) {
    const count = messages.length;
    if (count) {
      this.params.offset = messages[count-1].update_id + 1;
    }
    messages.forEach(item => {
      if (item.message.hasOwnProperty('text')) {
        this.emit('msg_text', item.message);
      }
    });
  }

  requestGetMessages() {
    return request({
      url: `https://api.telegram.org/bot${this.options.token}/getUpdates?offset=${this.params.offset}`,
      proxy: this.params.proxy,
    }, (error, response, body) => {
      if (error) {
        this.pollingError();
      } else {
        this.poll_req = null;
        if (response.statusCode === 200) {
          try {
            const json = JSON.parse(body);
            if (json.ok && json.result) {
              this.parseMessages(json.result);
            }
          } catch (e) {
            // console.log('JSON_PARSE_ERROR:', 'Messages parse fail!');
          }
        }
      }
    });
  }

  getMessages() {
    if (this.poll_req) {
      this.poll_req.abort();
    }
    this.poll_req = this.requestGetMessages();
  }

  pollingError() {
    if (this.options.proxy === 'auto') {
      this.params.poll_error++;
      if (this.params.poll_error === this.options.proxyError) {
        clearInterval(this.params.poll_timer);
        this.start();
      }
    }
  }

  pollingStart() {
    if (this.params.poll_timer) {
      clearInterval(this.params.poll_timer);
    }
    this.poll_error = 0;
    this.params.poll_timer = setInterval(this.getMessages.bind(this), this.options.interval * 1000);
    this.getMessages();
  }

  start() {
    if (this.options.proxy === 'auto') {
      this.getProxy(host => {
        if (host !== null) {
          this.params.proxy = `http://${host}`;
          this.pollingStart();
        } else {
          this.start();
        }
      });
    } else {
      if (this.options.proxy !== null) {
        this.params.proxy = `http://${host}`;
      }
      this.pollingStart();
    }
  }

}

module.exports = Telegram;
