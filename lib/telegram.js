const EventEmitter = require('events');


class Telegram extends EventEmitter {

  constructor(options) {
    super();
    this.options = {
      // a: options.a,
    };

    this.start();
  }

  start() {

  }

}

module.exports = Telegram;
