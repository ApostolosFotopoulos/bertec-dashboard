<template>
  <v-card elevation="10" color="#25282F">
    <v-row class="mt-2">
      <v-col cols="8">
        <div class="pa-3">
          <DismissibleMessages/>
          <VueApexCharts  ref="chart" class="text-center" type="bar" :options="chartOptions" :series="$store.state.series"/>
        </div>
      </v-col>
      <v-col cols="4">
        <div class="pa-3">
          <VueApexCharts ref="chartLeftPlate" class="text-center" type="line" :options="lineChartOptions" :series="$store.state.seriesLeftPlate"/>
        </div>
        <div class="pa-3">
          <VueApexCharts ref="chartRightPlate" class="text-center" type="line" :options="lineChartOptions" :series="$store.state.seriesRightPlate"/>
        </div>
      </v-col>
    </v-row>
    <v-row class="mt-2 pa-3">
      <v-col cols="8">
        <v-select
          @change="(v)=>{
            $store.commit('setDataType',v) 
            this.resetAxes()
          }"
          :value="this.$store.state.selectedDataType"
          :items="dataType"
          label="Data Type"
          solo
        ></v-select>
      </v-col>
      <v-col cols="4">
        <v-btn class="resetButton v-input__control" @click="resetAxes">Reset</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>


<script>
import VueApexCharts from 'vue-apexcharts'
const { ipcRenderer } = window.require('electron')
const defaultChartOptions = require("../../assets/chartOptions.json")
const defaultLineChartOptions = require("../../assets/lineChartOptions.json")
import DismissibleMessages from './DismissibleMessages.vue'
export default {
  data(){
    return{
      chartOptions: defaultChartOptions,
      lineChartOptions: defaultLineChartOptions,
      dataType:["Absolute","Normalized"],
    }
  },
  components: {
    VueApexCharts: VueApexCharts,
    DismissibleMessages,
  },
  beforeMount(){
    var self = this
    setInterval(()=>{ ipcRenderer.send('IS_SESSION_RUNNING',{ dataType: this.$store.state.selectedDataType }) },0.0001)
    ipcRenderer.on('SESSION_RESPONSE',(_,responseData)=>{
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
        annotations:{}
      })
      this.$refs.lineChartLeft.updateOptions({
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

      })
      this.$refs.lineChartRight.updateOptions({
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
        }
      })
    },
    setupStoreVariables(responseData){
      this.$store.commit('setForce',responseData.force)
      this.$store.commit('setnOfSteps',responseData.nOfSteps)
      this.$store.commit('setPrevLeftForcePlateAnnotationY',this.$store.state.series[0].data[0].y)
      this.$store.commit('setPrevRightForcePlateAnnotationY',this.$store.state.series[0].data[1].y)
      this.$store.commit('setSeries',responseData.rows)
      this.$store.commit('setSeriesRightPlate',responseData.rows)
      this.$store.commit('setSeriesLeftPlate',responseData.rows)
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
      this.updateLeftChart()
      this.updateRightChart()
    },
    updateLeftChart(){
      this.$refs.chartLeftPlate.updateOptions({
        yaxis: {
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
        },
        xaxis:{
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            show:false,
          }
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesLeftPlate.length - 1)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }]
      })
    },
    updateRightChart(){
      this.$refs.chartRightPlate.updateOptions({
        yaxis: {
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              return val.toFixed(0)
            }
          },
        },
        xaxis:{
          labels:{
            show:false,
          }
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.seriesRightPlate.length - 1)){
            return "#6ab187"
          } else {
            return "gray"
          }
        }]
      })
    }
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

<style>
div.chart-wrapper {
  display: flex !important;
  align-items: center!important;
  justify-content: center!important;
}
</style>