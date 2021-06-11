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

const formChartData = (records, weight,leftColumn,rightColumn) => {
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
    var entryLeft = (Number(records[i][leftColumn]) / Number(weight))*100;
    var entryRight = (Number(records[i][rightColumn]) / Number(weight))*100;
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

const formChartJS = (row, id, color) => {
  return ` 
    new Chart(document.getElementById('${id}'), {
      type: 'line',
      data: {
        labels: [${row[1].data.map((d, id) => id)}],
        datasets: ${JSON.stringify(row.map((r, idx) => {
          return {
              data: r.data,
              fill: false,
              borderColor: color,
              backgroundColor: color,
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

const generateHTML = (fx,fy,fz) => {
  return `
    <html lang="en">
      <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>Report</title>
      <link rel="stylesheet" href="./index.css" />
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
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script>
      </head>
      <body>
        <div class="container p-5">
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
        <div class="container has-text-centered">
          <h1 class="title is-4">Line Charts</h1>
        </div>
        <div class="container p-5">
          <h1 class="title is-4">Fx</h1>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fx"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fx"></canvas>
            </div>
          </div>
          <h1 class="title is-4">Fy</h1>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fy"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fy"></canvas>
            </div>
          </div>
          <h1 class="title is-4">Fz</h1>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fz-2"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fz-2"></canvas>
            </div>
          </div>
        </div>
        <div class="container p-5 has-text-centered" style="margin-top:25%">
          <h1 class="title is-4">Timeline</h1>
        </div>
        <div class="container p-5">
          <h1 class="title is-4">Fx</h1>
          <div class="columns is-vcentered is-centered"> 
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fx"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fx"></canvas>
            </div>
          </div>
          <h1 class="title is-4">Fy</h1>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fy"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fy"></canvas>
            </div>
          </div>
          <h1 class="title is-4">Fz</h1>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <h1 class="title is-5">Left Foot</h1>
            </div>
            <div class="column has-text-centered">
              <h1 class="title is-5">Right Foot</h1>
            </div>
          </div>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered">
              <canvas id="left-foot-fz-2"></canvas>
            </div>
            <div class="column has-text-centered">
              <canvas id="right-foot-fz-2"></canvas>
            </div>
          </div>
        </div>
        <script>
          ${formChartJS(fx.left,'left-foot-fx','#d32d41')}
          ${formChartJS(fx.right, 'right-foot-fx','#6ab187')}
          ${formChartJS(fy.left,'left-foot-fy','#d32d41')}
          ${formChartJS(fy.right, 'right-foot-fy','#6ab187')}
          ${formChartJS(fz.left,'left-foot-fz-2','#d32d41')}
          ${formChartJS(fz.right, 'right-foot-fz-2','#6ab187')}
        </script>
      </body>
    </html>
  `
}
module.exports = {
  writeFileSyncRecursive,
  formChartData,
  formChartJS,
  generateHTML,
}