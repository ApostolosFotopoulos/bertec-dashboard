const { WEIGHT_THRESHOLD_PERCENT, FREQUENCY_THRESHOLD_PERCENT, FREQUENCY, STEP, RAW_STEP } = require('../constants');

class Processor {
  static formLineChartData(records, weight, frequency, step, leftColumnName, rightColumnName, validSteps) {
    // Right plate variables
    var rightPlateRows = 0
    var rightSteps = 0
    var isRightPlateLocked = false;
    var rightPlateSeries = [{ data: [] }]
    var rightPlateFinalSeries = [{ data: [] }]
    
    // Left plate variables
    var leftPlateRows = 0
    var leftSteps = 0
    var isLeftPlateLocked = false;
    var leftPlateSeries = [{ data: [] }]
    var leftPlateFinalSeries = [{ data: [] }]

    var maxY = -1;
    var minY = 0;

    for (var i = 0; i < records.length; i+=step) {
      var fz1 = Number(records[i]['Fz1']);
      var fz2 = Number(records[i]['Fz2']);
      var entryLeft = (Number(records[i][leftColumnName]) / Number(weight)) * 100;
      var entryRight = (Number(records[i][rightColumnName]) / Number(weight)) * 100;
      var threshold = Number(WEIGHT_THRESHOLD_PERCENT * weight);
      
      if (isRightPlateLocked) {
        if (fz2 > threshold) {
          rightSteps += 1;
          rightPlateSeries[rightPlateRows].data.push(entryRight);
          if (maxY < entryRight) {
            maxY = entryRight;
          }
          if (entryRight < minY) {
            minY = entryRight;
          }
        }
        
        if (fz2 < threshold) {
          isRightPlateLocked = false;
          if (rightSteps > FREQUENCY_THRESHOLD_PERCENT * frequency) {

            let s = rightPlateFinalSeries;
            rightPlateFinalSeries = s;
            s.push({
              data: []
            });
            rightPlateSeries = s;
            rightPlateRows += 1;
          } else {
            rightPlateSeries[rightPlateRows].data = [];
          }
          rightSteps = 0;
        }
      } else {
        if (fz2 > threshold) {
          isRightPlateLocked = true;
          rightPlateSeries[rightPlateRows].data.push(entryRight);
          if (maxY < entryRight) {
            maxY = entryRight;
          }
          if (entryRight < minY) {
            minY = entryRight;
          }
        }
      }

      if (isLeftPlateLocked) {
        if (fz1 > threshold) {
          leftSteps += 1;
          leftPlateSeries[leftPlateRows].data.push(entryLeft);
          if (maxY < entryLeft) {
            maxY = entryLeft;
          }
          if (entryLeft < minY) {
            minY = entryLeft;
          }
        }
          
        if (fz1 < threshold) {
          isLeftPlateLocked = false;
          if (leftSteps > FREQUENCY_THRESHOLD_PERCENT * frequency) {

            let s = leftPlateFinalSeries;
            leftPlateFinalSeries = s;
            s.push({
              data: []
            });
            leftPlateSeries = s;
            leftPlateRows += 1;
          } else {
            leftPlateSeries[leftPlateRows].data = [];
          }
          leftSteps = 0;
        }
      } else {
        if (fz1 > threshold) {
          isLeftPlateLocked = true;
          leftPlateSeries[leftPlateRows].data.push(entryLeft);
          if (maxY < entryLeft) {
            maxY = entryLeft;
          }
          if (entryLeft < minY) {
            minY = entryLeft;
          }
        }
      }
    }

    // Remove the first element of the array
    leftPlateFinalSeries.shift();
    rightPlateFinalSeries.shift();

    return {
      left: leftPlateFinalSeries.filter((_,idx) => validSteps.includes(`${idx+1}`)),
      right: rightPlateFinalSeries.filter((_,idx) => validSteps.includes(`${idx+1}`)),
      maxY,
      minY,
    };
  }

