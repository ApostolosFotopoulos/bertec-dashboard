const { FREQUENCY } = require('../constants')
const math = require('../math')

class Metrics {

  static retrieve(rows) {
    return {
      left: this.calculateMetricsPerFoot(rows.left),
      right:this.calculateMetricsPerFoot(rows.right)
    }
  }

  static calculateMetricsPerFoot(rows) {

    var nOfIntegrals = 0;
    var sOfIntegrals = 0;
    var nOfLRates = 0;
    var sOfLRates = 0;
    var nOfMaxs = 0;
    var sOfMaxs = 0;
    var nOfTimeImpactPeakForce = 0;
    var sOfTimeImpactPeakForce = 0;

    for (var i = 0; i < rows.length; i++) {
      
      // Calculate the impulse
      let x = rows[i].data.map((_, id) => id / FREQUENCY);
      let y = rows[i].data
      let intg = math.integral(x, y)
      if (intg != 0) {
        nOfIntegrals += 1
        sOfIntegrals += intg
      }

      // Calculate the loading rate
      let [m] = math.localMax(rows[i].data)
      if (m) {
        let maxIdx = rows[i].data.indexOf(m)
        let fromIdx = Math.ceil(0.2 * maxIdx)
        let toIdx = Math.floor(0.8 * maxIdx)
        let sp = math.slope(fromIdx, rows[i].data[fromIdx], toIdx, rows[i].data[toIdx])
        if (sp) {
          nOfLRates += 1
          sOfLRates +=sp
        }

        // Calculate the impact peak force
        nOfMaxs += 1
        sOfMaxs += m
        
        // Calculate the time of impact peak force
        if (maxIdx) {
          nOfTimeImpactPeakForce += 1
          sOfTimeImpactPeakForce += (maxIdx / FREQUENCY)
        }
      }
    }
    return {
      impulse: nOfIntegrals > 0 ? (sOfIntegrals / nOfIntegrals) : 0,
      loadingRate: nOfLRates > 0 ? (sOfLRates / nOfLRates) : 0,
      impactPeakForce: nOfMaxs > 0 ? (sOfMaxs / nOfMaxs) : 0,
      timeImpactPeakForce: nOfTimeImpactPeakForce > 0 ? (sOfTimeImpactPeakForce / nOfTimeImpactPeakForce) :0
    };
  }
}

module.exports = Metrics;