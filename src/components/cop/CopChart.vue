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
        <v-btn @click="$store.commit('resetCOPChartState')" class="resetButton  v-input__control">Reset</v-btn>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"
            v-on="on"
            class="mt-3"
            @change="(v)=>$store.commit('setNofGroupPoints',Number(v))"
            :value="$store.state.copChart.nOfGroupPoints"
            label="Number of Group Points"
            solo
            min="1"
          />
          </template>
          <span>Number of Group Points</span>
        </v-tooltip>
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
const { ipcRenderer } = window.require('electron')
const defaultOptions = require("../../../assets/options/copChart.json")

import VueApexCharts from 'vue-apexcharts'
export default {
  components:{
    VueApexCharts
  },
  created() {
    window.addEventListener("resize", this.resizeHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data(){
    return{
      height: 0.8 * window.innerHeight,
      leftFootChart:{
        ...defaultOptions,
        yaxis: {
          min:-300,
          max: 300,
          tickAmount:6,
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
          min:-200,
          max: 200,
          tickAmount:32,
          tickPlacement: 'between',
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            formatter: (val)=>{
              if (val.toFixed(0)%10 == 0){
                return val.toFixed(0)
              }
            },
            show:true,
          },
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.copChart.leftPlateFinalSeries.length-2)){
            return "#d32d41"
          } else {
            return "gray"
          }
        }],
        markers: {
          size: 4,
        },
        annotations:{
          yaxis:[{
            y:300,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          },{
            y:-300,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          }],
          xaxis:[{
            x:-200,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          },{
            x:200,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          }]
        }
      },
      rightFootChart:{
        ...defaultOptions,
        yaxis: {
          min:-300,
          max: 300,
          tickAmount:6,
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
          min:-200,
          max: 200,
          tickAmount:32,
          tickPlacement: 'between',
          dataLabels:{
            show:false,
            enabled:false,
          },
          labels:{
            style:{
              colors:['#fff']
            },
            show:true,
            formatter: (val)=>{
              if (val.toFixed(0)%10 == 0){
                return val.toFixed(0)
              }
            },
          },
          
        },
        colors:[({ value, seriesIndex, w })=>{
          if(seriesIndex == (this.$store.state.copChart.rightPlateFinalSeries.length - 2)){
            return "#6ab187"
          } else {
            return "gray"
          }
        }],
        markers: {
          size: 4,
        },
        annotations:{
          yaxis:[{
            y:300,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          },{
            y:-300,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          }],
          xaxis:[{
            x:-200,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          },{
            x:200,
            borderWidth:5,
            strokeDashArray: 0,
            borderColor:"rgb(224, 224, 224)",
          }]
        }
      }
    }
  },
  mounted(){
    var _this = this
    ipcRenderer.on('SESSION_RESPONSE_COP',(_,responseData)=>{
      if(responseData.isSessionRunning){
        _this.updateVariables(responseData)
      } else {
        _this.$store.commit('resetCOPChartState')
      }
    }) 
  },
  methods:{
    resizeHandler(e){
      this.height = 0.8 * window.innerHeight
    },
    updateVariables(responseData){
      console.log(responseData.rows)
      this.$store.commit('setWeight',responseData.weight)
      this.$store.commit('setLeftPlateAtCOP',responseData.rows)
      this.$store.commit('setRightPlateAtCOP',responseData.rows)
    },
  }
}
</script>

<style scoped>
.resetButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
</style>