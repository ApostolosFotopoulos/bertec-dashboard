"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
const constants_1 = require("../constants");
class DataProcessor {
    static formData() {
    }
    static formStepsForAverageMetrics(records, weight, frequency) {
        let fx = this.formSteps(records, weight, frequency, "Fx1", "Fx2");
        let fy = this.formSteps(records, weight, frequency, "Fy1", "Fy2");
        let fz = this.formSteps(records, weight, frequency, "Fz1", "Fz2");
        return {
            fx,
            fy,
            fz
        };
    }
    static formSteps(records, weight, frequency, leftCol, rightCol, selectedSteps) {
        // Left foot variables
        var isLeftFootAttached = false;
        var leftFootDataSeries = [];
        var nLeftFootSteps = 0;
        var nOfPointsAtLeftFootStep = 0;
        var isLeftCompleteStep = false;
        // Right foot variables
        var isRightFootAttached = false;
        var rightFootDataSeries = [];
        var nRightFootSteps = 0;
        var nOfPointsAtRightFootStep = 0;
        var isRightCompleteStep = false;
        for (var i = 0; i < records.length; i++) {
            // Setup for every row of data the required variables
            const fz1 = parseFloat(records[i]['Fz1']);
            const fz2 = parseFloat(records[i]['Fz2']);
            const threshold = constants_1.WEIGHT_THRESHOLD_PERCENT * weight;
            const leftFootValue = (records[i][leftCol] / weight) * 100;
            const rightFootValue = (records[i][rightCol] / weight) * 100;
            if (isLeftFootAttached) {
                if (fz1 > threshold) {
                    nOfPointsAtLeftFootStep += 1;
                    leftFootDataSeries[nLeftFootSteps].data.push(leftFootValue);
                }
                if (fz1 < threshold) {
                    isLeftFootAttached = false;
                    isLeftCompleteStep = true;
                    if (nOfPointsAtLeftFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        nLeftFootSteps += 1;
                    }
                    else {
                        leftFootDataSeries.pop();
                    }
                    nOfPointsAtLeftFootStep = 0;
                }
            }
            else {
                if (fz1 > threshold) {
                    isLeftFootAttached = true;
                    isLeftCompleteStep = false;
                    leftFootDataSeries.push({ data: [] });
                    leftFootDataSeries[nLeftFootSteps].data.push(leftFootValue);
                }
            }
            if (isRightFootAttached) {
                if (fz2 > threshold) {
                    nOfPointsAtRightFootStep += 1;
                    rightFootDataSeries[nRightFootSteps].data.push(rightFootValue);
                }
                if (fz2 < threshold) {
                    isRightFootAttached = false;
                    isRightCompleteStep = true;
                    if (nOfPointsAtRightFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        nRightFootSteps += 1;
                    }
                    else {
                        rightFootDataSeries.pop();
                    }
                    nOfPointsAtRightFootStep = 0;
                }
            }
            else {
                if (fz2 > threshold) {
                    isRightFootAttached = true;
                    isRightCompleteStep = false;
                    rightFootDataSeries.push({ data: [] });
                    rightFootDataSeries[nRightFootSteps].data.push(rightFootValue);
                }
            }
        }
        if (!isRightCompleteStep) {
            rightFootDataSeries.pop();
        }
        if (!isLeftCompleteStep) {
            leftFootDataSeries.pop();
        }
        return {
            left: selectedSteps ? leftFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)) : leftFootDataSeries,
            right: selectedSteps ? rightFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)) : rightFootDataSeries,
        };
    }
    static formCOPs(records, weight, frequency, selectedSteps) {
        // Left foot variables
        var isLeftFootAttached = false;
        var leftCOPDataSeries = [];
        var nLeftFootSteps = 0;
        var nOfPointsAtLeftFootStep = 0;
        var isLeftCompleteStep = false;
        // Right foot variables
        var isRightFootAttached = false;
        var rightCOPDataSeries = [];
        var nRightFootSteps = 0;
        var nOfPointsAtRightFootStep = 0;
        var isRightCompleteStep = false;
        for (var i = 0; i < records.length; i++) {
            // Setup for every row of data the required variables
            const fz1 = parseFloat(records[i]['Fz1']);
            const fz2 = parseFloat(records[i]['Fz2']);
            const threshold = constants_1.WEIGHT_THRESHOLD_PERCENT * weight;
            const copx1 = parseFloat(records[i]['Copx1']);
            const copy1 = parseFloat(records[i]['Copy1']);
            const copx2 = parseFloat(records[i]['Copx2']);
            const copy2 = parseFloat(records[i]['Copy2']);
            if (isLeftFootAttached) {
                if (fz1 > threshold) {
                    nOfPointsAtLeftFootStep += 1;
                    leftCOPDataSeries[nLeftFootSteps].data.push([copx1, copy1]);
                }
                if (fz1 < threshold) {
                    isLeftFootAttached = false;
                    isLeftCompleteStep = false;
                    if (nOfPointsAtLeftFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        nLeftFootSteps += 1;
                    }
                    else {
                        leftCOPDataSeries.pop();
                    }
                    nOfPointsAtLeftFootStep = 0;
                }
            }
            else {
                if (fz1 > threshold) {
                    isLeftFootAttached = true;
                    isLeftCompleteStep = false;
                    leftCOPDataSeries.push({ data: [] });
                    leftCOPDataSeries[nLeftFootSteps].data.push([copx1, copy1]);
                }
            }
            if (isRightFootAttached) {
                if (fz2 > threshold) {
                    nOfPointsAtRightFootStep += 1;
                    rightCOPDataSeries[nRightFootSteps].data.push([copx2, copy2]);
                }
                if (fz2 < threshold) {
                    isRightFootAttached = false;
                    isRightCompleteStep = true;
                    if (nOfPointsAtRightFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        nRightFootSteps += 1;
                    }
                    else {
                        rightCOPDataSeries.pop();
                    }
                    nOfPointsAtRightFootStep = 0;
                }
            }
            else {
                if (fz2 > threshold) {
                    isRightFootAttached = true;
                    isRightCompleteStep = false;
                    rightCOPDataSeries.push({ data: [] });
                    rightCOPDataSeries[nRightFootSteps].data.push([copx2, copy2]);
                }
            }
        }
        if (!isRightCompleteStep) {
            rightCOPDataSeries.pop();
        }
        if (!isLeftCompleteStep) {
            leftCOPDataSeries.pop();
        }
        return {
            left: selectedSteps ? leftCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)) : leftCOPDataSeries,
            right: selectedSteps ? rightCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)) : rightCOPDataSeries
        };
    }
    static formTimelines(records, weight, frequency, rangeMin, rangeMax, leftCol, rightCol, selectedSteps) {
        // Left foot variables
        var isLeftFootAttached = false;
        var leftFootStepsMax = [];
        var nOfPointsAtLeftFootStep = 0;
        var isLeftCompleteStep = false;
        var maxAtLeftFootStep = 0;
        // Right foot variables
        var isRightFootAttached = false;
        var rightFootStepsMax = [];
        var nOfPointsAtRightFootStep = 0;
        var maxAtRightFootStep = 0;
        var isRightCompleteStep = false;
        for (var i = 0; i < records.length; i++) {
            // Setup for every row of data the required variables
            const fz1 = parseFloat(records[i]['Fz1']);
            const fz2 = parseFloat(records[i]['Fz2']);
            const threshold = constants_1.WEIGHT_THRESHOLD_PERCENT * weight;
            const leftFootValue = (records[i][leftCol] / weight) * 100;
            const rightFootValue = (records[i][rightCol] / weight) * 100;
            if (isLeftFootAttached) {
                if (fz1 > threshold) {
                    nOfPointsAtLeftFootStep += 1;
                    if (maxAtLeftFootStep < leftFootValue) {
                        maxAtLeftFootStep = leftFootValue;
                        leftFootStepsMax.pop();
                        leftFootStepsMax.push(maxAtLeftFootStep);
                    }
                }
                if (fz1 < threshold) {
                    isLeftFootAttached = false;
                    isLeftCompleteStep = true;
                    if (nOfPointsAtLeftFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        leftFootStepsMax.push(maxAtLeftFootStep);
                        maxAtLeftFootStep = 0;
                    }
                    else {
                        maxAtLeftFootStep = 0;
                    }
                    nOfPointsAtLeftFootStep = 0;
                }
            }
            else {
                if (fz1 > threshold) {
                    isLeftFootAttached = true;
                    isLeftCompleteStep = false;
                }
            }
            if (isRightFootAttached) {
                if (fz2 > threshold) {
                    nOfPointsAtRightFootStep += 1;
                    if (maxAtRightFootStep < rightFootValue) {
                        maxAtRightFootStep = rightFootValue;
                        rightFootStepsMax.pop();
                        rightFootStepsMax.push(maxAtRightFootStep);
                    }
                }
                if (fz2 < threshold) {
                    isRightFootAttached = false;
                    isRightCompleteStep = true;
                    if (nOfPointsAtRightFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        rightFootStepsMax.push(maxAtRightFootStep);
                        maxAtRightFootStep = 0;
                    }
                    else {
                        maxAtRightFootStep = 0;
                    }
                    nOfPointsAtRightFootStep = 0;
                }
            }
            else {
                if (fz2 > threshold) {
                    isRightFootAttached = true;
                    isRightCompleteStep = false;
                }
            }
        }
        if (!isRightCompleteStep) {
            rightFootStepsMax.pop();
        }
        if (!isLeftCompleteStep) {
            leftFootStepsMax.pop();
        }
        return {
            left: selectedSteps ? leftFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)) : leftFootStepsMax,
            right: selectedSteps ? rightFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)) : rightFootStepsMax,
        };
    }
}
exports.DataProcessor = DataProcessor;
