import moment from "moment";
import { User, Trial, Session,Record, LineChartSeries, LineCharts,COPs, COPChartSeries, Timelines, PerFootMetrics, StepDurationsPerFoot } from "./Interfaces";
import { DataProcessor } from "./DataProcessor";
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { FREQUENCY } from "../constants";
import { Metrics } from "./Metrics";
const htmlToPdf = require('html-pdf-node');


class Renderer {

  static generateHeader(user: User, trial: Trial, session: Session): string {
    return `
      <div class="container">
        <div class="columns is-vcentered is-centered">
          <div class="column">
            <figure class="image is-128x128 has-image-centered pt-3">
              <img
                width="128"
                src="data:image/png;base64,${fs.readFileSync(path.resolve(__dirname,'../../../assets/uth.png'), 'base64')}"
              />
            </figure>
          </div>
          <div class="column has-text-centered">
            <div>
              ${user.first_name +" "+user.last_name}
            </div>
            <div>
              ${session.name}
            </div>
            <div>
              ${moment(new Date(trial.created_at)).format("DD-MM-YYYY HH:mm")}
            </div>
          </div>
          <div class="column has-text-centered  is-vcentered is-centered pt-5">
            <h6>Powered By: </h6>
            <figure class="image image is-64x64 has-image-centered">
              <img
                width="64"
                src="data:image/jpeg;base64,${fs.readFileSync(path.resolve(__dirname,'../../../assets/logo.jpg'), 'base64')}"
              />
            </figure>
          </div>
        </div>
      </div>
    `;
  }

