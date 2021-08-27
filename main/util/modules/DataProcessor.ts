import {  Record, StanceDuration, Symmetries  } from './Interfaces';
import { WEIGHT_THRESHOLD_PERCENT, RAW_STEP } from "../constants.js";

class DataProcessor {

  static calculateSymmetries(records: Array<Record>, weight: number, validSteps: Array<String>):Symmetries {
    let symmetries: Symmetries = {
      stance: 0,
    }
    symmetries.stance = this.calculateStanceSymmetry(records, weight, validSteps);

    console.log(symmetries);
    return symmetries;
  }
  static calculateStanceSymmetry(records: Array<Record>, weight: number, validSteps: Array<String>):number {
    
    let leftFootIsLocked: boolean = false;
    let rightFootIsLocked: boolean = false;
    
    let leftFootStanceDuration: StanceDuration = {
      startTimestamp: "",
      endTimestamp: ""
    }
    let rightFootStanceDuration: StanceDuration = {
      startTimestamp: "",
      endTimestamp: ""
    }

    let leftFootStanceDurations: Array<StanceDuration> = [];
    let rightFootStanceDurations: Array<StanceDuration> = [];

    let stance = 0;

    // Calculate all the durations for every step
    for (var i = 0; i < records.length; i += RAW_STEP) {
      let fz1: number = Number(records[i].Fz1);
      var fz2: number = Number(records[i].Fz2);
      var threshold: number = Number(WEIGHT_THRESHOLD_PERCENT * weight);

      if (rightFootIsLocked) {
        if (fz2 < threshold) {
          rightFootIsLocked = false;
          rightFootStanceDuration.endTimestamp = records[i].Timestamp;
          rightFootStanceDurations = [...rightFootStanceDurations, rightFootStanceDuration];
        }
      } else {
        if (fz2 > threshold) {
          rightFootIsLocked = true;
          rightFootStanceDuration = Object.assign({}, {
            startTimestamp: "",
            endTimestamp: ""
          });
          rightFootStanceDuration.startTimestamp = records[i].Timestamp;
        }
      }

      if (leftFootIsLocked) {
        if (fz1 < threshold) {
          leftFootIsLocked = false;
          leftFootStanceDuration.endTimestamp = records[i].Timestamp;
          leftFootStanceDurations = [...leftFootStanceDurations, leftFootStanceDuration];
        }
      } else {
        if (fz1 > threshold) {
          leftFootIsLocked = true;
          leftFootStanceDuration = Object.assign({}, {
            startTimestamp: "",
            endTimestamp: ""
          });
          leftFootStanceDuration.startTimestamp = records[i].Timestamp;
        }
      }
    }

    // Include only the valid steps
    leftFootStanceDurations = validSteps ? leftFootStanceDurations.filter((_, idx) => validSteps.includes(`${idx + 1}`)) : leftFootStanceDurations;
    rightFootStanceDurations = validSteps ? rightFootStanceDurations.filter((_, idx) => validSteps.includes(`${idx + 1}`)) : rightFootStanceDurations;

    // Calculate the stance symmetry
    for (var i = 0; i < Math.min(leftFootStanceDurations.length, rightFootStanceDurations.length); i+=1){
      if (
        rightFootStanceDurations[i].startTimestamp != rightFootStanceDurations[i].endTimestamp &&
        leftFootStanceDurations[i].startTimestamp != leftFootStanceDurations[i].endTimestamp
      ) {
        stance += ( Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp))/(Number(leftFootStanceDurations[i].endTimestamp)- Number(rightFootStanceDurations[i].startTimestamp))
      }
    }

    return stance;
  }
}

export { DataProcessor };
