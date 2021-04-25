<template>
  <v-card elevation="10" color="#25282F" class="mt-5">
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
const defaultOptions = require("../../../assets/options/timeline.json");

export default {
  components: {
    VueApexCharts,
  },
  created() {
    window.addEventListener("resize", this.resizeHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      height: 0.78 * window.innerHeight,
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
    ipcRenderer.on("SESSION_RESPONSE_TIMELINE", (_, responseData) => {
      if (responseData.isSessionRunning) {
        _this.updateVariables(responseData);
      } else {
        //_this.$store.commit('resetLineChartState')
      }
    });
  },
  methods: {
    resizeHandler(e) {
      this.height = 0.8 * window.innerHeight;
    },
    updateVariables(responseData) {
      this.$store.commit("setWeight", responseData.weight);
      this.$store.commit("setLeftPlateAtTimeline", responseData.rows);
      //console.log(this.$store.state.timeline.leftPlateSeries)
      this.$store.commit("setRightPlateAtTimeline", responseData.rows);
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