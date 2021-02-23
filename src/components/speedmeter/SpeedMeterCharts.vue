<template>
  <div id="app">
    <v-row>
      <v-col><h2>Foot Asymmetry</h2></v-col>
      <v-col><h2>Target Asymmetry</h2></v-col>
    </v-row>
    <v-row>
      <v-col>
        <vue-speedometer 
          textColor="#fff" 
          :value="Number($store.state.footAsymmetry.toFixed(2))" 
          needleColor="#cbf3f0" 
          :minValue="-100"
          :maxValue="100" 
          :customSegmentStops="customSegmentStops"
          :segmentColors="segmentColors"
        />
      </v-col>
      <v-col>
        <vue-speedometer 
          textColor="#fff" 
          :value="Number($store.state.stepsAsymmetry.toFixed(2))" 
          needleColor="#cbf3f0" 
          :minValue="-100"
          :maxValue="100" 
          :customSegmentStops="customSegmentStops"
          :segmentColors="segmentColors"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VueSpeedometer from "vue-speedometer"
const { ipcRenderer } = window.require('electron')

export default {
  name: "App",
  data() {
    return {
      segmentColors:["#d62828","#ffbe4d","#5fad56","#5fad56","#ffbe4d","#d62828"],
      customSegmentStops:[-100,-30,-10,0,10,30,100]
    };
  },
  components: {
    VueSpeedometer
  },
  beforeMount(){
    var self = this
    ipcRenderer.on('SESSION_RESPONSE_SPEEDMETER',(_,responseData)=>{
      if(responseData.isSessionRunning){
        self.setupStoreVariables(responseData)
      }
    })
  },
  methods:{
    setupStoreVariables(responseData){
      this.$store.commit('setForce',responseData.force)
      this.$store.commit('setSeriesLeftPlate',responseData.rows)
      this.$store.commit('setSeriesRightPlate',responseData.rows)
      this.$store.commit('setStepsPerMinuteTarget',Number(responseData.stepsPerMinuteTarget))
      this.$store.commit('setStepsTimeInterval',Number(responseData.stepsTimeInterval))
      this.$store.commit('setFrequency',Number(responseData.frequency))
      this.$store.commit('setThreshold',Number(responseData.threshold))
      this.$store.commit('setNofLines',Number(responseData.nOfLines))
      this.$store.commit('checkIfBothFeetsArePressed')
      this.$store.commit('checkTimeInterval')
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  margin-top: 60px;
}
.current-value{
  display:none
}
</style>
