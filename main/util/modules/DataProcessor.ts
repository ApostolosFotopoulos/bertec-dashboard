import { FootDurations , Record  } from './Interfaces';
import { WEIGHT_THRESHOLD_PERCENT, FREQUENCY_THRESHOLD_PERCENT, FREQUENCY, STEP, RAW_STEP } from "../constants.js";

class DataProcessor {
  static calculateLoadingSymmetry(records: Array<Record>, weight: number, validSteps: Array<Number>) {
    
    let leftFootIsLocked: boolean = false;
    let rightFootIsLocked: boolean = false;

    let leftFootDurations: FootDurations = {
      standDurations: [],
    }
    let rightFootDurations: FootDurations = {
      standDurations: [],
    }
    
    let leftFootPress = 0;
    let rightFootPress = 0;

    for (var i = 0; i < records.length; i += RAW_STEP) {
      let fz1: number = Number(records[i].Fz1);
      var fz2: number = Number(records[i].Fz2);
      var threshold: number = Number(WEIGHT_THRESHOLD_PERCENT * weight);

      if (rightFootIsLocked) {
        if (fz2 < threshold) {
          rightFootIsLocked = false;
          console.log(`[${i}] Right leaves the ground`);
        }
      } else {
        if (fz2 > threshold) {
          rightFootIsLocked = true;
          console.log(`[${i}] Right presses the ground`);
          rightFootPress += 1;
        }
      }

      if (leftFootIsLocked) {
        if (fz1 < threshold) {
          leftFootIsLocked = false;
          console.log(`[${i}] Left leaves the ground`);
        }
      } else {
        if (fz1 > threshold) {
          leftFootIsLocked = true;
          console.log(`[${i}] Left presses the ground`);
          leftFootPress += 1;
        }
      }
    }

    console.log("Right: " + rightFootPress);
    console.log("Left: " + leftFootPress);
  }
}

export { DataProcessor };
