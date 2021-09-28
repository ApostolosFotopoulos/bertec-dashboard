import { LineChartSeries, StepsDataForAverageMetrics, AverageMetrics, StepsDataForMetrics, NormalMetrics, StepDurationsPerFoot } from "./Interfaces";
import { Calculus } from './Calculus';

class Metrics {

  static removeNoizyData(arr: Array<number>, rate: number): Array<number> {
    const average = arr.reduce((a, b) => a + b, 0) / arr.length || 0;
    const limit = average + rate * average;
    for (var i = 0; i < arr.length; i++){
      if (arr[i] > limit || arr[i] < limit) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  static generateAsymmetries(sd: StepDurationsPerFoot) {
    
    let stance = 0;
    let step = 0;

    console.log(sd.right);
    console.log(sd.left);
    
    for (var i = 0; i < sd.length; i++){
      if (
        sd.right[i].startTimestamp != sd.right[i].endTimestamp &&
        sd.left[i].startTimestamp != sd.left[i].endTimestamp
      ) {
        if ( (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp) ) > ( Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp)) ) {
          stance += (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp))/(Number(sd.right[i].endTimestamp)- Number(sd.right[i].startTimestamp))
          step += (Number(sd.left[i].endTimestamp) - Number(sd.left[i].startTimestamp) + Math.abs(Number(sd.right[i].endTimestamp) - Number(sd.left[i].startTimestamp)))/(Number(sd.right[i].endTimestamp)- Number(sd.right[i].startTimestamp) + Math.abs(Number(sd.left[i].endTimestamp) - Number(sd.right[i].startTimestamp)))

        } else {
          stance += (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp))/(Number(sd.left[i].endTimestamp)- Number(sd.left[i].startTimestamp))
          step += (Number(sd.right[i].endTimestamp) - Number(sd.right[i].startTimestamp) + Math.abs(Number(sd.left[i].endTimestamp) - Number(sd.right[i].startTimestamp)))/(Number(sd.left[i].endTimestamp)- Number(sd.left[i].startTimestamp) + Math.abs(Number(sd.right[i].endTimestamp) - Number(sd.left[i].startTimestamp)))
        }
      }
    }

    return {
      stance,
      step
    }
  }

  static generate(steps: StepsDataForMetrics, frequency: number) {
    
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
    }
  }
  
  static generateAverage(steps: StepsDataForAverageMetrics, frequency: number) {
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
    }
  }

  static calculateAverageMetricsPerFoot(rows: Array<LineChartSeries>, frequency: number ): AverageMetrics {
    let impulses: Array<number> = [];
    let impactPeakForces: Array<number> = [];
    let loadingRates: Array<number> = [];
    let timeToImpactPeaks: Array<number> = [];
    let activePeakForces: Array<number> = [];
    let timeToActivePeaks: Array<number> = [];
    let pushOffRates: Array<number> = [];

    for (var i = 0; i < rows.length; i++){

      let x: Array<number> = rows[i].data.map((_, idx) => idx / frequency);
      let y: Array<number> = this.removeNoizyData(rows[i].data, 0.1);

      // Calculate the vertical impulse of every step
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
      pushOffRates,
    }
  }

  static calculateMetricsPerFoot(rows: Array<LineChartSeries>, frequency: number ): NormalMetrics {
    var impulses: Array<number> = [];
    var impactPeakForces: Array<number> = [];
    var loadingRates: Array<number> = [];
    var timeToImpactPeaks: Array<number> = [];
    var activePeakForces: Array<number> = [];
    var timeToActivePeaks: Array<number> = [];
    var pushOffRates: Array<number> = [];

    for (var i = 0; i < rows.length; i++){

      let x: Array<number> = rows[i].data.map((_, idx) => idx / frequency);
      let y: Array<number> = this.removeNoizyData(rows[i].data, 0.1);

      // Calculate the vertical impulse of every step
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

    console.log(loadingRates)
    return {
      impulse: (impulses.reduce((a,c) => a + c)/impulses.map(i => i!=0).length),
      impactPeakForce: (impactPeakForces.reduce((a,c) => a + c)/impactPeakForces.map(i => i!=0).length),
      loadingRate: (loadingRates.reduce((a,c) => a + c)/loadingRates.map(i => i!=0).length),
      timeToImpactPeak: (timeToImpactPeaks.reduce((a,c) => a + c)/timeToImpactPeaks.map(i => i!=0).length),
      activePeakForce: (activePeakForces.reduce((a,c) => a + c)/activePeakForces.map(i => i!=0).length),
      timeToActivePeak: (timeToActivePeaks.reduce((a,c) => a + c)/timeToActivePeaks.map(i => i!=0).length),
      pushOffRate: (pushOffRates.reduce((a,c) => a + c)/pushOffRates.map(i => i!=0).length),
    }
  }

  static calculateImpulse(x: Array<number>, y: Array<number>): number {
    return Calculus.integral(x, y);
  }

  static calculateLoadingRate(y: Array<number>, frequency: number): number {
    let mx = Calculus.findFirstlocalMax(y);
    const closest = (array: Array<number>, goal: number) => array.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    
    if (mx !== 0) {
      const from = (0.2 * mx);
      const fromId = y.indexOf(closest(y, from)) / frequency;
      const to = (0.8 * mx);
      const toId = y.indexOf(closest(y, to)) / frequency;
      return Calculus.slope(fromId, from, toId, to);
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
    const closest = (array: Array<number>, goal: number) => array.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    
    if (mx !== 0) {
       const from = (0.2 * mx);
      const fromId = y.indexOf(closest(y, from)) / frequency;
      const to = (0.8 * mx);
      const toId = y.indexOf(closest(y, to)) / frequency;
      return Calculus.slope(fromId, from, toId, to);
    }

    return 0;
  }
}

export { Metrics }