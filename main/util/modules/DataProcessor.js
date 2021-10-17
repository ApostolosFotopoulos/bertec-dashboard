"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
const constants_1 = require("../constants");
class DataProcessor {
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
    static formStepsForMetrics(records, weight, frequency, selectedSteps) {
        let fx = this.formSteps(records, weight, frequency, "Fx1", "Fx2", selectedSteps);
        let fy = this.formSteps(records, weight, frequency, "Fy1", "Fy2", selectedSteps);
        let fz = this.formSteps(records, weight, frequency, "Fz1", "Fz2", selectedSteps);
        return {
            fx,
            fy,
            fz
        };
    }
    static formStepsForAsymmetry(records, weight, frequency, selectedSteps) {
        // Left foot variables
        var isLeftFootAttached = false;
        var isLeftCompleteStep = false;
        var nOfPointsAtLeftFootStep = 0;
        let leftFootStanceDuration = {
            startTimestamp: "",
            endTimestamp: ""
        };
        let leftFootStanceDurations = [];
        // Right foot variables
        var isRightFootAttached = false;
        var isRightCompleteStep = false;
        var nOfPointsAtRightFootStep = 0;
        let rightFootStanceDuration = {
            startTimestamp: "",
            endTimestamp: ""
        };
        let rightFootStanceDurations = [];
        for (var i = 0; i < records.length; i++) {
            // Setup for every row of data the required variables
            const fz1 = parseFloat(records[i]['Fz1']);
            const fz2 = parseFloat(records[i]['Fz2']);
            const threshold = constants_1.WEIGHT_THRESHOLD_PERCENT * weight;
            if (isLeftFootAttached) {
                if (fz1 > threshold) {
                    nOfPointsAtLeftFootStep += 1;
                }
                if (fz1 < threshold) {
                    isLeftFootAttached = false;
                    isLeftCompleteStep = true;
                    if (nOfPointsAtLeftFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        leftFootStanceDuration.endTimestamp = records[i].Timestamp;
                        leftFootStanceDurations = [...leftFootStanceDurations, leftFootStanceDuration];
                    }
                    nOfPointsAtLeftFootStep = 0;
                }
            }
            else {
                if (fz1 > threshold) {
                    isLeftFootAttached = true;
                    isLeftCompleteStep = false;
                    leftFootStanceDuration = Object.assign({}, {
                        startTimestamp: "",
                        endTimestamp: ""
                    });
                    leftFootStanceDuration.startTimestamp = records[i].Timestamp;
                }
            }
            if (isRightFootAttached) {
                if (fz2 > threshold) {
                    nOfPointsAtRightFootStep += 1;
                }
                if (fz2 < threshold) {
                    isRightFootAttached = false;
                    isRightCompleteStep = true;
                    if (nOfPointsAtRightFootStep > constants_1.FREQUENCY_THRESHOLD_PERCENT * frequency) {
                        rightFootStanceDuration.endTimestamp = records[i].Timestamp;
                        rightFootStanceDurations = [...rightFootStanceDurations, rightFootStanceDuration];
                    }
                    nOfPointsAtRightFootStep = 0;
                }
            }
            else {
                if (fz2 > threshold) {
                    isRightFootAttached = true;
                    isRightCompleteStep = false;
                    rightFootStanceDuration = Object.assign({}, {
                        startTimestamp: "",
                        endTimestamp: ""
                    });
                    rightFootStanceDuration.startTimestamp = records[i].Timestamp;
                }
            }
        }
        if (!isRightCompleteStep) {
            rightFootStanceDurations.pop();
        }
        if (!isLeftCompleteStep) {
            leftFootStanceDurations.pop();
        }
        return {
            left: selectedSteps ? leftFootStanceDurations.filter((_, idx) => selectedSteps.includes(idx)) : leftFootStanceDurations,
            right: selectedSteps ? rightFootStanceDurations.filter((_, idx) => selectedSteps.includes(idx)) : rightFootStanceDurations,
            length: Math.min(...[
                selectedSteps ? leftFootStanceDurations.filter((_, idx) => selectedSteps.includes(idx)).length : leftFootStanceDurations.length,
                selectedSteps ? rightFootStanceDurations.filter((_, idx) => selectedSteps.includes(idx)).length : rightFootStanceDurations.length,
            ])
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
            min: selectedSteps ? Math.min(...leftFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data).flat(), ...rightFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data).flat()) : Math.min(...leftFootDataSeries.map(r => r.data).flat(), ...rightFootDataSeries.map(r => r.data).flat()),
            max: selectedSteps ? Math.max(...leftFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data).flat(), ...rightFootDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data).flat()) : Math.max(...leftFootDataSeries.map(r => r.data).flat(), ...rightFootDataSeries.map(r => r.data).flat())
        };
    }
    static formCOPs(records, selectedSteps, weight, frequency) {
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
            right: selectedSteps ? rightCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)) : rightCOPDataSeries,
            min: selectedSteps ? Math.min(...leftCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat(), ...rightCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat()) : Math.min(...leftCOPDataSeries.map(r => r.data.flat()).flat(), ...rightCOPDataSeries.map(r => r.data.flat()).flat()),
            max: selectedSteps ? Math.max(...leftCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat(), ...rightCOPDataSeries.filter((_, idx) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat()) : Math.max(...leftCOPDataSeries.map(r => r.data.flat()).flat(), ...rightCOPDataSeries.map(r => r.data.flat()).flat())
        };
    }
    static formTimelines(records, selectedSteps, weight, frequency, rangeMin, rangeMax, leftCol, rightCol) {
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
            min: selectedSteps ? Math.min(...leftFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)).flat(), ...rightFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)).flat()) : Math.min(...leftFootStepsMax.flat(), ...rightFootStepsMax.flat()),
            max: selectedSteps ? Math.max(...leftFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)).flat(), ...rightFootStepsMax.filter((_, idx) => selectedSteps.includes(idx)).flat()) : Math.max(...leftFootStepsMax.flat(), ...rightFootStepsMax.flat()),
            inRangeleft: rangeMin && rangeMax ? leftFootStepsMax.filter(l => rangeMin <= l && rangeMax <= l).length / leftFootStepsMax.length : -1,
            inRangeRight: rangeMin && rangeMax ? rightFootStepsMax.filter(r => rangeMin <= r && rangeMax <= r).length / rightFootStepsMax.length : -1,
        };
    }
    static formStepsForEveryAxes(records, selectedSteps, weight, frequency) {
        return {
            fx: DataProcessor.formSteps(records, weight, frequency, "Fx1", "Fx2", selectedSteps),
            fy: DataProcessor.formSteps(records, weight, frequency, "Fy1", "Fy2", selectedSteps),
            fz: DataProcessor.formSteps(records, weight, frequency, "Fz1", "Fz2", selectedSteps),
        };
    }
    static formTimelinesForEveryAxes(records, selectedSteps, weight, frequency, trial) {
        return {
            fx: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fx_zone_min, trial.fx_zone_max, "Fx1", "Fx2"),
            fy: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fy_zone_min, trial.fy_zone_max, "Fy1", "Fy2"),
            fz: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fz_zone_min, trial.fz_zone_max, "Fz1", "Fz2"),
        };
    }
}
exports.DataProcessor = DataProcessor;
