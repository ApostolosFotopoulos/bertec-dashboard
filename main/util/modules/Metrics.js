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
    var nOfImpactPeakForce = 0;
    var sOfImpactPeakForce = 0;
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
      console.log(m)
      if (m) {
        let maxIdx = rows[i].data.indexOf(m)
        let from = (20 * maxIdx) / m
        let to = (80 * maxIdx) / m
        let sp = math.slope(from/ FREQUENCY, 20, to/ FREQUENCY, 80)
        if (sp) {
          nOfLRates += 1
          sOfLRates += sp
        }

        // Calculate the impact peak force
        nOfImpactPeakForce += 1
        sOfImpactPeakForce += m
        
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
      impactPeakForce: nOfImpactPeakForce > 0 ? (sOfImpactPeakForce / nOfImpactPeakForce) : 0,
      timeImpactPeakForce: nOfTimeImpactPeakForce > 0 ? (sOfTimeImpactPeakForce / nOfTimeImpactPeakForce) :0
    };
  }
  static calculateAverageMetricsPerFoot(rows) {

    var averageImpulses = [];
    var averageLRates = [];
    var averageImpactPeakForce = [];
    var averageTimeImpactPeakForce = [];

    for (var i = 0; i < rows.length; i++) {
      
      // Calculate the impulse
      let x = rows[i].data.map((_, id) => id / FREQUENCY);
      let y = rows[i].data
      let intg = math.integral(x, y)
      if (intg != 0) {
        averageImpulses.push(intg)
      }

      // Calculate the loading rate
      let [m] = math.localMax(rows[i].data)
      if (m) {
        let maxIdx = rows[i].data.indexOf(m)
        let from = (20 * maxIdx) / m
        let to = (80 * maxIdx) / m
        let sp = math.slope(from/ FREQUENCY, 20, to/ FREQUENCY, 80)
        if (sp) {
          averageLRates.push(sp)
        }

        // Calculate the impact peak force
        averageImpactPeakForce.push(m)
        
        // Calculate the time of impact peak force
        if (maxIdx) {
          averageTimeImpactPeakForce.push(maxIdx / FREQUENCY)
        }
      }
    }
    return {
      averageImpulses,
      averageLRates,
      averageImpactPeakForce,
      averageTimeImpactPeakForce,
    };
  }
}

module.exports = Metrics;