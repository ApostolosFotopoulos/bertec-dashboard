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
          :series="$store.state.lineChart.leftPlateFinalSeries"
        />
      </v-col>
      <v-col cols="6">
        <VueApexCharts
          ref="rightPlateChart"
          class="text-center"
          :height="height"
          type="line"
          :options="rightFootChart"
          :series="$store.state.lineChart.rightPlateFinalSeries"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
const { ipcRenderer } = window.require("electron");
const defaultLineChartOptions = require("../../../assets/options/lineChart.json");

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
      height: 0.75 * window.innerHeight,
      leftFootChart: {
        ...defaultLineChartOptions,
        yaxis: {
          min: (min) => {
            if (this.$store.state.lineChart.leftPlateChannel.includes("COP")) {
              return min;
            } else {
              return 0;
            }
          },
          tickAmount:
            this.$store.state.lineChart.yAxisMaxValue /
            (this.$store.state.lineChart.dataType === "Normalized" ? 10 : 100),
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
        colors: [
          ({ value, seriesIndex, w }) => {
            if (
              seriesIndex ==
              this.$store.state.lineChart.leftPlateFinalSeries.length - 2
            ) {
              return "#d32d41";
            } else {
              return "gray";
            }
          },
        ],
      },
      rightFootChart: {
        ...defaultLineChartOptions,
        yaxis: {
          min: (min) => {
            if (this.$store.state.lineChart.rightPlateChannel.includes("COP")) {
              return min;
            } else {
              return 0;
            }
          },
          tickAmount:
            this.$store.state.lineChart.yAxisMaxValue /
              (this.$store.state.lineChart.dataType === "Normalized"
                ? 10
                : 100) -
            1,
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
          dataLabels: {
            show: false,
            enabled: false,
          },
          labels: {
            style: {
              colors: ["#fff"],
            },
            show: true,
            formatter: (val) => {
              if (val.toFixed(0) % 10 == 0) {
                return val.toFixed(0);
              }
            },
          },
        },
        colors: [
          ({ value, seriesIndex, w }) => {
            if (
              seriesIndex ==
              this.$store.state.lineChart.rightPlateFinalSeries.length - 2
            ) {
              return "#6ab187";
            } else {
              return "gray";
            }
          },
        ],
      },
    };
  },
  mounted() {
    var _this = this;
    ipcRenderer.on("SESSION_RESPONSE_LINECHART", (_, responseData) => {
      if (responseData.isSessionRunning) {
        _this.updateVariables(responseData);
      } else {
        _this.$store.commit("resetLineChartState");
      }
    });
  },
  methods: {
    resizeHandler(e) {
      this.height = 0.75 * window.innerHeight;
    },
    updateVariables(responseData) {
      this.$store.commit("setWeight", responseData.weight);
      this.$store.commit("setLeftPlateAtLineChart", responseData.rows);
      this.$store.commit("setRightPlateAtLineChart", responseData.rows);
      if (this.$store.state.lineChart.shouldUpdateLeft) {
        this.updateLeftChart();
        this.$store.commit("setShouldUpdateLeftAtLineChart", false);
      }
      if (this.$store.state.lineChart.shouldUpdateRight) {
        this.updateRightChart();
        this.$store.commit("setShouldUpdateRightAtLineChart", false);
      }
    },
    updateLeftChart() {
      if (Number(this.$store.state.lineChart.yAxisMaxValue) != -1) {
        this.$refs.leftPlateChart.updateOptions({
          ...defaultLineChartOptions,
          yaxis: {
            tickAmount:
              this.$store.state.lineChart.yAxisMaxValue /
              (this.$store.state.lineChart.dataType === "Normalized"
                ? 10
                : 100),
            min: (min) => {
              if (
                this.$store.state.lineChart.leftPlateChannel.includes("COP")
              ) {
                return min;
              } else {
                return 0;
              }
            },
            max: Number(this.$store.state.lineChart.yAxisMaxValue),
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
          colors: [
            ({ value, seriesIndex, w }) => {
              if (
                seriesIndex ==
                this.$store.state.lineChart.leftPlateFinalSeries.length - 2
              ) {
                return "#d32d41";
              } else {
                return "gray";
              }
            },
          ],
        });
      } else {
        this.$refs.leftPlateChart.updateOptions({
          ...defaultLineChartOptions,
          yaxis: {
            tickAmount:
              this.$store.state.lineChart.yAxisMaxValue /
              (this.$store.state.lineChart.dataType === "Normalized"
                ? 10
                : 100),
            min: (min) => {
              if (
                this.$store.state.lineChart.leftPlateChannel.includes("COP")
              ) {
                return min;
              } else {
                return 0;
              }
            },
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
          colors: [
            ({ value, seriesIndex, w }) => {
              if (
                seriesIndex ==
                this.$store.state.lineChart.leftPlateFinalSeries.length - 2
              ) {
                return "#d32d41";
              } else {
                return "gray";
              }
            },
          ],
        });
      }
    },
    updateRightChart() {
      if (Number(this.$store.state.lineChart.yAxisMaxValue) != -1) {
        this.$refs.rightPlateChart.updateOptions({
          ...defaultLineChartOptions,
          yaxis: {
            tickAmount:
              this.$store.state.lineChart.yAxisMaxValue /
              (this.$store.state.lineChart.dataType === "Normalized"
                ? 10
                : 100),
            min: (min) => {
              if (
                this.$store.state.lineChart.rightPlateChannel.includes("COP")
              ) {
                return min;
              } else {
                return 0;
              }
            },
            max: Number(this.$store.state.lineChart.yAxisMaxValue),
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
          colors: [
            ({ value, seriesIndex, w }) => {
              if (
                seriesIndex ==
                this.$store.state.lineChart.rightPlateFinalSeries.length - 2
              ) {
                return "#6ab187";
              } else {
                return "gray";
              }
            },
          ],
        });
      } else {
        this.$refs.rightPlateChart.updateOptions({
          ...defaultLineChartOptions,
          yaxis: {
            tickAmount:
              this.$store.state.lineChart.yAxisMaxValue /
              (this.$store.state.lineChart.dataType === "Normalized"
                ? 10
                : 100),
            min: (min) => {
              if (
                this.$store.state.lineChart.rightPlateChannel.includes("COP")
              ) {
                return min;
              } else {
                return 0;
              }
            },
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
          colors: [
            ({ value, seriesIndex, w }) => {
              if (
                seriesIndex ==
                this.$store.state.lineChart.rightPlateFinalSeries.length - 2
              ) {
                return "#6ab187";
              } else {
                return "gray";
              }
            },
          ],
        });
      }
    },
  },
};
</script>

<style scoped>
.card-style {
  height: 100%;
}
</style>