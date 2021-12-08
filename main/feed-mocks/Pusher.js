"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pusher = void 0;
const net = require('net');
const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
class Pusher {
    constructor() {
        this.index = 0;
        this.samplingFrequency = 10;
        this.collectedRows = 0;
        this.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        };
        this.createServer = async () => {
            console.info("[INFO] Server is started at 127.0.0.1:54221");
            this.server = net.createServer(async (socket) => {
                console.info("[INFO] New client connected");
                const metrics = await this.findMetrics();
                while (true) {
                    if (this.collectedRows == this.samplingFrequency) {
                        const currentMetrics = metrics[this.index % metrics.length];
                        let data = "";
                        for (var key in currentMetrics) {
                            if (key != "Timestamp") {
                                data += `${currentMetrics[key]};`;
                            }
                        }
                        const event = { "name": "FORCE_PLATES_EVENT", "left": "62307970739173", "right": "82581949806217", "data": data };
                        socket.write(JSON.stringify(event));
                        this.collectedRows = 0;
                    }
                    this.index += 1;
                    // Reset the index to the start 
                    if (this.index === metrics.length) {
                        this.index = 0;
                    }
                    this.collectedRows += 1;
                    await this.sleep(1);
                }
            });
            this.server.listen(54221, "127.0.0.1");
        };
        this.findMetrics = async () => {
            try {
                let metrics;
                metrics = await new Promise((resolve, reject) => {
                    fs.createReadStream(path.resolve(__dirname, `${this.fileName}`))
                        .pipe(parse({ columns: true, bom: true, delimiter: [";"] }, function (error, records) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(records);
                    }));
                });
                return metrics;
            }
            catch (e) {
                throw new Error(e);
            }
        };
        this.fileName = "../../mocks/both_loaded_walk_trial_1.csv";
    }
}
exports.Pusher = Pusher;