  static lineChartAxes(records, weight, validSteps) {

    let fx = this.formLineChartData(records, weight, FREQUENCY, STEP, 'Fx1', 'Fx2',validSteps);
    let fy = this.formLineChartData(records, weight, FREQUENCY, STEP, 'Fy1', 'Fy2',validSteps);
    let fz = this.formLineChartData(records, weight, FREQUENCY, STEP, 'Fz1', 'Fz2',validSteps);  

    let fxRaw = this.formLineChartData(records, weight, FREQUENCY, RAW_STEP, 'Fx1', 'Fx2',validSteps);
    let fyRaw = this.formLineChartData(records, weight, FREQUENCY, RAW_STEP, 'Fy1', 'Fy2',validSteps);
    let fzRaw = this.formLineChartData(records, weight, FREQUENCY, RAW_STEP, 'Fz1', 'Fz2',validSteps);

    return {
      fx,
      fxRaw,
      fy,
      fyRaw,
      fz,
      fzRaw
    }
  }

  static formCOPChartData(records, weight, frequency, step,validSteps) {

    // Right plate variables
    var rightPlateRows = 0
    var rightSteps = 0
    var isRightPlateLocked = false;
    var rightPlateSeries = [{ data: [] }]
    var rightPlateFinalSeries = [{ data: [] }]
    
    // Left plate variables
    var leftPlateRows = 0
    var leftSteps = 0
    var isLeftPlateLocked = false;
    var leftPlateSeries = [{ data: [] }]
    var leftPlateFinalSeries = [{ data: [] }]

    for (var i = 0; i < records.length; i+=step) {
      var fz1 = Number(records[i]['Fz1']);
      var fz2 = Number(records[i]['Fz2']);
      let copx1 = records[i]['Copx1'];
      let copy1 = records[i]['Copy1'];
      let copx2 = records[i]['Copx2'];
      let copy2 = records[i]['Copy2'];
      var threshold = Number(WEIGHT_THRESHOLD_PERCENT * weight);
      
      if (isRightPlateLocked) {
        if (fz2 > threshold) {
          rightSteps += 1;
          rightPlateSeries[rightPlateRows].data.push([copx2, copy2]);
        }
        
        if (fz2 < threshold) {
          isRightPlateLocked = false;
          if (rightSteps > FREQUENCY_THRESHOLD_PERCENT * frequency) {

            let s = rightPlateFinalSeries;
            rightPlateFinalSeries = s;
            s.push({
              data: []
            });
            rightPlateSeries = s;
            rightPlateRows += 1;
          } else {
            rightPlateSeries[rightPlateRows].data = [];
          }
          rightSteps = 0;
        }
      } else {
        if (fz2 > threshold) {
          isRightPlateLocked = true;
          rightPlateSeries[rightPlateRows].data.push([copx2, copy2]);
        }
      }

      if (isLeftPlateLocked) {
        if (fz1 > threshold) {
          leftSteps += 1;
          leftPlateSeries[leftPlateRows].data.push([copx1, copy1]);
        }
          
        if (fz1 < threshold) {
          isLeftPlateLocked = false;
          if (leftSteps > FREQUENCY_THRESHOLD_PERCENT * frequency) {

            let s = leftPlateFinalSeries;
            leftPlateFinalSeries = s;
            s.push({
              data: []
            });
            leftPlateSeries = s;
            leftPlateRows += 1;
          } else {
            leftPlateSeries[leftPlateRows].data = [];
          }
          leftSteps = 0;
        }
      } else {
        if (fz1 > threshold) {
          isLeftPlateLocked = true;
          leftPlateSeries[leftPlateRows].data.push([copx1, copy1]);
        }
      }
    }

    // Remove the first element of the array
    leftPlateFinalSeries.shift();
    rightPlateFinalSeries.shift();

    return {
      left: leftPlateFinalSeries.filter((_,idx) => validSteps.includes(`${idx+1}`)),
      right: rightPlateFinalSeries.filter((_,idx) => validSteps.includes(`${idx+1}`)),
    };
  }

  static copChartAxes(records, weight,validSteps) {
    return this.formCOPChartData(records, weight, FREQUENCY, STEP, validSteps)
  }

