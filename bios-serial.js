const serialNumber = require('serial-number');

serialNumber.preferUUID = true;

serialNumber(function (err, value) {
    console.log("Serial Number: "+value);
});
