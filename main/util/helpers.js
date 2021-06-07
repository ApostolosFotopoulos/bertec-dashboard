const fs = require('fs')
const rowsNames = require('../../assets/store/rowsNames.json');
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

const formDataToChartSeries = (records, weight,leftColumn,rightColumn) => {
  var frequency = 100;

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

  for (var i = 0; i < records.length; i++) {
    var fz1 = Number(records[i]['Fz1']);
    var fz2 = Number(records[i]['Fz2']);
    var entryLeft = Number(records[i][leftColumn])
    var entryRight = Number(records[i][rightColumn])
    var threshold = Number(0.05 * weight);
    
    if (isRightPlateLocked) {
      if (fz2 > threshold) {
        rightSteps += 1;
        rightPlateSeries[rightPlateRows].data.push(entryRight);
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
      }
    } else {
      if (fz2 > threshold) {
        isRightPlateLocked = true;
        rightPlateSeries[rightPlateRows].data.push(entryRight);
      }
    }

    if (isLeftPlateLocked) {
      if (fz1 > threshold) {
        leftSteps += 1;
        leftPlateSeries[leftPlateRows].data.push(entryLeft);
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
      }
    } else {
      if (fz1 > threshold) {
        isLeftPlateLocked = true;
        leftPlateSeries[leftPlateRows].data.push(entryLeft);
      }
    }
  }


  return {
    left: leftPlateFinalSeries,
    right: rightPlateFinalSeries,
  };
}

const formChartJS = (row, id) => {
  return ` 
    new Chart(document.getElementById('${id}'), {
      type: 'line',
      data: {
        labels: [${row[1].data.map((d, id) => id)}],
        datasets: ${JSON.stringify(row.map((r, idx) => {
          return {
              data: r.data,
              fill: false,
              borderColor: '#2196f3',
              backgroundColor: '#2196f3',
              borderWidth: 1
            }
          }))}
      },
      options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
        elements: {
          point:{
            radius: 0
          }
        },
        scales: {
          xAxes: [{
              ticks: {
                  display: false
              },
              gridLines : {
                  display : false
              }
          }]
        },
        legend: {
          display: false
        }
      }
    });
  `;
}
module.exports = {
  writeFileSyncRecursive,
  formDataToChartSeries,
  formChartJS
}