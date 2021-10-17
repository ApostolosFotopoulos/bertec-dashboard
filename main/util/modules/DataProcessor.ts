import { Record, LineChartSeries,COPChartSeries, Trial, StanceDuration, StepDurationsPerFoot } from './Interfaces'
import { WEIGHT_THRESHOLD_PERCENT, FREQUENCY_THRESHOLD_PERCENT } from '../constants'

class DataProcessor {
  
  static formStepsForAverageMetrics(records: Array<Record>, weight: number, frequency: number) {
    let fx = this.formSteps(records, weight, frequency, "Fx1", "Fx2");
    let fy = this.formSteps(records, weight, frequency, "Fy1", "Fy2");
    let fz = this.formSteps(records, weight, frequency, "Fz1", "Fz2");

    return {
      fx,
      fy,
      fz
    }
  }

   static formStepsForMetrics(records: Array<Record>, weight: number, frequency: number, selectedSteps: Array<number>) {
    let fx = this.formSteps(records, weight, frequency, "Fx1", "Fx2", selectedSteps);
    let fy = this.formSteps(records, weight, frequency, "Fy1", "Fy2", selectedSteps);
    let fz = this.formSteps(records, weight, frequency, "Fz1", "Fz2", selectedSteps);

    return {
      fx,
      fy,
      fz
    }
   }
  
