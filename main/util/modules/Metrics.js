"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
const Calculus_1 = require("./Calculus");
class Metrics {
    static generate(steps, frequency) {
        console.log(steps);
    }
    static generateAverage(steps, frequency) {
        const averageMetrics = {
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
        return Object.assign(Object.assign({}, averageMetrics), { length: Math.max(...[
                steps.fz.left.length,
                steps.fz.right.length,
            ]) });
    }
    static calculateMetricsPerFoot(rows, frequency) {
        let impulses = [];
        let impactPeakForces = [];
        let loadingRates = [];
        let timeToImpactPeaks = [];
        let activePeakForces = [];
        let timeToActivePeaks = [];
        let pushOffRates = [];
        for (var i = 0; i < rows.length; i++) {
            // Calculate the vertical impulse of every step
            let x = rows[i].data.map((_, idx) => idx / frequency);
            let y = rows[i].data;
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
            pushOffRates
        };
    }
    static calculateImpulse(x, y) {
        return Calculus_1.Calculus.integral(x, y);
    }
    static calculateLoadingRate(y, frequency) {
        let mx = Calculus_1.Calculus.findFirstlocalMax(y);
        if (mx !== 0) {
            const mxId = y.indexOf(mx);
            const from = (20 * mxId) / mx;
            const to = (80 * mxId) / mx;
            return Calculus_1.Calculus.slope(from / frequency, 20, to / frequency, 80);
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
        if (mx !== 0) {
            const mxId = y.indexOf(mx);
            const from = (80 * mxId) / mx;
            const to = (20 * mxId) / mx;
            return Calculus_1.Calculus.slope(from / frequency, 80, to / frequency, 20);
        }
        return 0;
    }
}
exports.Metrics = Metrics;
