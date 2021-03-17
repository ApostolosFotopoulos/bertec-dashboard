const SerialPort = require('serialport')

// Scan for devices
SerialPort.list().then(function(data){
  console.log(data);
})

// Open the port and listen for data
const port = new SerialPort('/dev/tty.Bluetooth-Incoming-Port')

// Read data 
port.on('data',function(data){
  console.log("Data: "+data);
})