  static formStepsForAsymmetry(records: Array<Record>, weight: number,frequency:number, selectedSteps?: Array<number>): StepDurationsPerFoot{
    
    // Left foot variables
    var isLeftFootAttached: boolean = false;
    var isLeftCompleteStep: boolean = false;
    var nOfPointsAtLeftFootStep: number = 0;
    let leftFootStanceDuration: StanceDuration = {
      startTimestamp: "",
      endTimestamp: ""
    }
    let leftFootStanceDurations: Array<StanceDuration> = [];

    // Right foot variables
    var isRightFootAttached: boolean = false;
    var isRightCompleteStep: boolean = false;
    var nOfPointsAtRightFootStep: number = 0;
    let rightFootStanceDuration: StanceDuration = {
      startTimestamp: "",
      endTimestamp: ""
    }
    let rightFootStanceDurations: Array<StanceDuration> = [];

    for (var i = 0; i < records.length; i++ ) {
      
      // Setup for every row of data the required variables
      const fz1: number = parseFloat(records[i]['Fz1']);
      const fz2: number = parseFloat(records[i]['Fz2']);
      const threshold: number = WEIGHT_THRESHOLD_PERCENT * weight;

      if (isLeftFootAttached) {
         if (fz1 > threshold) {
          nOfPointsAtLeftFootStep += 1;
         }
        
        if (fz1 < threshold) {
          isLeftFootAttached = false;
          isLeftCompleteStep = true;

          if (nOfPointsAtLeftFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            leftFootStanceDuration.endTimestamp = records[i].Timestamp;
            leftFootStanceDurations = [...leftFootStanceDurations, leftFootStanceDuration];
          }

          nOfPointsAtLeftFootStep = 0;
        }
      } else {
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

          if (nOfPointsAtRightFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
             rightFootStanceDuration.endTimestamp = records[i].Timestamp;
            rightFootStanceDurations = [...rightFootStanceDurations, rightFootStanceDuration];
          }

          nOfPointsAtRightFootStep = 0;
        }
      } else {
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
      left: selectedSteps? leftFootStanceDurations.filter((_:any, idx:number) => selectedSteps.includes(idx)):leftFootStanceDurations,
      right: selectedSteps ? rightFootStanceDurations.filter((_: any, idx: number) => selectedSteps.includes(idx)) : rightFootStanceDurations,
      length: Math.min(...[
        selectedSteps ? leftFootStanceDurations.filter((_: any, idx: number) => selectedSteps.includes(idx)).length : leftFootStanceDurations.length,
        selectedSteps ? rightFootStanceDurations.filter((_: any, idx: number) => selectedSteps.includes(idx)).length : rightFootStanceDurations.length,
      ])
    }
  }

  
  static formSteps(records: Array<Record>, weight: number, frequency: number, leftCol: string, rightCol: string, selectedSteps?: Array<number>) {
    
    // Left foot variables
    var isLeftFootAttached: boolean = false;
    var leftFootDataSeries: Array<LineChartSeries> = [];
    var nLeftFootSteps: number = 0;
    var nOfPointsAtLeftFootStep: number = 0;
    var isLeftCompleteStep:boolean = false;

    // Right foot variables
    var isRightFootAttached: boolean = false;
    var rightFootDataSeries: Array<LineChartSeries> = [];
    var nRightFootSteps: number = 0;
    var nOfPointsAtRightFootStep: number = 0;
    var isRightCompleteStep:boolean = false;

    for (var i = 0; i < records.length; i++ ) {
      
      // Setup for every row of data the required variables
      const fz1: number = parseFloat(records[i]['Fz1']);
      const fz2: number = parseFloat(records[i]['Fz2']);
      const threshold: number = WEIGHT_THRESHOLD_PERCENT * weight;
      const leftFootValue: number = (records[i][leftCol] / weight) * 100;
      const rightFootValue: number = (records[i][rightCol] / weight) * 100;

      if (isLeftFootAttached) {
        if (fz1 > threshold) {
          nOfPointsAtLeftFootStep += 1;
          leftFootDataSeries[nLeftFootSteps].data.push(leftFootValue);
        }

        if (fz1 < threshold) {
          isLeftFootAttached = false;
          isLeftCompleteStep = true;

          if (nOfPointsAtLeftFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            nLeftFootSteps += 1;
          } else {
            leftFootDataSeries.pop();
          }

          nOfPointsAtLeftFootStep = 0;
        }
      } else {
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
          if (nOfPointsAtRightFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            nRightFootSteps += 1;
          } else {
            rightFootDataSeries.pop();
          }

          nOfPointsAtRightFootStep = 0;
        }
      } else {
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
      left: selectedSteps? leftFootDataSeries.filter((_:any, idx:number) => selectedSteps.includes(idx)):leftFootDataSeries,
      right: selectedSteps? rightFootDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)) : rightFootDataSeries,
      min: selectedSteps ? Math.min(...leftFootDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data).flat(), ...rightFootDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data).flat()) : Math.min(...leftFootDataSeries.map(r => r.data).flat(), ...rightFootDataSeries.map(r => r.data).flat()),
      max: selectedSteps ? Math.max(...leftFootDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data).flat(), ...rightFootDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data).flat()) : Math.max(...leftFootDataSeries.map(r => r.data).flat(), ...rightFootDataSeries.map(r => r.data).flat())
    }
  }

  static formCOPs(records: Array<Record>, selectedSteps: Array<number>, weight: number, frequency: number) {
    
    // Left foot variables
    var isLeftFootAttached: boolean = false;
    var leftCOPDataSeries: Array<COPChartSeries> = [];
    var nLeftFootSteps: number = 0;
    var nOfPointsAtLeftFootStep: number = 0;
    var isLeftCompleteStep:boolean = false;

    // Right foot variables
    var isRightFootAttached: boolean = false;
    var rightCOPDataSeries: Array<COPChartSeries> = [];
    var nRightFootSteps: number = 0;
    var nOfPointsAtRightFootStep: number = 0;
    var isRightCompleteStep:boolean = false;

    for (var i = 0; i < records.length; i++ ) {
      
      // Setup for every row of data the required variables
      const fz1: number = parseFloat(records[i]['Fz1']);
      const fz2: number = parseFloat(records[i]['Fz2']);
      const threshold: number = WEIGHT_THRESHOLD_PERCENT * weight;
      const copx1: number = parseFloat(records[i]['Copx1']);
      const copy1: number = parseFloat(records[i]['Copy1']);
      const copx2: number = parseFloat(records[i]['Copx2']);
      const copy2: number = parseFloat(records[i]['Copy2']);


      if (isLeftFootAttached) {
        if (fz1 > threshold) {
          nOfPointsAtLeftFootStep += 1;
          leftCOPDataSeries[nLeftFootSteps].data.push([copx1, copy1]);
        }

        if (fz1 < threshold) {
          isLeftFootAttached = false;
          isLeftCompleteStep = false;

          if (nOfPointsAtLeftFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            nLeftFootSteps += 1;
          } else {
            leftCOPDataSeries.pop();
          }

          nOfPointsAtLeftFootStep = 0;
        }
      } else {
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

          if (nOfPointsAtRightFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            nRightFootSteps += 1;
          } else {
            rightCOPDataSeries.pop();
          }
          nOfPointsAtRightFootStep = 0;
        }
      } else {
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
      left: selectedSteps?leftCOPDataSeries.filter((_:any, idx:number) => selectedSteps.includes(idx)):leftCOPDataSeries,
      right: selectedSteps ? rightCOPDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)) : rightCOPDataSeries,
      min: selectedSteps ? Math.min(...leftCOPDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat(), ...rightCOPDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat()) : Math.min(...leftCOPDataSeries.map(r => r.data.flat()).flat(), ...rightCOPDataSeries.map(r => r.data.flat()).flat()),
      max: selectedSteps ? Math.max(...leftCOPDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat(), ...rightCOPDataSeries.filter((_: any, idx: number) => selectedSteps.includes(idx)).map(r => r.data.flat()).flat()) : Math.max(...leftCOPDataSeries.map(r => r.data.flat()).flat(), ...rightCOPDataSeries.map(r => r.data.flat()).flat())
    }
  }

  static formTimelines(records: Array<Record>,selectedSteps: Array<number>, weight: number, frequency: number, rangeMin: number, rangeMax:number, leftCol: string, rightCol: string) {
    
    // Left foot variables
    var isLeftFootAttached: boolean = false;
    var leftFootStepsMax: Array<number> = [];
    var nOfPointsAtLeftFootStep: number = 0;
    var isLeftCompleteStep = false;
    var maxAtLeftFootStep = 0;

    // Right foot variables
    var isRightFootAttached: boolean = false;
    var rightFootStepsMax: Array<number> = [];
    var nOfPointsAtRightFootStep: number = 0;
    var maxAtRightFootStep = 0;
    var isRightCompleteStep = false;
    

    for (var i = 0; i < records.length; i++ ) {
      
      // Setup for every row of data the required variables
      const fz1: number = parseFloat(records[i]['Fz1']);
      const fz2: number = parseFloat(records[i]['Fz2']);
      const threshold: number = WEIGHT_THRESHOLD_PERCENT * weight;
      const leftFootValue: number = (records[i][leftCol] / weight) * 100;
      const rightFootValue: number = (records[i][rightCol] / weight) * 100;

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
          
          if (nOfPointsAtLeftFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            leftFootStepsMax.push(maxAtLeftFootStep);
            maxAtLeftFootStep = 0;
          } else {
            maxAtLeftFootStep = 0;
          }

          nOfPointsAtLeftFootStep = 0;
        }
      } else {
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

          if (nOfPointsAtRightFootStep > FREQUENCY_THRESHOLD_PERCENT * frequency) {
            rightFootStepsMax.push(maxAtRightFootStep);
            maxAtRightFootStep = 0;
          } else {
            maxAtRightFootStep = 0;
          }

          nOfPointsAtRightFootStep = 0;
        }
      } else {
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
      left: selectedSteps?leftFootStepsMax.filter((_:any, idx:number) => selectedSteps.includes(idx)):leftFootStepsMax,
      right: selectedSteps ? rightFootStepsMax.filter((_: any, idx: number) => selectedSteps.includes(idx)) : rightFootStepsMax,
      min: selectedSteps ? Math.min(...leftFootStepsMax.filter((_: any, idx: number) => selectedSteps.includes(idx)).flat(), ...rightFootStepsMax.filter((_: any, idx: number) => selectedSteps.includes(idx)).flat()) : Math.min(...leftFootStepsMax.flat(), ...rightFootStepsMax.flat()),
      max: selectedSteps ? Math.max(...leftFootStepsMax.filter((_: any, idx: number) => selectedSteps.includes(idx)).flat(), ...rightFootStepsMax.filter((_: any, idx: number) => selectedSteps.includes(idx)).flat()) : Math.max(...leftFootStepsMax.flat(), ...rightFootStepsMax.flat()),
      inRangeleft: rangeMin && rangeMax?leftFootStepsMax.filter(l => rangeMin <= l && rangeMax <= l).length / leftFootStepsMax.length : -1,
      inRangeRight: rangeMin && rangeMax? rightFootStepsMax.filter(r => rangeMin <= r && rangeMax <= r).length / rightFootStepsMax.length : -1,
    }
  }

  static formStepsForEveryAxes(records: Array<Record>,selectedSteps: Array<number>, weight: number, frequency: number) {
    return {
      fx: DataProcessor.formSteps(records, weight, frequency, "Fx1", "Fx2", selectedSteps),
      fy: DataProcessor.formSteps(records, weight, frequency, "Fy1", "Fy2", selectedSteps),
      fz: DataProcessor.formSteps(records, weight, frequency, "Fz1", "Fz2", selectedSteps),
    }
  }

  static formTimelinesForEveryAxes(records: Array<Record>, selectedSteps: Array<number>, weight: number, frequency: number, trial: Trial) {
    return {
      fx: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fx_zone_min, trial.fx_zone_max, "Fx1", "Fx2"),
      fy: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fy_zone_min, trial.fy_zone_max, "Fy1", "Fy2"),
      fz: DataProcessor.formTimelines(records, selectedSteps, weight, frequency, trial.fz_zone_min, trial.fz_zone_max, "Fz1", "Fz2"),
    }
  }
}

export { DataProcessor };