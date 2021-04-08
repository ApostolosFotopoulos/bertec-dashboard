<template>
  <v-container>
    <v-row class="mt-0 mb-5">
      <v-col>
        <h3>Asymmetries</h3>
        <hr class="hr">
      </v-col>
    </v-row>
    <SpeedMetersCharts/>
    <Statistics/>
    <v-container>
      <v-row>
        <v-col cols="3" offset="4">
          <v-text-field
            @change="(v)=>$store.commit('setMaxHistory',Number(v))"
            :value="$store.state.speedmeter.maxHistory"
            label="History Instances"
            outlined
            min="0"
            max="10"
          />
        </v-col>
        <v-col cols="3">
          <v-text-field
            @change="(v)=>$store.commit('setStepsPerMinuteTargetAtSpeedmeter',Number(v))"
            :value="$store.state.speedmeter.stepsPerMinuteTarget"
            label="Steps/Minute"
            outlined
            min="0"
          />
        </v-col>
        <v-col cols="2" align="right">
          <v-btn @click="$store.commit('resetSpeedmeterState')" class="resetButton  v-input__control">Reset</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-row class="mt-0">
      <v-col>
        <h3>Force History</h3>
        <hr class="hr">
      </v-col>
    </v-row>
    <History/>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import SpeedMetersCharts from '../components/speedmeter/SpeedMetersCharts.vue'
import Statistics from '../components/speedmeter/Statistics.vue'
import History from '../components/speedmeter/History.vue'

export default {
  components:{
    SpeedMetersCharts,
    Statistics,
    History
  },
  mounted(){
    setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_SPEEDMETER') },1)
  }
}
</script>

<style scoped>
.resetButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
</style>