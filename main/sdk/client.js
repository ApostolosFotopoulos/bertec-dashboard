const net = require('net');
net.bufferSize = 300000;
net.bytesRead = 300000;
const client = net.connect({port: 8124, address: 'localhost' }, () => {
  console.log('connected to server!');
  client.write('world!\r\n');
});
client.on('data', (data) => {
  // console.log(data.toString());
  console.log(net.bufferSize,data.length);
  client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
});