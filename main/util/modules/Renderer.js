const moment = require('moment');
const { app } = require("electron");
const Metrics = require('./Metrics');
var html_to_pdf = require('html-pdf-node');
var pdf = require('html-pdf');

class Renderer{
  static generateTimelineChart(row, min, max, id, color, rangeMin, rangeMax) {
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
          min: ${min > 10? min - 10:min},
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

  static generateLineChart(row, min, max, id, color) {
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
              return (val.toFixed(0)/100);
            },
            show:true,
          },
          tickAmount: 10,
        },
        yaxis: {
          min: ${min > 10? min - 10:min},
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

  static generateCOPChart(row, id, color) {
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

  static genereateMeasumentsTable(fx, fy, fz, symmetries) {

    // Calculate all the metrics for every axis
    let fxMetrics = Metrics.retrieve(fx)
    let fyMetrics = Metrics.retrieve(fy)
    let fzMetrics = Metrics.retrieve(fz)

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
            <td> Impulse Fx</td>
            <td>${fxMetrics.left.impulse.toFixed(2)} % BW.s</td>
            <td>${fxMetrics.right.impulse.toFixed(2)} % BW.s</td>
          </tr>
          <tr>
            <td> Impulse Fy</td>
            <td>${fyMetrics.left.impulse.toFixed(2)} % BW.s</td>
            <td>${fyMetrics.right.impulse.toFixed(2)} % BW.s</td>
          </tr>
          <tr>
            <td>Vertical Impulse FZ</td>
            <td>${fzMetrics.left.impulse.toFixed(2)} % BW.s</td>
            <td>${fzMetrics.right.impulse.toFixed(2)} % BW.s</td>
          </tr>
          <tr>
            <td>Loading Rate (FX)</td>
            <td>${fxMetrics.left.loadingRate.toFixed(2)} % BW/s</td>
            <td>${fxMetrics.right.loadingRate.toFixed(2)} % BW/s</td>
          </tr>
          <tr>
            <td>Loading Rate (FY)</td>
            <td>${fyMetrics.left.loadingRate.toFixed(2)} % BW/s</td>
            <td>${fyMetrics.right.loadingRate.toFixed(2)} % BW/s</td>
          </tr>
          <tr>
            <td>Loading Rate (FZ)</td>
            <td>${fzMetrics.left.loadingRate.toFixed(2)} % BW/s</td>
            <td>${fzMetrics.right.loadingRate.toFixed(2)} % BW/s</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FX)</td>
            <td>${fxMetrics.left.impactPeakForce.toFixed(2)} % BW</td>
            <td>${fxMetrics.right.impactPeakForce.toFixed(2)} % BW</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FY)</td>
            <td>${fyMetrics.left.impactPeakForce.toFixed(2)} % BW</td>
            <td>${fyMetrics.right.impactPeakForce.toFixed(2)} % BW</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FZ)</td>
            <td>${fzMetrics.left.impactPeakForce.toFixed(2)} % BW</td>
            <td>${fzMetrics.right.impactPeakForce.toFixed(2)} % BW</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FX)</td>
            <td>${fxMetrics.left.timeImpactPeakForce.toFixed(3)} ms</td>
            <td>${fxMetrics.right.timeImpactPeakForce.toFixed(3)} ms</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FY)</td>
            <td>${fyMetrics.left.timeImpactPeakForce.toFixed(3)} ms</td>
            <td>${fyMetrics.right.timeImpactPeakForce.toFixed(3)} ms</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FZ)</td>
            <td>${fzMetrics.left.timeImpactPeakForce.toFixed(3)} ms</td>
            <td>${fzMetrics.right.timeImpactPeakForce.toFixed(3)} ms</td>
          </tr>
        </table>
        <table class="pl-3 pr-3 mt-3">
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Step Symmetry (SPS)</td>
            <td>${(symmetries.step.toFixed(3))}</td>
          </tr>
          <tr>
            <td>Stance Symmetry (SNS)</td>
            <td>${(symmetries.stance.toFixed(3))}</td>
          </tr>
        </table>
      </div>
    `
  }

  static generateHTML(user, trial, session, lineChartAxes, copAxes, timelineAxes, symmetries){
    let html = `
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
                ${moment(new Date(trial.created_at)).format("DD-MM-YYYY HH:mm")}
              </div>
              <div>
                ${user.first_name +" "+user.last_name}
              </div>
              <div>
                ${session.name}
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
            timelineAxes.fx.rangeMax && timelineAxes.fx.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fx.isInsideLeftRange / timelineAxes.fx.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fx.isInsideRightRange / timelineAxes.fx.right.length).toFixed(1) * 100 + ` %`+
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
            timelineAxes.fy.rangeMax && timelineAxes.fy.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fy.isInsideLeftRange / timelineAxes.fy.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fy.isInsideRightRange / timelineAxes.fy.right.length).toFixed(1) * 100 + ` %`+
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
            timelineAxes.fz.rangeMax && timelineAxes.fz.rangeMin ?
            `
              <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fz.isInsideLeftRange / timelineAxes.fz.left.length).toFixed(1) * 100 + ` %`+
            `  </div>
            `+`
                <div class="column has-text-centered p-0">
            `+ (timelineAxes.fz.isInsideRightRange / timelineAxes.fz.right.length).toFixed(1) * 100 + ` %`+
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
        ${this.genereateMeasumentsTable(lineChartAxes.fx, lineChartAxes.fy, lineChartAxes.fz, symmetries)}
        <script>
          ${this.generateLineChart(lineChartAxes.fxRaw.left, lineChartAxes.fxRaw.minY, lineChartAxes.fxRaw.maxY, 'left-foot-fx', '#d32d41')}
          ${this.generateLineChart(lineChartAxes.fxRaw.right,lineChartAxes.fxRaw.minY, lineChartAxes.fxRaw.maxY, 'right-foot-fx', '#6ab187')}
          ${this.generateLineChart(lineChartAxes.fyRaw.left, lineChartAxes.fyRaw.minY, lineChartAxes.fyRaw.maxY, 'left-foot-fy', '#d32d41')}
          ${this.generateLineChart(lineChartAxes.fyRaw.right, lineChartAxes.fyRaw.minY, lineChartAxes.fyRaw.maxY, 'right-foot-fy', '#6ab187')}
          ${this.generateLineChart(lineChartAxes.fzRaw.left, lineChartAxes.fzRaw.minY, lineChartAxes.fzRaw.maxY, 'left-foot-fz', '#d32d41')}
          ${this.generateLineChart(lineChartAxes.fzRaw.right, lineChartAxes.fzRaw.minY, lineChartAxes.fzRaw.maxY, 'right-foot-fz', '#6ab187')}
          ${this.generateCOPChart(copAxes.left, 'left-foot-cop', '#d32d41')}
          ${this.generateCOPChart(copAxes.right, 'right-foot-cop', '#6ab187')}
          ${this.generateTimelineChart(timelineAxes.fx.left,timelineAxes.fx.minY,timelineAxes.fx.maxY,'left-foot-timeline-fx', '#d32d41',timelineAxes.fx.rangeMin,timelineAxes.fx.rangeMax)}
          ${this.generateTimelineChart(timelineAxes.fx.right,timelineAxes.fx.minY,timelineAxes.fx.maxY,'right-timeline-fx', '#6ab187',timelineAxes.fx.rangeMin,timelineAxes.fx.rangeMax)}
          ${this.generateTimelineChart(timelineAxes.fy.left,timelineAxes.fy.minY,timelineAxes.fy.maxY,'left-foot-timeline-fy', '#d32d41',timelineAxes.fy.rangeMin,timelineAxes.fy.rangeMax)}
          ${this.generateTimelineChart(timelineAxes.fy.right,timelineAxes.fy.minY,timelineAxes.fy.maxY,'right-timeline-fy', '#6ab187',timelineAxes.fy.rangeMin,timelineAxes.fy.rangeMax)}
          ${this.generateTimelineChart(timelineAxes.fz.left,0,timelineAxes.fz.maxY,'left-foot-timeline-fz', '#d32d41',timelineAxes.fz.rangeMin,timelineAxes.fz.rangeMax)}
          ${this.generateTimelineChart(timelineAxes.fz.right,0,timelineAxes.fz.maxY,'right-timeline-fz', '#6ab187',timelineAxes.fz.rangeMin,timelineAxes.fz.rangeMax)}
        </script>
      </body>
    </html>
    `
    return encodeURIComponent(html);
  }

  static async start(user, trial, session, lineChartAxes, copAxes, timelineAxes, symmetries) {
    try {
          const html = this.generateHTML(user, trial, session, lineChartAxes, copAxes, timelineAxes, symmetries);
          let file = { content: `${decodeURIComponent(html)}` }
          let options = { format: 'A4' , path: app.getPath("downloads")+"/"+trial.name+".pdf", args:['--allow-file-access-from-files']};
          await new Promise((resolve, reject) => {
            html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
              console.log("PDF Buffer:-", pdfBuffer);
              resolve();
            });
          });
        } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Renderer;