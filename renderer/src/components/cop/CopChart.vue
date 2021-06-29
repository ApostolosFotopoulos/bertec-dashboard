<template>
  <v-card elevation="10" color="#25282F">
    <v-row>
      <v-col cols="5">
        <VueApexCharts
          :height="height"
          class="text-center"
          type="scatter"
          ref="leftPlateChart"
          :options="leftFootChart"
          :series="$store.state.copChart.leftPlateFinalSeries"
        />
      </v-col>
      <v-col cols="2" class="mt-5">
        <v-btn
          @click="$store.commit('resetCOPChartState')"
          class="resetButton v-input__control mt-3"
          >Reset</v-btn
        >
        <v-text-field
          class="mt-4"
          @change="(v) => $store.commit('setNofGroupPoints', Number(v))"
          :value="$store.state.copChart.nOfGroupPoints"
          label="Display Trials"
          outlined
          min="1"
        />
        <v-text-field
          class="mt-15"
          @change="(v) => $store.commit('setTime', Number(v))"
          :value="$store.state.options.timeout"
          label="Time (sec)"
          :disabled="$store.state.options.isSessionRunning"
          min="0"
          outlined
        />
        <v-btn
          elevation="25"
          :disabled="this.$store.state.options.session == -1"
          :class="
            isTrialRunning
              ? 'stopButton v-input__control mt-1'
              : 'startButton v-input__control mt-1'
          "
          @click="() => startStopTrial()"
        >
          {{ isTrialRunning ? "Stop" : "Start" }}
        </v-btn>
      </v-col>
      <v-col cols="5">
        <VueApexCharts
          :height="height"
          ref="rightPlateChart"
          class="text-center"
          type="scatter"
          :options="rightFootChart"
          :series="$store.state.copChart.rightPlateFinalSeries"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const defaultOptions = require("../../../../assets/options/copChart.json");
const { COP_SESSION, CREATE_TRIAL, UPDATE_TRIAL, CREATE_TRIAL_RESPONSE,START_TRIAL_WRITING, STOP_TRIAL_WRITING } = require("../../../../main/util/types");

import VueApexCharts from "vue-apexcharts";
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
      isTrialRunning: false,
      timeoutInstance: null,
      height: 0.75 * window.innerHeight,
      leftFootChart: {
        ...defaultOptions,
        yaxis: {
          min: -300,
          max: 300,
          tickAmount: 6,
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
          min: -200,
          max: 200,
          tickAmount: 32,
          tickPlacement: "between",
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
              this.$store.state.copChart.leftPlateFinalSeries.length - 2
            ) {
              return "#d32d41";
            } else {
              return "gray";
            }
          },
        ],
        markers: {
          size: 4,
        },
        annotations: {
          yaxis: [
            {
              y: 300,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
            {
              y: -300,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
          ],
          xaxis: [
            {
              x: -200,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
            {
              x: 200,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
          ],
        },
      },
      rightFootChart: {
        ...defaultOptions,
        yaxis: {
          min: -300,
          max: 300,
          tickAmount: 6,
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
          min: -200,
          max: 200,
          tickAmount: 32,
          tickPlacement: "between",
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
              this.$store.state.copChart.rightPlateFinalSeries.length - 2
            ) {
              return "#6ab187";
            } else {
              return "gray";
            }
          },
        ],
        markers: {
          size: 4,
        },
        annotations: {
          yaxis: [
            {
              y: 300,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
            {
              y: -300,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
          ],
          xaxis: [
            {
              x: -200,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
            {
              x: 200,
              borderWidth: 5,
              strokeDashArray: 0,
              borderColor: "rgb(224, 224, 224)",
            },
          ],
        },
      },
    };
  },
  mounted() {
    var _this = this;
    ipcRenderer.on(COP_SESSION, (_, responseData) => {
      if (responseData.isSessionRunning) {
        _this.updateVariables(responseData);
      } else {
        _this.$store.commit("resetCOPChartState");
      }
    });
    ipcRenderer.on(CREATE_TRIAL_RESPONSE, (_, responseData) => {
      this.isTrialRunning = true;
      this.$store.commit("setTrial", responseData.trial);
      console.log(responseData.trial)
      this.$store.commit("setTrial",responseData.trial)
      ipcRenderer.send(START_TRIAL_WRITING,{ trial: responseData.trial })
      this.timeoutInstance = setTimeout(() => {
        this.isTrialRunning = false;
        this.$store.commit("setTrial", "");
        ipcRenderer.send(STOP_TRIAL_WRITING,{})
      }, this.$store.state.options.timeout * 1000);
    });
  },
  methods: {
    resizeHandler(e) {
      this.height = 0.75 * window.innerHeight;
    },
    updateVariables(responseData) {
  
      this.$store.commit("setWeight", responseData.weight);
      this.$store.commit("setLeftPlateAtCOP", responseData.rows);
      this.$store.commit("setRightPlateAtCOP", responseData.rows);
      this.$store.commit("setSession", responseData.session);
      this.$store.commit("setDatabase", responseData.database);
      this.$store.commit("setUser", responseData.user);

      if(this.$store.state.options.trial != ""){
        ipcRenderer.send(UPDATE_TRIAL,{ database: responseData.database , trial: this.$store.state.options.trial, data: responseData.rows })
      }
    },
    startStopTrial(){
      if(this.isTrialRunning){
        clearTimeout(this.timeoutInstance);
        this.isTrialRunning = false;
        this.$store.commit("setTrial","")
        ipcRenderer.send(STOP_TRIAL_WRITING,{})
      } else {
        console.log(this.$store.state.options.session)
        if(this.$store.state.options.session != -1){
          ipcRenderer.send(CREATE_TRIAL,{ 
            session: this.$store.state.options.session,
            database: this.$store.state.options.database, 
            userId: this.$store.state.options.user.id,
          })
        }
      }
    },
  },
};
</script>

<style scoped>
.resetButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.startButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.stopButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
</style>

<style>
.v-text-field__details {
  display: none !important;
}
</style>