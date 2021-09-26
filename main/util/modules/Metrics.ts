import { LineChartSeries, StepsDataForAverageMetrics, AverageMetrics } from "./Interfaces";
import { Calculus } from './Calculus';

class Metrics {
  static generate(steps: StepsDataForAverageMetrics, frequency: number):void {
    console.log(steps)
  }
  
  static generateAverage(steps: StepsDataForAverageMetrics, frequency: number) {
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

    return {
      ...averageMetrics,
      length: Math.max(...[
        steps.fz.left.length,
        steps.fz.right.length,
      ])
    }
  }

  static calculateMetricsPerFoot(rows: Array<LineChartSeries>, frequency: number ): AverageMetrics {
    let impulses: Array<number> = [];
    let impactPeakForces: Array<number> = [];
    let loadingRates: Array<number> = [];
    let timeToImpactPeaks: Array<number> = [];
    let activePeakForces: Array<number> = [];
    let timeToActivePeaks: Array<number> = [];
    let pushOffRates: Array<number> = [];

    for (var i = 0; i < rows.length; i++){
      
      // Calculate the vertical impulse of every step
      let x: Array<number> = rows[i].data.map((_, idx) => idx / frequency);
      let y: Array<number> = rows[i].data
      impulses.push(this.calculateImpulse(x, y))
      
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
    }
  }

  static calculateImpulse(x: Array<number>, y: Array<number>): number {
    return Calculus.integral(x, y);
  }

  static calculateLoadingRate(y: Array<number>, frequency: number): number {
    let mx = Calculus.findFirstlocalMax(y);
    
    if (mx !== 0) {
      const mxId = y.indexOf(mx)
      const from = (20 * mxId) / mx
      const to = (80 * mxId) / mx
      return Calculus.slope(from/ frequency, 20, to/frequency, 80)
    }

    return 0;
  }
  
  static calculateImpactPeakForce(y: Array<number>): number {
    return Calculus.findFirstlocalMax(y);
  }

  static calculateTimeToImpactPeak(y: Array<number>, frequency: number): number {
    return Calculus.findIndexOfFirstlocalMax(y) / frequency;
  }

  static calculateActivePeakForce(y: Array<number>): number {
    return Calculus.findMaxFromLocalMaxs(y);
  }

  static calculateTimeToActivePeak(y: Array<number>, frequency: number): number {
    return Calculus.findIndexOfMaxFromLocalMaxs(y) / frequency;
  }

  static calculatePushOffRate(y: Array<number>, frequency: number): number {

    let mx = Calculus.findIndexOfMaxFromLocalMaxs(y);
    
    if (mx !== 0) {
      const mxId = y.indexOf(mx)
      const from = (80 * mxId) / mx
      const to = (20 * mxId) / mx
      return Calculus.slope(from/frequency, 80, to/frequency, 20)
    }

    return 0;
  }
}

export { Metrics }