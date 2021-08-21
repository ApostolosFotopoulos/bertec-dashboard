var net = require('net');
var client = new net.Socket();

client.connect(5422, "127.0.0.1",);

client.on('connect', function () {
  console.log('Client: connection established with server');
  console.log('---------client details -----------------');
  client.write('HELLO WORLD')
});

client.on('data', function(data) {
  console.log('Received: ' + data);
});
