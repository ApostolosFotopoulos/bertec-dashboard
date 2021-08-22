const net = require("net");
const client = new net.Socket();

client.connect(54221, "127.0.0.1");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

client.on('connect', async function () {
  console.log('Client: connection established with server');
  const writeFileEvent = {
    name: "START_WRITING_TRIAL_TO_FILE",
    value: "./test.csv"
  }
  const event = {
    name: "RESET_FORCE_PLATES",
    value: "./test.csv"
  }
  client.write(JSON.stringify(writeFileEvent));
  while (true) {
    console.log('TREST')
    client.write(JSON.stringify(event));
    await sleep(1000);
  }
});