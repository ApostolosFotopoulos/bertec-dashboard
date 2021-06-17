module.exports = class {
  static integral(x,y) {
    let area = 0;
    for(var i = 0; i < y.length - 1; i++){
      area += (x[i + 1] - x[i])*(y[i] + y[i + 1]);
    }
    area = (1/2)*area;
    return area;
  }
}