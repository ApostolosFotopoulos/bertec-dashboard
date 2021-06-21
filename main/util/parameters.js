const math = require('./math')

module.exports = class {
  static verticalImpulse(rows){
    let numOfRows = 0
    let sumOfIntegral = 0
    for (var i = 0; i < rows.length; i++){
      let x = rows[i].data.map((_, id) => id);
      let y = rows[i].data
      let intg = math.integral(x, y)
      if (intg != 0) {
        numOfRows += 1
        sumOfIntegral += intg
      }
    }
    return sumOfIntegral / numOfRows;
  }

  static loadingPeakForce(rows) {
    let numOfMaxs= 0
    let sumOfMaxs = 0
    for (var i = 0; i < rows.length; i++){
      let [m] = math.localMax(rows[i].data)
      if (m) {
        numOfMaxs += 1
        sumOfMaxs += m
      }
    }
    return sumOfMaxs / numOfMaxs;
  }

  static loadingRate(rows) {
    let numOfRates = 0
    let sumOfRates = 0
    for (var i = 0; i < rows.length; i++){
      let [m] = math.localMax(rows[i].data)
      if (m) {
        let maxIdx = rows[i].data.indexOf(m)
        let fromIdx = Math.ceil(0.2 * maxIdx)
        let toIdx = Math.floor(0.8 * maxIdx)
        let sp = math.slope(fromIdx, rows[i].data[fromIdx], toIdx, rows[i].data[toIdx])
        if (sp) {
          numOfRates += 1
          sumOfRates +=sp
        }
      }
    }
    return sumOfRates / numOfRates;
  }

  static timeToLoadingPeak(rows) {
    let numOfTimes = 0
    let sumOfTimes = 0
    for (var i = 0; i < rows.length; i++){
      let [m] = math.localMax(rows[i].data)
      if (m) {
        let maxIdx = rows[i].data.indexOf(m)
        if (maxIdx) {
          numOfTimes += 1
          sumOfTimes += maxIdx
        }
      }
    }
    return sumOfTimes / numOfTimes;
  }
}