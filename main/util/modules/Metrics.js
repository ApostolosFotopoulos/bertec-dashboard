"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
const Calculus_1 = require("./Calculus");
class Metrics {
    static removeNoizyData(arr, rate) {
        const average = arr.reduce((a, b) => a + b, 0) / arr.length || 0;
        const limit = average + rate * average;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] > limit || arr[i] < limit) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }
    static generateAsymmetries(sd) {
        let stance = 0;
        let step = 0;
        console.log(sd.right);
        console.log(sd.left);
        for (var i = 0; i < sd.length; i++) {
            if (sd.right[i].startTimestamp != sd.right[i].endTimestamp &&
                sd.left[i].startTimestamp != sd.left[i].endTimestamp) {
                if ((Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp)) > (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp))) {
                    stance += (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp)) / (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp));
                    step += (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp) + Math.abs(Number(sd.right[i].endTimestamp) - Number(sd.left[i].startTimestamp))) / (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp) + Math.abs(Number(sd.left[i].endTimestamp) - Number(sd.right[i].startTimestamp)));
                }
                else {
                    stance += (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp)) / (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp));
                    step += (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp) + Math.abs(Number(sd.left[i].endTimestamp) - Number(sd.right[i].startTimestamp))) / (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp) + Math.abs(Number(sd.right[i].endTimestamp) - Number(sd.left[i].startTimestamp)));
                }
            }
        }
        return {
            stance,
            step
        };
    }
    static generate(steps, frequency) {
        const metrics = {
            left: {
                fx: this.calculateMetricsPerFoot(steps.fx.left, frequency),
                fy: this.calculateMetricsPerFoot(steps.fy.left, frequency),
                fz: this.calculateMetricsPerFoot(steps.fz.left, frequency),
            },
            right: {
                fx: this.calculateMetricsPerFoot(steps.fx.right, frequency),
                fy: this.calculateMetricsPerFoot(steps.fy.right, frequency),
                fz: this.calculateMetricsPerFoot(steps.fz.right, frequency),
            }
        };
        return {
            ...metrics,
            length: Math.max(...[
                steps.fz.left.length,
                steps.fz.right.length,
            ])
        };
    }
    static generateAverage(steps, frequency) {
        const averageMetrics = {
            left: {
                fx: this.calculateAverageMetricsPerFoot(steps.fx.left, frequency),
                fy: this.calculateAverageMetricsPerFoot(steps.fy.left, frequency),
                fz: this.calculateAverageMetricsPerFoot(steps.fz.left, frequency),
            },
            right: {
                fx: this.calculateAverageMetricsPerFoot(steps.fx.right, frequency),
                fy: this.calculateAverageMetricsPerFoot(steps.fy.right, frequency),
                fz: this.calculateAverageMetricsPerFoot(steps.fz.right, frequency),
            }
        };
        return {
            ...averageMetrics,
            length: Math.max(...[
                steps.fz.left.length,
                steps.fz.right.length,
            ])
        };
    }
    static calculateAverageMetricsPerFoot(rows, frequency) {
        let impulses = [];
        let impactPeakForces = [];
        let loadingRates = [];
        let timeToImpactPeaks = [];
        let activePeakForces = [];
        let timeToActivePeaks = [];
        let pushOffRates = [];
        for (var i = 0; i < rows.length; i++) {
            let x = rows[i].data.map((_, idx) => idx / frequency);
            let y = this.removeNoizyData(rows[i].data, 0.1);
            // Calculate the vertical impulse of every step
            impulses.push(this.calculateImpulse(x, y));
            // Calculate the loading rate of every step
            loadingRates.push(this.calculateLoadingRate(y, frequency));
            // Calculate the impact peak force rate of every step
            impactPeakForces.push(this.calculateImpactPeakForce(y));
            // Calculate the time to impact peak of every step
            timeToImpactPeaks.push(this.calculateTimeToImpactPeak(y, frequency));
            // Calculate the active peak force of every step
            activePeakForces.push(this.calculateActivePeakForce(y));
            // Calculate the time of active peak force of every step
            timeToActivePeaks.push(this.calculateTimeToActivePeak(y, frequency));
            // Calculate the push off rate of every step
            pushOffRates.push(this.calculatePushOffRate(y, frequency));
        }
        return {
            impulses,
            impactPeakForces,
            loadingRates,
            timeToImpactPeaks,
            activePeakForces,
            timeToActivePeaks,
            pushOffRates,
        };
    }
    static calculateMetricsPerFoot(rows, frequency) {
        var impulses = [];
        var impactPeakForces = [];
        var loadingRates = [];
        var timeToImpactPeaks = [];
        var activePeakForces = [];
        var timeToActivePeaks = [];
        var pushOffRates = [];
        for (var i = 0; i < rows.length; i++) {
            let x = rows[i].data.map((_, idx) => idx / frequency);
            let y = this.removeNoizyData(rows[i].data, 0.1);
            // Calculate the vertical impulse of every step
            impulses.push(this.calculateImpulse(x, y));
            // Calculate the loading rate of every step
            loadingRates.push(this.calculateLoadingRate(y, frequency));
            // Calculate the impact peak force rate of every step
            impactPeakForces.push(this.calculateImpactPeakForce(y));
            // Calculate the time to impact peak of every step
            timeToImpactPeaks.push(this.calculateTimeToImpactPeak(y, frequency));
            // Calculate the active peak force of every step
            activePeakForces.push(this.calculateActivePeakForce(y));
            // Calculate the time of active peak force of every step
            timeToActivePeaks.push(this.calculateTimeToActivePeak(y, frequency));
            // Calculate the push off rate of every step
            pushOffRates.push(this.calculatePushOffRate(y, frequency));
        }
        console.log(loadingRates);
        return {
            impulse: (impulses.reduce((a, c) => a + c) / impulses.map(i => i != 0).length),
            impactPeakForce: (impactPeakForces.reduce((a, c) => a + c) / impactPeakForces.map(i => i != 0).length),
            loadingRate: (loadingRates.reduce((a, c) => a + c) / loadingRates.map(i => i != 0).length),
            timeToImpactPeak: (timeToImpactPeaks.reduce((a, c) => a + c) / timeToImpactPeaks.map(i => i != 0).length),
            activePeakForce: (activePeakForces.reduce((a, c) => a + c) / activePeakForces.map(i => i != 0).length),
            timeToActivePeak: (timeToActivePeaks.reduce((a, c) => a + c) / timeToActivePeaks.map(i => i != 0).length),
            pushOffRate: (pushOffRates.reduce((a, c) => a + c) / pushOffRates.map(i => i != 0).length),
        };
    }
    static calculateImpulse(x, y) {
        return Calculus_1.Calculus.integral(x, y);
    }
    static calculateLoadingRate(y, frequency) {
        let mx = Calculus_1.Calculus.findFirstlocalMax(y);
        const closest = (array, goal) => array.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        if (mx !== 0) {
            const from = (0.2 * mx);
            const fromId = y.indexOf(closest(y, from)) / frequency;
            const to = (0.8 * mx);
            const toId = y.indexOf(closest(y, to)) / frequency;
            return Calculus_1.Calculus.slope(fromId, from, toId, to);
        }
        return 0;
    }
    static calculateImpactPeakForce(y) {
        return Calculus_1.Calculus.findFirstlocalMax(y);
    }
    static calculateTimeToImpactPeak(y, frequency) {
        return Calculus_1.Calculus.findIndexOfFirstlocalMax(y) / frequency;
    }
    static calculateActivePeakForce(y) {
        return Calculus_1.Calculus.findMaxFromLocalMaxs(y);
    }
    static calculateTimeToActivePeak(y, frequency) {
        return Calculus_1.Calculus.findIndexOfMaxFromLocalMaxs(y) / frequency;
    }
    static calculatePushOffRate(y, frequency) {
        let mx = Calculus_1.Calculus.findIndexOfMaxFromLocalMaxs(y);
        const closest = (array, goal) => array.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        if (mx !== 0) {
            const from = (0.2 * mx);
            const fromId = y.indexOf(closest(y, from)) / frequency;
            const to = (0.8 * mx);
            const toId = y.indexOf(closest(y, to)) / frequency;
            return Calculus_1.Calculus.slope(fromId, from, toId, to);
        }
        return 0;
    }
}
exports.Metrics = Metrics;
