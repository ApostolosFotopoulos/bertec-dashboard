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
}