<template>
  <v-card elevation="10" color="#25282F">
    <v-row class="mt-2">
      <v-col>
        <div class="pa-3">
          <DismissibleMessages/>
          <VueApexCharts height="700" ref="chart" class="text-center" type="bar" :options="chartOptions" :series="$store.state.series"/>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
const { ipcRenderer } = window.require('electron')
const defaultChartOptions = require("../../assets/chartOptions.json")
import DismissibleMessages from './DismissibleMessages.vue'

export default {
  data(){
    return{
      chartOptions: defaultChartOptions,
    }
  },
  components: {
    VueApexCharts: VueApexCharts,
    DismissibleMessages,
  },
  beforeMount(){
    var self = this
    ipcRenderer.on('SESSION_RESPONSE_BARPLOT',(_,responseData)=>{
      if(responseData.isSessionRunning){
        self.setupStoreVariables(responseData)
        self.setStoreAxesMax(self.$store.state.series)
        self.setAnnotationsY(self.$store.state.series)
        self.updateChartOptions()        
      } else {
        self.$store.commit("resetState")
        this.resetAxes()
      }
    })
  },
  methods:{
    resetAxes(){
      this.$store.commit('setAxesMax',100)
      this.$refs.chart.updateOptions({
        yaxis: {
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
          max:100,
        },
        annotations:{
          points: []
        }
      })
    },
    setupStoreVariables(responseData){
      this.$store.commit('setForce',responseData.force)
      this.$store.commit('setnOfSteps',responseData.nOfSteps)
      this.$store.commit('setPrevLeftForcePlateAnnotationY',this.$store.state.series[0].data[0].y)
      this.$store.commit('setPrevRightForcePlateAnnotationY',this.$store.state.series[0].data[1].y)
      this.$store.commit('setSeries',responseData.rows)
    },
    setStoreAxesMax(series){
      let firstSeriesData = series[0].data[0].y
      let secSeriesData  = series[0].data[1].y
    
      if(Number(firstSeriesData) > Number(this.$store.state.axesMax)){
        this.$store.commit('setAxesMax',Math.ceil(firstSeriesData / 50)*50)
      }
      if(Number(secSeriesData) > Number(this.$store.state.axesMax)){
        this.$store.commit('setAxesMax',Math.ceil(secSeriesData / 50)*50)
      }
    },
    setAnnotationsY(series){
      let firstSeriesData = series[0].data[0].y
      let secSeriesData  = series[0].data[1].y

      if(Number(firstSeriesData) > Number(this.$store.state.leftForcePlateAnnotationY)){
        this.$store.commit('setLeftForcePlateAnnotationY',firstSeriesData)
      }
      if(Number(secSeriesData) > Number(this.$store.state.rightForcePlateAnnotationY)){
        this.$store.commit('setRightForcePlateAnnotationY',secSeriesData)
      }
    },
    updateChartOptions(){
      this.$refs.chart.updateOptions({
        dataLabels:{
          formatter: function (val) {
              return val.toFixed(2)
          },
        },
        yaxis: {
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
          max: this.$store.state.axesMax
        },
        annotations: {
          points: 
          [
            {
              x:'Left Foot',
              y: this.$store.state.leftForcePlateAnnotationY,
              marker: {
                size: 6,
              },
            }, 
            {
              x:'Right Foot',
              y: this.$store.state.rightForcePlateAnnotationY,
              marker: {
                size: 6,
              },
            },
            {
              x:'Left Foot',
              y: this.$store.state.prevLeftForcePlateAnnotationY,
              marker: {
                size: 6,
                fillColor: '#d32d41',
                strokeColor: '#d32d41',
              },
            },
            {
              x:'Right Foot',
              y: this.$store.state.prevRightForcePlateAnnotationY,
              marker: {
                size: 6,
                fillColor: '#6ab187',
                strokeColor: '#6ab187',
              },
            }
          ]
        }
      })
    },
  }
}
</script>

<style scoped>

</style>