  static formTimelineChartData = (records, weight, step, leftColumnName, rightColumnName, trialThreshold, rangeMin, rangeMax,validSteps) => {
    
    // Right plate variables
    var rightPlateMax = -1;
    var isRightPlateLocked = false;
    var rightPlateSeries = [{ data: [] }]
    var isInsideRightRange = 0

    // Left plate variables
    var leftPlateMax = -1;
    var isLeftPlateLocked = false;
    var leftPlateSeries = [{ data: [] }]
    var isInsideLeftRange = 0

    for (var i = 0; i < records.length; i+=step) {
      var fz1 = Number(records[i]['Fz1']);
      var fz2 = Number(records[i]['Fz2']);
      var entryLeft = (Number(records[i][leftColumnName]) / Number(weight))*100;
      var entryRight = (Number(records[i][rightColumnName]) / Number(weight))*100;
      var threshold = 500;

      if (isRightPlateLocked) {
        if (fz2 > threshold) {
          if (rightPlateMax < entryRight) {
            rightPlateMax = entryRight;
          }
        }
        
        if (fz2 < threshold) {
          isRightPlateLocked = false;
          if (trialThreshold) {
            if (rightPlateMax > trialThreshold) {
              rightPlateSeries[0].data.push(rightPlateMax);
            }
          } else {
            rightPlateSeries[0].data.push(rightPlateMax);
          }
          if (rangeMin && rangeMax) {
            if (rangeMin <= rightPlateMax && rangeMax >= rightPlateMax) {
              isInsideRightRange +=1
            }
          }
          rightPlateMax = -1;
        }
      } else {
        if (fz2 > threshold) {
          isRightPlateLocked = true;
          if (rightPlateMax < entryRight) {
            rightPlateMax = entryRight;
          }
        }
      }

      if (isLeftPlateLocked) {
        if (fz1 > threshold) {
          if (leftPlateMax < entryLeft) {
            leftPlateMax = entryLeft;
          }
        }
          
        if (fz1 < threshold) {
          isLeftPlateLocked = false;
          if (trialThreshold) {
            if (leftPlateMax > trialThreshold) {
              leftPlateSeries[0].data.push(leftPlateMax);
            }
          } else {
            leftPlateSeries[0].data.push(leftPlateMax);
          }
          if (rangeMin && rangeMax) {
            if (rangeMin <= leftPlateMax && rangeMax >= leftPlateMax) {
              isInsideLeftRange +=1
            }
          }
          leftPlateMax = -1;
        }
      } else {
        if (fz1 > threshold) {
          isLeftPlateLocked = true;
          if (leftPlateMax < entryLeft) {
            leftPlateMax = entryLeft;
          }
        }
      }
    }

    // Calculate min and max of the left and right foot data
    var maxY = 0;
    var minY = 0;
    var maxLeft = Math.max(...leftPlateSeries[0].data)
    var maxRight = Math.max(...rightPlateSeries[0].data)
    maxY = Math.max(...[maxLeft, maxRight])
    var minLeft = Math.min(...leftPlateSeries[0].data)
    var minRight = Math.min(...rightPlateSeries[0].data)
    minY = Math.min(...[minLeft, minRight])

    return {
      left: leftPlateSeries[0].data.filter((_,idx) => validSteps.includes(`${idx+1}`)),
      right: rightPlateSeries[0].data.filter((_,idx) => validSteps.includes(`${idx+1}`)),
      isInsideLeftRange,
      isInsideRightRange,
      trialThreshold,
      rangeMax,
      rangeMin,
      maxY,
      minY
    };
  }

  static timelineAxes(records, weight, fx_threshold, fx_zone_min, fx_zone_max, fy_threshold, fy_zone_min, fy_zone_max, fz_threshold, fz_zone_min, fz_zone_max,validSteps) {
    let fx = this.formTimelineChartData(records, weight, STEP, 'Fx1', 'Fx2', fx_threshold, fx_zone_min, fx_zone_max,validSteps);
    let fy = this.formTimelineChartData(records, weight, STEP, 'Fy1', 'Fy2', fy_threshold, fy_zone_min, fy_zone_max,validSteps);
    let fz = this.formTimelineChartData(records, weight, STEP, 'Fz1', 'Fz2', fz_threshold, fz_zone_min, fz_zone_max,validSteps);
    return {
      fx,
      fy,
      fz
    }
  }
}

module.exports = Processor;