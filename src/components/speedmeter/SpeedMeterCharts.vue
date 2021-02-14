<template>
  <div id="app">
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
  created() {
    setInterval(() => (this.toggle = !this.toggle), 1111);
  },
  data() {
    return {
      toggle: false,
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
      this.$store.commit('setSeries',responseData.rows)
      this.$store.commit('setMaxFootLeftPlate',responseData.rows)
      this.$store.commit('setMaxFootRightPlate',responseData.rows)
      this.$store.commit('setStepsPerMinuteTarget',Number(responseData.stepsPerMinuteTarget))
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
  color: #2c3e50;
  margin-top: 60px;
}
.current-value{
  display:none
}
</style>
