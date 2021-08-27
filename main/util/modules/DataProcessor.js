"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
const constants_js_1 = require("../constants.js");
class DataProcessor {
    static calculateLoadingSymmetry(records, weight, validSteps) {
        let leftFootIsLocked = false;
        let rightFootIsLocked = false;
        let leftFootDurations = {
            standDurations: [],
        };
        let rightFootDurations = {
            standDurations: [],
        };
        let leftFootPress = 0;
        let rightFootPress = 0;
        for (var i = 0; i < records.length; i += constants_js_1.RAW_STEP) {
            let fz1 = Number(records[i].Fz1);
            var fz2 = Number(records[i].Fz2);
            var threshold = Number(constants_js_1.WEIGHT_THRESHOLD_PERCENT * weight);
            if (rightFootIsLocked) {
                if (fz2 < threshold) {
                    rightFootIsLocked = false;
                    console.log(`[${i}] Right leaves the ground`);
                }
            }
            else {
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
            }
            else {
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
exports.DataProcessor = DataProcessor;
