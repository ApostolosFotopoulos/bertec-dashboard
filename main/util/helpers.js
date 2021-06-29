const fs = require('fs')
const parameters = require('./parameters')

function writeFileSyncRecursive(filename, content, charset) {
  let filepath = filename.replace(/\\/g,'/');  

  let root = '';
  if (filepath[0] === '/') { 
    root = '/'; 
    filepath = filepath.slice(1);
  } 
  else if (filepath[1] === ':') { 
    root = filepath.slice(0,3);   // c:\
    filepath = filepath.slice(3); 
  }

  const folders = filepath.split('/').slice(0, -1);
  folders.reduce(
    (acc, folder) => {
      const folderPath = acc + folder + '/';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath
    },
    root // first 'acc', important
  ); 
  
  fs.writeFileSync(root + filepath, content, charset);
}

const formRawLineChartData = (records, weight, leftColumn, rightColumn) => {
  var frequency = 10;
  var rightPlateRows = 0
  var rightSteps = 0
  var isRightPlateLocked = false;
  var rightPlateSeries = [{ data: [] }]
  var rightPlateFinalSeries = [{ data: [] }]
  
  var leftPlateRows = 0
  var leftSteps = 0
  var isLeftPlateLocked = false;
  var leftPlateSeries = [{ data: [] }]
  var leftPlateFinalSeries = [{ data: [] }]
  var maxY = -1;
  var minY = 0;

  for (var i = 0; i < records.length; i ++) {
    var fz1 = Number(records[i]['Fz1']);
    var fz2 = Number(records[i]['Fz2']);
    var entryLeft = (Number(records[i][leftColumn]) / Number(weight)) * 100;
    var entryRight = (Number(records[i][rightColumn]) / Number(weight)) * 100;
    var threshold = Number(0.05 * weight);
    
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
        if (rightSteps > 0.2 * frequency) {

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
        if (leftSteps > 0.2 * frequency) {

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

  return {
    left: leftPlateFinalSeries,
    right: rightPlateFinalSeries,
    maxY,
    minY,
  };
}


const formLineChartData = (records, weight, leftColumn, rightColumn) => {
  var frequency = 10;
  var step = 10;
  var rightPlateRows = 0
  var rightSteps = 0
  var isRightPlateLocked = false;
  var rightPlateSeries = [{ data: [] }]
  var rightPlateFinalSeries = [{ data: [] }]
  
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
    var entryLeft = (Number(records[i][leftColumn]) / Number(weight))*100;
    var entryRight = (Number(records[i][rightColumn]) / Number(weight))*100;
    var threshold = Number(0.05 * weight);
    console.log(fz1,threshold)
    
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
        if (rightSteps > 0.2 * frequency) {

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
        if (leftSteps > 0.2 * frequency) {

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


  return {
    left: leftPlateFinalSeries,
    right: rightPlateFinalSeries,
    maxY,
    minY,
  };
}

const formCOPChartData = (records, weight) => {
  var frequency = 10;
  var step = 10;

  var rightPlateRows = 0
  var rightSteps = 0
  var isRightPlateLocked = false;
  var rightPlateSeries = [{ data: [] }]
  var rightPlateFinalSeries = [{ data: [] }]
  
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
    var threshold = Number(0.05 * weight);
    
    if (isRightPlateLocked) {
      if (fz2 > threshold) {
        rightSteps += 1;
        rightPlateSeries[rightPlateRows].data.push([copx2, copy2]);
      }
      
      if (fz2 < threshold) {
        isRightPlateLocked = false;
        if (rightSteps > 0.2 * frequency) {

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
        if (leftSteps > 0.2 * frequency) {

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

  return {
    left: leftPlateFinalSeries,
    right: rightPlateFinalSeries,
  };
}

const formTimelineChartData = (records, weight,leftColumn, rightColumn, trialThreshold, rangeMin, rangeMax ) => {
  var step = 10;
  var rightPlateMax = -1;
  var isRightPlateLocked = false;
  var rightPlateSeries = [{ data: [] }]
  var isInsideRightRange = 0

  var leftPlateMax = -1;
  var isLeftPlateLocked = false;
  var leftPlateSeries = [{ data: [] }]
  var isInsideLeftRange = 0

  for (var i = 0; i < records.length; i+=step) {
    var fz1 = Number(records[i]['Fz1']);
    var fz2 = Number(records[i]['Fz2']);
    var entryLeft = (Number(records[i][leftColumn]) / Number(weight))*100;
    var entryRight = (Number(records[i][rightColumn]) / Number(weight))*100;
    var threshold = Number(0.05 * weight);

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

  var maxY = 0;
  var minY = 0;
  var maxLeft = Math.max(...leftPlateSeries[0].data)
  var maxRight = Math.max(...rightPlateSeries[0].data)
  maxY = Math.max(...[maxLeft, maxRight])
  var minLeft = Math.min(...leftPlateSeries[0].data)
  var minRight = Math.min(...rightPlateSeries[0].data)
  minY = Math.min(...[minLeft, minRight])

  return {
    left: leftPlateSeries[0].data,
    right: rightPlateSeries[0].data,
    isInsideLeftRange,
    isInsideRightRange,
    trialThreshold,
    rangeMax,
    rangeMin,
    maxY,
    minY
  };
}

const formLineChartJS = (row,min,max, id, color) => {
  return `
      var options = {
        series:${JSON.stringify(row.map((r, idx) => {
        return {
            data: r.data,
            name: "",
          }
        }))},
        dataLabels:{
          enabled:false,
          show:false
        },
        grid:{
          padding:{
            top:0,
            right:0,
            bottom:0,
            left:10,
          }
        },
        chart: {
          toolbar:{
            show:false,
          },
          animations:{
            enabled:false,
          },
          type:"line",
        },
        xaxis: {
          forceNiceScale: true,
          labels:{
            formatter: (val) => {
              if (val.toFixed(0) % 10 == 0) {
                return (val.toFixed(0)/100);
              }
            },
            show:true,
          },
          type:"category",
        },
        yaxis: {
          min: ${min - 10},
          ${max != -1?"max: "+(max + 10)+",":``}
          forceNiceScale: false,
          labels:{
            formatter: (val) => {
              return val.toFixed(0);
            },
            show:true,
          },
        },
        stroke: {
          curve: 'straight',
          width:1,
        },
        legend:{
          show:false
        },
        colors: [
          ({ value, seriesIndex, w }) => {
            return '${color}';
          },
        ],
      };

      var chart = new ApexCharts(document.querySelector("#${id}"), options);
      chart.render();
  `;
}



const formCOPChartJS = (row, id, color) => {
  return `
    var options = {
      series:${JSON.stringify(row.map((r, idx) => {
      return {
          data: r.data,
          name: "",
        }
      }))},
      dataLabels:{
        enabled:false,
        show:false
      },
      markers: {
        size:2,
        strokeColors: '${color}',
      },
      grid:{
        padding:{
          top:0,
          right:0,
          bottom:0,
          left:10,
        }
      },
      chart: {
        height:'600px',
        toolbar:{
          show:false,
        },
        animations:{
          enabled:false,
        },
        type: "scatter",
      },
      xaxis: {
        min: -200,
        max: 200,
        tickAmount: 32,
        tickPlacement: "between",
        forceNiceScale: false,
        labels:{
          formatter: (val) => {
            if (val.toFixed(0) % 10 == 0) {
              return val.toFixed(0);
            }
          },
          show:true,
        },
        type:"numeric",
      },
      yaxis: {
        min: -300,
        max: 300,
        tickAmount: 6,
        forceNiceScale: true,
        labels:{
          formatter: (val) => {
            return val.toFixed(0);
          },
          show:true,
        },
      },
      crosshairs: {
        show: false,
      },
      legend:{
        show:false
      },
      colors: [
        ({ value, seriesIndex, w }) => {
          return '${color}';
        },
      ],
    };

    var chart = new ApexCharts(document.querySelector("#${id}"), options);
    chart.render();

  `;
}

const formTimelineChartJS = (row,min,max, id, color, rangeMin, rangeMax) => {
  return `
      var options = {
        series:[{
          name:"",
          data:${JSON.stringify(row)},
        }],
        dataLabels:{
          enabled:false,
          show:false
        },
        grid:{
          padding:{
            top:0,
            right:0,
            bottom:0,
            left:10,
          }
        },
        chart: {
          toolbar:{
            show:false,
          },
          animations:{
            enabled:false,
          },
          type:"line",
        },
        xaxis: {
          forceNiceScale: true,
          labels:{
            formatter: (val) => {
              return val.toFixed(0);
            },
            show:true,
          },
          type:"category",
        },
        yaxis: {
          min: ${min - 10},
          ${max != -1?"max: "+(max + 10)+",":``}
          forceNiceScale: false,
          labels:{
            formatter: (val) => {
              return val.toFixed(0);
            },
            show:true,
          },
        },
        stroke: {
          curve: 'straight',
          width:1,
        },
        legend:{
          show:false
        },
        colors: [
          ({ value, seriesIndex, w }) => {
            return '${color}';
          },
        ],
        annotations: {
          yaxis: ${(rangeMax && rangeMin) ? JSON.stringify([{
            y: rangeMin,
            y2: rangeMax,
            borderColor: "#000",
            fillColor: "#FEB019",
          }]):JSON.stringify([])},
        },
      };

      var chart = new ApexCharts(document.querySelector("#${id}"), options);
      chart.render();
  `;
}

const formMeasurements = (fxRaw,fyRaw,fzRaw) => {
  return `
    <div class="container p-1 pt-3 pl-3 pr-3" style="margin-top:55%;">
      <h1 class="title is-6 has-text-centered">Measurements</h1>
      <table class="pl-3 pr-3">
        <tr>
          <th>Parameter</th>
          <th>Left Foot Value</th>
          <th>Right Foot Value</th>
        </tr>
        <tr>
          <td>Vertical Impulse (FX)</td>
          <td>${parameters.verticalImpulse(fxRaw.left).toFixed(1)} % BW.s</td>
          <td>${parameters.verticalImpulse(fxRaw.right).toFixed(1)} % BW.s</td>
        </tr>
        <tr>
          <td>Vertical Impulse (FY)</td>
          <td>${parameters.verticalImpulse(fyRaw.left).toFixed(1)} % BW.s</td>
          <td>${parameters.verticalImpulse(fyRaw.right).toFixed(1)} % BW.s</td>
        </tr>
        <tr>
          <td>Vertical Impulse (FZ)</td>
          <td>${parameters.verticalImpulse(fzRaw.left).toFixed(1)} % BW.s</td>
          <td>${parameters.verticalImpulse(fzRaw.right).toFixed(1)} % BW.s</td>
        </tr>
        <tr>
          <td>Loading Rate (FX)</td>
          <td>${parameters.loadingRate(fxRaw.left).toFixed(1)} % BW/s</td>
          <td>${parameters.loadingRate(fxRaw.right).toFixed(1)} % BW/s</td>
        </tr>
        <tr>
          <td>Loading Rate (FY)</td>
          <td>${parameters.loadingRate(fyRaw.left).toFixed(1)} % BW/s</td>
          <td>${parameters.loadingRate(fyRaw.right).toFixed(1)} % BW/s</td>
        </tr>
        <tr>
          <td>Loading Rate (FZ)</td>
          <td>${parameters.loadingRate(fzRaw.left).toFixed(1)} % BW/s</td>
          <td>${parameters.loadingRate(fzRaw.right).toFixed(1)} % BW/s</td>
        </tr>
        <tr>
          <td>Impact Peak Force (FX)</td>
          <td>${parameters.impactPeakForce(fxRaw.left).toFixed(1)} % BW</td>
          <td>${parameters.impactPeakForce(fxRaw.right).toFixed(1)} % BW</td>
        </tr>
        <tr>
          <td>Impact Peak Force (FY)</td>
          <td>${parameters.impactPeakForce(fyRaw.left).toFixed(1)} % BW</td>
          <td>${parameters.impactPeakForce(fyRaw.right).toFixed(1)} % BW</td>
        </tr>
        <tr>
          <td>Impact Peak Force (FZ)</td>
          <td>${parameters.impactPeakForce(fzRaw.left).toFixed(1)} ms</td>
          <td>${parameters.impactPeakForce(fzRaw.right).toFixed(1)} ms</td>
        </tr>
        <tr>
          <td>Time to Impact Peak Force (FX)</td>
          <td>${parameters.impactPeakForce(fxRaw.left).toFixed(1)} ms</td>
          <td>${parameters.impactPeakForce(fxRaw.right).toFixed(1)} ms</td>
        </tr>
        <tr>
          <td>Time to Impact Peak Force (FY)</td>
          <td>${parameters.impactPeakForce(fyRaw.left).toFixed(1)} ms</td>
          <td>${parameters.impactPeakForce(fyRaw.right).toFixed(1)} ms</td>
        </tr>
        <tr>
          <td>Time to Impact Peak Force (FZ)</td>
          <td>${parameters.impactPeakForce(fzRaw.left).toFixed(1)} ms</td>
          <td>${parameters.impactPeakForce(fzRaw.right).toFixed(1)} ms</td>
        </tr>
      </table>
    </div>
  `
}

const generateHTML = (fx,fxRaw, fy,fyRaw, fz,fzRaw, cop, timelineFX, timelineFY, timelineFZ,rows) => {
  return `
    <html lang="en">
      <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>Report</title>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.2/css/bulma.min.css"/>
      <style>
        @import url(https://fonts.googleapis.com/css?family=Lato:100,300,400,700);
        html, body {
          height:100%;
          font-family: 'Lato', sans-serif;
          display: block;
          border: none;
          height: 100vh;
          width: 100vw;
        }
        .has-image-centered {
          margin-left: auto;
          margin-right: auto;
        }
        table {
          font-family: arial, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }

        td, th {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }

        tr:nth-child(even) {
          background-color: #dddddd;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="columns is-vcentered is-centered">
            <div class="column">
              <figure class="image is-128x128 has-image-centered">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTLsGTQWarOLIuj-4ZYkmSfDKh5wh7jX-R_qBjEG_5lfHjeFGs-waC1PRw0TSu9iAjCZ8&usqp=CAU"
                />
              </figure>
            </div>
            <div class="column has-text-centered">
              <div>
                Όνομα Πελάτη
              </div>
              <div>
                Session Name
              </div>
              <div>
                Trial Name
              </div>
            </div>
            <div class="column">
              <figure class="image is-128x128 has-image-centered">
                <img
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F414%2F592%2Foriginal%2Fvector-report-icon.jpg&f=1&nofb=1"
                />
              </figure>
            </div>
          </div>
        </div>
        <div class="container pl-3 pr-3">
          <h1 class="title is-6 has-text-centered">Line Charts</h1>
          <h1 class="title is-6 p-0 has-text-centered">Fx</h1>
          <div class="columns is-vcentered is-centered p-0">
            <div class="column has-text-centered p-0">
              <h1 class="title is-6 p-0">Left Foot</h1>
            </div>
            <div class="column has-text-centered p-0">
              <h1 class="title is-6 p-0">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-fx" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-foot-fx" style="height:200px; width:400px;"></div>
            </div>
          </div>
          <h1 class="title is-6 p-0 has-text-centered">Fy</h1>
          <div class="columns is-vcentered is-centered pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-fy" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-foot-fy" style="height:200px; width:400px;"></div>
            </div>
          </div>
          <h1 class="title is-6 p-0 has-text-centered">Fz</h1>
          <div class="columns is-vcentered is-centered pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-fz" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-foot-fz" style="height:200px; width:400px;"></div>
            </div>
          </div>
        </div>
        <div class="container p-1 pt-5" style="margin-top:20%;">
          <h1 class="title is-6 has-text-centered">COP Charts</h1>
          <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <h1 class="title is-6 p-0">Left Foot</h1>
            </div>
            <div class="column has-text-centered p-0">
              <h1 class="title is-6 p-0">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered p-0 pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-cop" style="width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-foot-cop" style="width:400px;"></div>
            </div>
          </div>
        </div>
        <div class="container">
          <h1 class="title is-6 has-text-centered">Timeline Charts</h1>
          <h1 class="title is-6 p-0 has-text-centered">Fx</h1>
          ${
            timelineFX.rangeMax && timelineFX.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
                <div class="column has-text-centered p-0">
            `+ (timelineFX.isInsideLeftRange / timelineFX.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineFX.isInsideRightRange / timelineFX.right.length).toFixed(1) * 100 + ` %`+
            `  </div>
              </div>
            `
            :""
          }
          <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-timeline-fx" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-timeline-fx" style="height:200px; width:400px;"></div>
            </div>
          </div>
          <h1 class="title is-6 pt-6 has-text-centered" style="margin-top:20%;">Fy</h1>
          ${
            timelineFY.rangeMax && timelineFY.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0">
                <div class="column has-text-centered p-0">
            `+ (timelineFY.isInsideLeftRange / timelineFY.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineFY.isInsideRightRange / timelineFY.right.length).toFixed(1) * 100 + ` %`+
            `  </div>
              </div>
            `
            :""
          }
          <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-timeline-fy" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-timeline-fy" style="height:200px; width:400px;"></div>
            </div>
          </div>
          <h1 class="title is-6 pt-6 has-text-centered">Fz</h1>
          ${
            timelineFZ.rangeMax && timelineFZ.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0">
                <div class="column has-text-centered p-0">
            `+ (timelineFZ.isInsideLeftRange / timelineFZ.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineFZ.isInsideRightRange / timelineFZ.right.length).toFixed(1) * 100 + ` %`+
            `  </div>
              </div>
            `
            :""
          }
          <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
            <div class="column has-text-centered p-0">
              <div id="left-foot-timeline-fz" style="height:200px; width:400px;"></div>
            </div>
            <div class="column has-text-centered p-0">
              <div id="right-timeline-fz" style="height:200px; width:400px;"></div>
            </div>
          </div>
        </div>
        ${formMeasurements(fxRaw,fyRaw,fzRaw)}
        <script>
          ${formLineChartJS(fx.left, fx.minY,fx.maxY,'left-foot-fx', '#d32d41')}
          ${formLineChartJS(fx.right,fx.minY, fx.maxY,'right-foot-fx', '#6ab187')}
          ${formLineChartJS(fy.left,fy.minY, fy.maxY, 'left-foot-fy', '#d32d41')}
          ${formLineChartJS(fy.right,fy.minY, fy.maxY, 'right-foot-fy', '#6ab187')}
          ${formLineChartJS(fz.left,fz.minY, fz.maxY, 'left-foot-fz', '#d32d41')}
          ${formLineChartJS(fz.right,fz.minY, fz.maxY, 'right-foot-fz', '#6ab187')}
          ${formCOPChartJS(cop.left, 'left-foot-cop', '#d32d41')}
          ${formCOPChartJS(cop.right, 'right-foot-cop', '#6ab187')}
          ${formTimelineChartJS(timelineFX.left,timelineFX.minY,timelineFX.maxY,'left-foot-timeline-fx', '#d32d41',timelineFX.rangeMin,timelineFX.rangeMax)}
          ${formTimelineChartJS(timelineFX.right,timelineFX.minY,timelineFX.maxY,'right-timeline-fx', '#6ab187',timelineFX.rangeMin,timelineFX.rangeMax)}
          ${formTimelineChartJS(timelineFY.left,timelineFY.minY,timelineFY.maxY,'left-foot-timeline-fy', '#d32d41',timelineFY.rangeMin,timelineFY.rangeMax)}
          ${formTimelineChartJS(timelineFY.right,timelineFY.minY,timelineFY.maxY,'right-timeline-fy', '#6ab187',timelineFY.rangeMin,timelineFY.rangeMax)}
          ${formTimelineChartJS(timelineFZ.left,timelineFZ.minY,timelineFZ.maxY,'left-foot-timeline-fz', '#d32d41',timelineFZ.rangeMin,timelineFZ.rangeMax)}
          ${formTimelineChartJS(timelineFZ.right,timelineFZ.minY,timelineFZ.maxY,'right-timeline-fz', '#6ab187',timelineFZ.rangeMin,timelineFZ.rangeMax)}
        </script>
      </body>
    </html>
  `
}
module.exports = {
  writeFileSyncRecursive,
  formLineChartData,
  formCOPChartData,
  formTimelineChartData,
  formTimelineChartJS,
  formMeasurements,
  formLineChartJS,
  formCOPChartJS,
  generateHTML,
  formRawLineChartData,
}