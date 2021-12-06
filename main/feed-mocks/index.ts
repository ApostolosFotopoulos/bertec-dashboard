const { Pusher } = require('./Pusher');

const pusher = new Pusher();
const server = pusher.createServer();