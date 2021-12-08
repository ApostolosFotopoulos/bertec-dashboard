const net = require('net');
const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
import { Record } from "../util/modules/Interfaces";

class Pusher{
  
  fileName: string;
  server: any;
  index = 0;
  samplingFrequency = 10;
  collectedRows = 0;
  
  constructor() {
    this.fileName = "../../mocks/both_loaded_walk_trial_1.csv"
  }

  sleep = (ms: number) =>{
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createServer = async () => {
    console.info("[INFO] Server is started at 127.0.0.1:54221");
    this.server = net.createServer(async (socket: any) => {
      console.info("[INFO] New client connected");
      const metrics: Array<Record> = await this.findMetrics();


      while (true) {    
        if (this.collectedRows == this.samplingFrequency) {
          const currentMetrics = metrics[this.index % metrics.length];
          let data = "";
          for (var key in currentMetrics) {
            if (key != "Timestamp") {
              data += `${currentMetrics[key]};` 
            }
          }
          const event = { "name": "FORCE_PLATES_EVENT", "left": "62307970739173", "right": "82581949806217", "data": data };
          socket.write(JSON.stringify(event));
          this.collectedRows = 0;
        }

        this.index += 1
        
        // Reset the index to the start 
        if (this.index === metrics.length) {
          this.index = 0;
        }

        this.collectedRows +=1
        await this.sleep(1);
      }
    });
    this.server.listen(54221, "127.0.0.1");
  }

  findMetrics = async ():Promise<Array<Record>> => {
    try {
      let metrics: Array<Record>;
      metrics = await new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname,`${this.fileName}`))
          .pipe(
            parse({ columns: true, bom: true, delimiter: [";"] }, function (error: any, records: Array<Record>) {
              if (error) {
                reject(error)
                return
              }
              resolve(records);
            })
          );
      });
      return metrics;
    } catch (e:any) {
      throw new Error(e);
    }
  }
}
export { Pusher }