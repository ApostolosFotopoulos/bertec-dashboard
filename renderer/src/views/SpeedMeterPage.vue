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
            :disabled="isTrialRunning"
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
            :disabled="this.$store.state.options.session == -1"
            :class="
              isTrialRunning
                ? 'stopButton v-input__control mt-15'
                : 'startButton v-input__control mt-15'
            "
            @click="() => startStopTrial()"
          >
            {{ isTrialRunning ? "Stop" : "Start" }}
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
import moment from 'moment';
const { CREATE_TRIAL, CREATE_TRIAL_RESPONSE} = require("../../../main/util/types");

export default {
  components: {
    SpeedMetersCharts,
    Statistics,
    History,
  },
  data(){
    return{
      isTrialRunning:false,
      timeoutInstance: null,
    }
  },
  mounted(){
    ipcRenderer.on(CREATE_TRIAL_RESPONSE,(_,responseData)=>{
        this.isTrialRunning = true
        console.log(responseData.trial)
        this.$store.commit("setTrial",responseData.trial)
        this.timeoutInstance = setTimeout(()=>{
          this.isTrialRunning = false
          this.$store.commit("setTrial","")
        },this.$store.state.options.timeout*1000)
    })
  },
  methods:{
    startStopTrial(){
      if(this.isTrialRunning){
        clearTimeout(this.timeoutInstance);
        this.isTrialRunning = false;
        this.$store.commit("setTrial","")
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
  }
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