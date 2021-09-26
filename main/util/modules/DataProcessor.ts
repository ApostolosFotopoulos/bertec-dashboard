import { Record, LineChartSeries,COPChartSeries } from './Interfaces'
import { WEIGHT_THRESHOLD_PERCENT, FREQUENCY_THRESHOLD_PERCENT } from '../constants'

class DataProcessor {
  static formData(): void{

  }

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
      left: selectedSteps?leftFootDataSeries.filter((_:any, idx:number) => selectedSteps.includes(idx)):leftFootDataSeries,
      right: selectedSteps?rightFootDataSeries.filter((_:any, idx:number) => selectedSteps.includes(idx)):rightFootDataSeries,
    }
  }

  static formCOPs(records: Array<Record>, weight: number, frequency: number, selectedSteps: Array<number>) {
    
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
      right:  selectedSteps?rightCOPDataSeries.filter((_:any, idx:number) => selectedSteps.includes(idx)):rightCOPDataSeries
    }
  }

  static formTimelines(records: Array<Record>, weight: number, frequency: number, rangeMin: number, rangeMax:number, leftCol: string, rightCol: string, selectedSteps: Array<number>) {
    
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
      right: selectedSteps?rightFootStepsMax.filter((_:any, idx:number) => selectedSteps.includes(idx)):rightFootStepsMax,
    }
  }
}

export { DataProcessor };