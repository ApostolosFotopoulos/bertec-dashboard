<template>
  <v-card elevation="10" color="#25282F" class="mt-5">
    <AccuracyCard />
    <v-row>
      <v-col cols="6">
        <VueApexCharts
          ref="leftPlateChart"
          class="text-center"
          :height="height"
          type="line"
          :options="leftFootChart"
          :series="$store.state.timeline.leftPlateSeries"
        />
      </v-col>
      <v-col cols="6">
        <VueApexCharts
          ref="rightPlateChart"
          class="text-center"
          :height="height"
          type="line"
          :options="rightFootChart"
          :series="$store.state.timeline.rightPlateSeries"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import VueApexCharts from "vue-apexcharts";
import AccuracyCard from "./AccuracyCard.vue";
const { TIMELINE_SESSION, UPDATE_TRIAL, UPDATE_TRIAL_ZONES_AND_THRESHOLD } = require("../../../../main/util/types");
const defaultOptions = require("../../../../assets/options/timeline.json");

export default {
  components: {
    VueApexCharts,
    AccuracyCard,
  },
  created() {
    window.addEventListener("resize", this.resizeHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      height: 0.65 * window.innerHeight,
      leftFootChart: {
        ...defaultOptions,
        yaxis: {
          min: 0,
          tickAmount:
            this.$store.state.timeline.yAxisMaxValue /
            (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
          dataLabels: {
            show: false,
            enabled: false,
          },
          labels: {
            style: {
              colors: ["#fff"],
            },
            formatter: (val) => {
              return val.toFixed(0);
            },
          },
        },
        xaxis: {
          min: 0,
          max: this.$store.state.timeline.nOfPoints,
          dataLabels: {
            show: false,
            enabled: false,
          },
          labels: {
            style: {
              colors: ["#fff"],
            },
            formatter: (val) => {
              if (val.toFixed(0) % 10 == 0) {
                return val.toFixed(0);
              }
            },
            show: true,
          },
        },
        colors: ["#d32d41"],
        markers: {
          size: 6,
        },
        annotations: {
          yaxis: [
            {
              y: this.$store.state.timeline.rangeMin,
              y2: this.$store.state.timeline.rangeMax,
              borderColor: "#000",
              fillColor: "#FEB019",
            },
          ],
        },
      },
      rightFootChart: {
        ...defaultOptions,
        yaxis: {
          min: 0,
          tickAmount:
            this.$store.state.timeline.yAxisMaxValue /
            (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
          dataLabels: {
            show: false,
            enabled: false,
          },
          labels: {
            style: {
              colors: ["#fff"],
            },
            formatter: (val) => {
              return val.toFixed(0);
            },
          },
        },
        xaxis: {
          min: 0,
          max: this.$store.state.timeline.nOfPoints,
          dataLabels: {
            show: false,
            enabled: false,
          },
          labels: {
            style: {
              colors: ["#fff"],
            },
            formatter: (val) => {
              if (val.toFixed(0) % 10 == 0) {
                return val.toFixed(0);
              }
            },
            show: true,
          },
        },
        colors: ["#6ab187"],
        markers: {
          size: 6,
        },
        annotations: {
          yaxis: [
            {
              y: this.$store.state.timeline.rangeMin,
              y2: this.$store.state.timeline.rangeMax,
              borderColor: "#000",
              fillColor: "#FEB019",
            },
          ],
        },
      },
    };
  },
  mounted() {
    var _this = this;
    ipcRenderer.on(TIMELINE_SESSION, (_, responseData) => {
      if (responseData.isSessionRunning) {
        _this.updateVariables(responseData);
      } else {
        _this.$store.commit('resetTimelineState')
      }
    });
  },
  methods: {
    resizeHandler(e) {
      this.height = 0.65 * window.innerHeight;
    },
    updateVariables(responseData) {
      this.$store.commit("setWeight", responseData.weight);
      this.$store.commit("setLeftPlateAtTimeline", responseData.rows);
      this.$store.commit("setRightPlateAtTimeline", responseData.rows);
      this.$store.commit("setSession", responseData.session);
      this.$store.commit("setDatabase", responseData.database);
      this.$store.commit("setUser", responseData.user);

      if(this.$store.state.options.trial != ""){
        // ipcRenderer.send(UPDATE_TRIAL,{ 
        //   database: responseData.database , 
        //   trial: this.$store.state.options.trial,
        //   data: responseData.rows,
        // })
        ipcRenderer.send(UPDATE_TRIAL_ZONES_AND_THRESHOLD, {
          database: responseData.database , 
          trialId: this.$store.state.options.trialId,
          fx_zone_min: (this.$store.state.timeline.leftPlateChannel == 'FX1' && this.$store.state.timeline.rightPlateChannel == 'FX2')? this.$store.state.timeline.rangeMin: null,
          fx_zone_max: (this.$store.state.timeline.leftPlateChannel == 'FX1' && this.$store.state.timeline.rightPlateChannel == 'FX2')? this.$store.state.timeline.rangeMax: null,
          fx_threshold: (this.$store.state.timeline.leftPlateChannel == 'FX1' && this.$store.state.timeline.rightPlateChannel == 'FX2')? this.$store.state.timeline.trialThreshold: null,
          fy_zone_min: (this.$store.state.timeline.leftPlateChannel == 'FY1' && this.$store.state.timeline.rightPlateChannel == 'FY2')? this.$store.state.timeline.rangeMin: null,
          fy_zone_max: (this.$store.state.timeline.leftPlateChannel == 'FY1' && this.$store.state.timeline.rightPlateChannel == 'FY2')? this.$store.state.timeline.rangeMax: null,
          fy_threshold: (this.$store.state.timeline.leftPlateChannel == 'FY1' && this.$store.state.timeline.rightPlateChannel == 'FY2')? this.$store.state.timeline.trialThreshold: null,
          fz_zone_min: (this.$store.state.timeline.leftPlateChannel == 'FZ1' && this.$store.state.timeline.rightPlateChannel == 'FZ2')? this.$store.state.timeline.rangeMin: null,
          fz_zone_max: (this.$store.state.timeline.leftPlateChannel == 'FZ1' && this.$store.state.timeline.rightPlateChannel == 'FZ2')? this.$store.state.timeline.rangeMax: null,
          fz_threshold: (this.$store.state.timeline.leftPlateChannel == 'FZ1' && this.$store.state.timeline.rightPlateChannel == 'FZ2')? this.$store.state.timeline.trialThreshold: null
        })
      }

      if (this.$store.state.timeline.shouldUpdateLeft) {
        this.updateLeftChart();
        this.$store.commit("setShouldUpdateLeftAtTimeline", false);
      }
      if (this.$store.state.timeline.shouldUpdateRight) {
        this.updateRightChart();
        this.$store.commit("setShouldUpdateRightAtTimeline", false);
      }
    },
    updateLeftChart() {
      if (this.$store.state.timeline.yAxisMaxValue != -1) {
        this.$refs.leftPlateChart.updateOptions({
          ...defaultOptions,
          yaxis: {
            min: 0,
            max: this.$store.state.timeline.yAxisMaxValue,
            tickAmount:
              this.$store.state.timeline.yAxisMaxValue /
              (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                return val.toFixed(0);
              },
            },
          },
          xaxis: {
            min: 0,
            max: this.$store.state.timeline.nOfPoints,
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                if (val.toFixed(0) % 10 == 0) {
                  return val.toFixed(0);
                }
              },
              show: true,
            },
          },
          colors: ["#d32d41"],
          markers: {
            size: 6,
          },
          annotations: {
            yaxis: [
              {
                y: this.$store.state.timeline.rangeMin,
                y2: this.$store.state.timeline.rangeMax,
                borderColor: "#000",
                fillColor: "#FEB019",
              },
            ],
          },
        });
      } else {
        this.$refs.leftPlateChart.updateOptions({
          ...defaultOptions,
          yaxis: {
            min: 0,
            tickAmount:
              this.$store.state.timeline.yAxisMaxValue /
              (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                return val.toFixed(0);
              },
            }, 
          },
          xaxis: {
            min: 0,
            max: this.$store.state.timeline.nOfPoints,
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                if (val.toFixed(0) % 10 == 0) {
                  return val.toFixed(0);
                }
              },
              show: true,
            },
          },
          colors: ["#d32d41"],
          markers: {
            size: 6,
          },
          annotations: {
            yaxis: [
              {
                y: this.$store.state.timeline.rangeMin,
                y2: this.$store.state.timeline.rangeMax,
                borderColor: "#000",
                fillColor: "#FEB019",
              },
            ],
          },
        });
      }
    },
    updateRightChart() {
      if (this.$store.state.timeline.yAxisMaxValue != -1) {
        this.$refs.rightPlateChart.updateOptions({
          ...defaultOptions,
          yaxis: {
            min: 0,
            max: this.$store.state.timeline.yAxisMaxValue,
            tickAmount:
              this.$store.state.timeline.yAxisMaxValue /
              (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                return val.toFixed(0);
              },
            },
          },
          xaxis: {
            min: 0,
            max: this.$store.state.timeline.nOfPoints,
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                if (val.toFixed(0) % 10 == 0) {
                  return val.toFixed(0);
                }
              },
              show: true,
            },
          },
          colors: ["#6ab187"],
          markers: {
            size: 6,
          },
          annotations: {
            yaxis: [
              {
                y: this.$store.state.timeline.rangeMin,
                y2: this.$store.state.timeline.rangeMax,
                borderColor: "#000",
                fillColor: "#FEB019",
              },
            ],
          },
        });
      } else {
        this.$refs.rightPlateChart.updateOptions({
          ...defaultOptions,
          yaxis: {
            min: 0,
            max: this.$store.state.timeline.yAxisMaxValue,
            tickAmount:
              this.$store.state.timeline.yAxisMaxValue /
              (this.$store.state.timeline.dataType === "Normalized" ? 10 : 100),
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                return val.toFixed(0);
              },
            },
          },
          xaxis: {
            min: 0,
            max: this.$store.state.timeline.yAxisMaxValue,
            dataLabels: {
              show: false,
              enabled: false,
            },
            labels: {
              style: {
                colors: ["#fff"],
              },
              formatter: (val) => {
                if (val.toFixed(0) % 10 == 0) {
                  return val.toFixed(0);
                }
              },
              show: true,
            },
          },
          colors: ["#6ab187"],
          markers: {
            size: 6,
          },
          annotations: {
            yaxis: [
              {
                y: this.$store.state.timeline.rangeMin,
                y2: this.$store.state.timeline.rangeMax,
                borderColor: "#000",
                fillColor: "#FEB019",
              },
            ],
          },
        });
      }
    },
  },
};
</script>