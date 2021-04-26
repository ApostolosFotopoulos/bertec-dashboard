<template>
  <v-container>
    <v-row class="mt-0 mb-5">
      <v-col>
        <h3>Asymmetries</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <SpeedMetersCharts />
    <Statistics />
    <v-container>
      <v-row>
        <v-col>
          <History />
        </v-col>
        <v-col cols="2">
          <v-text-field
            @input="(v) => $store.commit('setMaxHistory', Number(v))"
            :value="$store.state.speedmeter.maxHistory"
            label="History Instances"
            outlined
          />
        </v-col>
        <v-col cols="2">
          <v-text-field
            @input="
              (v) =>
                $store.commit('setStepsPerMinuteTargetAtSpeedmeter', Number(v))
            "
            :value="$store.state.speedmeter.stepsPerMinuteTarget"
            label="Steps/Minute"
            outlined
            min="0"
          />
          <v-text-field
            class="mt-10"
            @change="(v) => $store.commit('setTime', Number(v))"
            :value="$store.state.options.timeout"
            label="Time (sec)"
            outlined
            :disabled="$store.state.options.isSessionRunning"
          />
        </v-col>
        <v-col cols="2">
          <v-btn
            @click="$store.commit('resetSpeedmeterState')"
            class="resetButton v-input__control"
            >Reset</v-btn
          >
          <v-btn
            elevation="25"
            :class="
              $store.state.options.isSessionRunning
                ? 'stopButton v-input__control mt-15'
                : 'startButton v-input__control mt-15'
            "
            @click="() => startStopSession()"
          >
            {{ $store.state.options.isSessionRunning ? "Stop" : "Start" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import SpeedMetersCharts from "../components/speedmeter/SpeedMetersCharts.vue";
import Statistics from "../components/speedmeter/Statistics.vue";
import History from "../components/speedmeter/History.vue";

export default {
  components: {
    SpeedMetersCharts,
    Statistics,
    History,
  },
  mounted() {
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_SPEEDMETER') },1)
  },
};
</script>

<style scoped>
.resetButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.startButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.stopButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #d32d41 !important;
}
</style>