  static generateTimelineChart(row: Array<number>, min: number, max: number, id: string, color: string, rangeMin: number, rangeMax: number) {
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
  
  static generateTimelinesSection(tl: Timelines, trial: Trial): string {
    return `
      <div class="container">
        <h1 class="title is-6 has-text-centered">Timeline Charts</h1>
        <h1 class="title is-6 p-0 has-text-centered">Fx</h1>
        ${
          tl.fx.inRangeleft != -1 && tl.fx.inRangeRight ?
          `
            <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
              <div class="column has-text-centered p-0">
          `+ (tl.fx.inRangeleft) * 100 + ` %`+
          `  </div>
          `+`
              <div class="column has-text-centered p-0">
          `+ (tl.fx.inRangeRight) * 100 + ` %`+
          `  </div>
            </div>
          `
          :""
        }
        <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
          <div class="column has-text-centered p-0">
            <div id="left-foot-timeline-fx" style="height:200px; width:380px;"></div>
          </div>
          <div class="column has-text-centered p-0">
            <div id="right-foot-timeline-fx" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <h1 class="title is-6 pt-6 has-text-centered" style="margin-top:20%;">Fy</h1>
        ${
          tl.fy.inRangeleft != -1 && tl.fy.inRangeRight ?
          `
            <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
              <div class="column has-text-centered p-0">
          `+ (tl.fy.inRangeleft) * 100 + ` %`+
          `  </div>
          `+`
              <div class="column has-text-centered p-0">
          `+ (tl.fy.inRangeRight) * 100 + ` %`+
          `  </div>
            </div>
          `
          :""
        }
        <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
          <div class="column has-text-centered p-0">
            <div id="left-foot-timeline-fy" style="height:200px; width:380px;"></div>
          </div>
          <div class="column has-text-centered p-0">
            <div id="right-foot-timeline-fy" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <h1 class="title is-6 pt-6 has-text-centered">Fz</h1>
        ${
          tl.fz.inRangeleft != -1 && tl.fz.inRangeRight ?
          `
            <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
              <div class="column has-text-centered p-0">
          `+ (tl.fz.inRangeleft) * 100 + ` %`+
          `  </div>
          `+`
              <div class="column has-text-centered p-0">
          `+ (tl.fz.inRangeRight) * 100 + ` %`+
          `  </div>
            </div>
          `
          :""
        }
        <div class="columns is-vcentered is-centered p-0 p-0 pl-3 pr-3">
          <div class="column has-text-centered p-0">
            <div id="left-foot-timeline-fz" style="height:200px; width:380px;"></div>
          </div>
          <div class="column has-text-centered p-0">
            <div id="right-foot-timeline-fz" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <script>
          ${this.generateTimelineChart(tl.fx.left, tl.fx.min, tl.fx.max, 'left-foot-timeline-fx', '#d32d41', trial.fx_zone_min, trial.fx_zone_max)}
          ${this.generateTimelineChart(tl.fx.right, tl.fx.min, tl.fx.max, 'right-foot-timeline-fx', '#6ab187', trial.fx_zone_min, trial.fx_zone_max)}
          ${this.generateTimelineChart(tl.fy.left, tl.fy.min, tl.fy.max, 'left-foot-timeline-fy', '#d32d41', trial.fy_zone_min, trial.fy_zone_max)}
          ${this.generateTimelineChart(tl.fy.right, tl.fy.min, tl.fy.max, 'right-foot-timeline-fy', '#6ab187', trial.fy_zone_min, trial.fy_zone_max)}
          ${this.generateTimelineChart(tl.fz.left, tl.fz.min, tl.fz.max, 'left-foot-timeline-fz', '#d32d41', trial.fz_zone_min, trial.fz_zone_max)}
          ${this.generateTimelineChart(tl.fz.right, tl.fz.min, tl.fz.max, 'right-foot-timeline-fz','#6ab187', trial.fz_zone_min, trial.fz_zone_max)}
        </script>
      </div>
    `
  }

  static generateCOPChart(row: Array<COPChartSeries>, id: string, color: string) {
    return `
      var options = {
        series:${JSON.stringify(row.map((r) => {
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

  static generateCOPsSection(cps: COPs): string {
    return `
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
        <div class="columns is-vcentered is-centered pl-3 pr-3">
          <div class="column has-text-centered">
            <div id="left-foot-cop" style="height:200px;width:350px;"></div>
          </div>
          <div class="column has-text-centered">
            <div id="right-foot-cop" style="height:200px;width:350px;"></div>
          </div>
        </div>
        <script>
          ${this.generateCOPChart(cps.left, 'left-foot-cop', '#d32d41')}
          ${this.generateCOPChart(cps.right, 'right-foot-cop', '#6ab187')}
        </script>
      </div>
    `
  }

  static generateLineChart(row: Array<LineChartSeries>, min: number, max: number, id: string, color: string) {
    return `
      var options = {
        series:${JSON.stringify(row.map((r) => {
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

  static generateLineChartsSection(lcs: LineCharts): string {
    return `
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
            <div id="left-foot-fx" style="height:200px; width:380px;"></div>
          </div>  
          <div class="column has-text-centered p-0">
            <div id="right-foot-fx" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <h1 class="title is-6 p-0 has-text-centered">Fy</h1>
        <div class="columns is-vcentered is-centered pl-3 pr-3">
          <div class="column has-text-centered p-0">
            <div id="left-foot-fy" style="height:200px; width:380px;"></div>
          </div>
          <div class="column has-text-centered p-0">
            <div id="right-foot-fy" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <h1 class="title is-6 p-0 has-text-centered">Fz</h1>
        <div class="columns is-vcentered is-centered pl-3 pr-3">
          <div class="column has-text-centered p-0">
            <div id="left-foot-fz" style="height:200px; width:380px;"></div>
          </div>
          <div class="column has-text-centered p-0">
            <div id="right-foot-fz" style="height:200px; width:380px;"></div>
          </div>
        </div>
        <script>
          ${this.generateLineChart(lcs.fx.left, lcs.fx.min, lcs.fx.max, 'left-foot-fx', '#d32d41')}
          ${this.generateLineChart(lcs.fx.right, lcs.fx.min, lcs.fx.max, 'right-foot-fx', '#6ab187')}
          ${this.generateLineChart(lcs.fy.left, lcs.fy.min, lcs.fy.max, 'left-foot-fy', '#d32d41')}
          ${this.generateLineChart(lcs.fy.right, lcs.fy.min, lcs.fy.max, 'right-foot-fy', '#6ab187')}
          ${this.generateLineChart(lcs.fz.left, lcs.fz.min, lcs.fz.max, 'left-foot-fz', '#d32d41')}
          ${this.generateLineChart(lcs.fz.right, lcs.fz.min, lcs.fz.max, 'right-foot-fz', '#6ab187')}
        </script>
      </div>
    `;
  }

  static generateAsymmetriesTable(sd: StepDurationsPerFoot): string {
    const { step, stance } = Metrics.generateAsymmetries(sd);
    return `
      <div class="container p-1 pt-3 pl-3 pr-3" style="margin-top:25%;">
        <h1 class="title is-6 has-text-centered">Symmetries</h1>
        <table class="pl-3 pr-3">
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
          <tr>
            <td> Step Symmetry (SPS)</td>
            <td>${step.toFixed(2)}</td>
          </tr>
          <tr>
            <td> Stance Symmetry (SNS)</td>
            <td>${stance.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `;
  }
  
  static generateMeasurementsTable(metrics: PerFootMetrics): string {
    return `
      <div class="container p-1 pt-3 pl-3 pr-3" style="margin-top:25%;">
        <h1 class="title is-6 has-text-centered">Measurements</h1>
        <table class="pl-3 pr-3">
          <tr>
            <th>Parameter</th>
            <th>Left Foot Value</th>
            <th>Right Foot Value</th>
          </tr>
          <tr>
            <td> Impulse Fx</td>
            <td>${metrics.left.fx.impulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fx.impulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td> Impulse Fy</td>
            <td>${metrics.left.fy.impulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fy.impulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Vertical Impulse FZ</td>
            <td>${metrics.left.fz.impulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fz.impulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Loading Rate (FX)</td>
            <td>${metrics.left.fx.loadingRate.toFixed(3)} N/s</td>
            <td>${metrics.right.fx.loadingRate.toFixed(3)} N/s</td>
          </tr>
          <tr>
            <td>Loading Rate (FY)</td>
            <td>${metrics.left.fy.loadingRate.toFixed(3)} N/s</td>
            <td>${metrics.right.fy.loadingRate.toFixed(3)} N/s</td>
          </tr>
          <tr>
            <td>Loading Rate (FZ)</td>
            <td>${metrics.left.fz.loadingRate.toFixed(3)} N/s</td>
            <td>${metrics.right.fz.loadingRate.toFixed(3)} N/s</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FX)</td>
            <td>${metrics.left.fx.impactPeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fx.impactPeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FY)</td>
            <td>${metrics.left.fy.impactPeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fy.impactPeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Impact Peak Force (FZ)</td>
            <td>${metrics.left.fz.impactPeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fz.impactPeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FX)</td>
            <td>${metrics.left.fx.timeToImpactPeak.toFixed(3)} s</td>
            <td>${metrics.right.fx.timeToImpactPeak.toFixed(3)} s</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FY)</td>
            <td>${metrics.left.fy.timeToImpactPeak.toFixed(3)} s</td>
            <td>${metrics.right.fy.timeToImpactPeak.toFixed(3)} s</td>
          </tr>
          <tr>
            <td>Time to Impact Peak Force (FZ)</td>
            <td>${metrics.left.fz.timeToImpactPeak.toFixed(3)} s</td>
            <td>${metrics.right.fz.timeToImpactPeak.toFixed(3)} s</td>
          </tr>
          <tr>
            <td>Active Peak Force (FX)</td>
            <td>${metrics.left.fx.activePeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fx.activePeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Active Peak Force (FY)</td>
            <td>${metrics.left.fy.activePeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fy.activePeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Active Peak Force (FZ)</td>
            <td>${metrics.left.fz.activePeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fz.activePeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Time to Active Peak Force (FX)</td>
            <td>${metrics.left.fx.timeToActivePeak.toFixed(2)} s</td>
            <td>${metrics.right.fx.timeToActivePeak.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Time to Active Peak Force (FY)</td>
            <td>${metrics.left.fy.timeToActivePeak.toFixed(2)} s</td>
            <td>${metrics.right.fy.timeToActivePeak.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Time to Active Peak Force (FZ)</td>
            <td>${metrics.left.fz.timeToActivePeak.toFixed(2)} s</td>
            <td>${metrics.right.fz.timeToActivePeak.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Push Off Rate (FX)</td>
            <td>${metrics.left.fx.pushOffRate.toFixed(2)} N/s</td>
            <td>${metrics.right.fx.pushOffRate.toFixed(2)} N/s</td>
          </tr>
          <tr>
            <td>Push Off Rate (FY)</td>
            <td>${metrics.left.fy.pushOffRate.toFixed(2)} N/s</td>
            <td>${metrics.right.fy.pushOffRate.toFixed(2)} N/s</td>
          </tr>
          <tr>
            <td>Push Off Rate (FZ)</td>
            <td>${metrics.left.fz.pushOffRate.toFixed(2)} N/s</td>
            <td>${metrics.right.fz.pushOffRate.toFixed(2)} N/s</td>
          </tr>
          <tr>
            <td>Braking Impulse</td>
            <td>${metrics.left.fy.brakingImpulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fy.brakingImpulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Braking Peak Force</td>
            <td>${metrics.left.fy.brakingPeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fy.brakingPeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Time to Braking Peak</td>
            <td>${metrics.left.fy.timeToBrakingPeak.toFixed(2)} s</td>
            <td>${metrics.right.fy.timeToBrakingPeak.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Time to B-P Transition</td>
            <td>${metrics.left.fy.timeToBPTransition.toFixed(2)} s</td>
            <td>${metrics.right.fy.timeToBPTransition.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Propulsive Impulse</td>
            <td>${metrics.left.fy.propulsiveImpulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fy.propulsiveImpulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Propulsive Peak Force</td>
            <td>${metrics.left.fy.propulsivePeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fy.propulsivePeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Time to Propulsive Peak</td>
            <td>${metrics.left.fy.timeToPropulsivePeak.toFixed(2)} s</td>
            <td>${metrics.right.fy.timeToPropulsivePeak.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Lateral Strike Impulse </td>
            <td>${metrics.left.fx.lateralStrikeImpulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fx.lateralStrikeImpulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Lateral Strike Peak Force </td>
            <td>${metrics.left.fx.lateralStrikePeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fx.lateralStrikePeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Lateral Strike Push Impulse </td>
            <td>${metrics.left.fx.lateralPushImpulse.toFixed(2)} N.s</td>
            <td>${metrics.right.fx.lateralPushImpulse.toFixed(2)} N.s</td>
          </tr>
          <tr>
            <td>Lateral Strike Push Peak Force </td>
            <td>${metrics.left.fx.lateralPushPeakForce.toFixed(2)} N</td>
            <td>${metrics.right.fx.lateralPushPeakForce.toFixed(2)} N</td>
          </tr>
          <tr>
            <td>Contact Duration</td>
            <td>${metrics.left.fz.contactDuration.toFixed(2)} s</td>
            <td>${metrics.right.fz.contactDuration.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Step Duration</td>
            <td>${metrics.left.fz.stepDuration.toFixed(2)} s</td>
            <td>${metrics.right.fz.stepDuration.toFixed(2)} s</td>
          </tr>
          <tr>
            <td>Double Support Duration</td>
            <td>${metrics.left.fz.doubleSupportDuration.toFixed(2)} s</td>
            <td>${metrics.right.fz.doubleSupportDuration.toFixed(2)} s</td>
          </tr>
           <tr>
            <td>Single Support Duration</td>
            <td>${metrics.left.fz.singleSupportDuration.toFixed(2)} s</td>
            <td>${metrics.right.fz.singleSupportDuration.toFixed(2)} s</td>
          </tr>
        </table>
      </div>
    `;
  }

  static generateComments(comments: string ): string {
    return `
      <div class='container p-1 pt-3 pl-3 pr-3'>
        <h1 class='title is-6 has-text-centered'>Comments</h1>
        <p style="text-align: justify;">
          ${comments && comments != '' ? comments : 'No comments by the user.'}
        </p>
      </div>
    `;
  }

  static generateHTML(user: User, trial: Trial, session: Session, lcs: LineCharts, cps: COPs, tl: Timelines, sd: StepDurationsPerFoot, metrics: PerFootMetrics): string {
    return encodeURIComponent(`
      <!DOCTYPE html>
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
          ${this.generateHeader(user, trial, session)}
          ${this.generateLineChartsSection(lcs)}
          ${this.generateCOPsSection(cps)}
          ${this.generateTimelinesSection(tl, trial)}
          ${this.generateComments(trial.comments)}
          ${this.generateMeasurementsTable(metrics)}
          ${this.generateAsymmetriesTable(sd)}
        </body>
      </html>
    `);
  }

  static async start(user: User, trial: Trial, session: Session, records: Array<Record>, selectedSteps: Array<number>) :Promise<void> {
    try {

      // Generate the data for each category
      const lcs: LineCharts = DataProcessor.formStepsForEveryAxes(records, selectedSteps, user.weight, FREQUENCY);
      const cps: COPs = DataProcessor.formCOPs(records, selectedSteps, user.weight, FREQUENCY);
      const tl: Timelines = DataProcessor.formTimelinesForEveryAxes(records, selectedSteps, user.weight, FREQUENCY, trial);
      const sd: StepDurationsPerFoot = DataProcessor.formStepsForAsymmetry(records, user.weight,FREQUENCY, selectedSteps);
      
      const steps = DataProcessor.formStepsForMetrics(records, user.weight, FREQUENCY, selectedSteps);
      const metrics: PerFootMetrics  = Metrics.generate(steps, FREQUENCY);
      
      // Generate the html
      const html = this.generateHTML(user, trial, session, lcs, cps, tl, sd, metrics);
      const file = { content: `${decodeURIComponent(html)}` }

      // Produce the pdf from the HTML that we generated
      const options = { format: 'A4' , path: app.getPath("downloads")+"/"+trial.name+".pdf", args:['--allow-file-access-from-files'], headless: false };
      await new Promise((resolve, reject) => {
        htmlToPdf.generatePdf(file, options).then((pdfBuffer:any) => {
          resolve(pdfBuffer);
        }).catch((error:any)=> {
          reject(error);
        });
      });
    
    } catch (e: any) {
      throw new Error(e);
    }
  }
}

export { Renderer }