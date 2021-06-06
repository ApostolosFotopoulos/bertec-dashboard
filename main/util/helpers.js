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

const formDataToChartSeries = (records, weight) =>{
  //console.log(records)
  var frequency = 100;

  var rightPlateRows = 0
  var rightSteps = 0
  var isRightPlateLocked = false;
  var rightPlateSeries = [{ data: []}]
  var rightPlateFinalSeries = [{ data: []}]
  
  var leftPlateRows = 0
  var leftPlateSeries = [{ data: [] }]
  var leftPlateFinalSeries = [{ data: [] }]
  var isLeftPlateLocked = false;

  for (var i = 0; i < records.length; i++){
    var fz1 = Number(records[i]['Fz1']);
    var fz2 = Number(records[i]['Fz2']);
    var entryRight = Number(records[i]['Fz2'])
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
  }

  return rightPlateFinalSeries;
}

module.exports = {
  writeFileSyncRecursive,
  formDataToChartSeries
}