module.exports = class {
  static integral(x,y) {
    let area = 0;
    for(var i = 0; i < y.length - 1; i++){
      area += (x[i + 1] - x[i])*(y[i] + y[i + 1]);
    }
    area = (1/2)*area;
    return area;
  }
  static localMax(rows) {
    let mx = []

    if (rows.length == 0) {
      return mx;
    }

    for (var i = 1; i < rows.length - 1; i++){
      if (rows[i - 1] < rows[i] && rows[i] > rows[i + 1]) {
        mx.push(rows[i]);
      }
    }

    if (rows[rows.length] > rows[rows.length - 1]) {
      mx.push(rows[rows.length])
    }

    return mx;
  }
  static localMin(rows) {
    let mn = []

    if (rows.length == 0) {
      return mn;
    }

    for (var i = 1; i < rows.length - 1; i++){
      if (rows[i - 1] > rows[i] && rows[i] < rows[i + 1]) {
        mn.push(rows[i]);
      }
    }

    if (rows[rows.length] < rows[rows.length - 1]) {
      mn.push(rows[rows.length])
    }

    return mn;
  }

  static slope(x1, y1, x2, y2) {
    return (y2 - y1)/(x2 - x1);
  }
}