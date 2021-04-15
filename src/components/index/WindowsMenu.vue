<template>
  <v-row>
    <v-col>
      <v-checkbox
        v-model="isChartChecked"
        label="Speed Meters"
        color="#6ab187"
        hide-details
        :disabled="!$store.state.options.isSessionRunning"
        @change="chartCheckboxHandler"
      ></v-checkbox>
    </v-col>
    <v-col>
      <v-checkbox
        v-model="isCopChecked"
        label="Centers of Pressure"
        color="#6ab187"
        hide-details
        :disabled="!$store.state.options.isSessionRunning"
        @change="copCheckboxHandler"
      ></v-checkbox>
    </v-col>
    <v-col>
      <v-checkbox
        v-model="isLineChartChecked"
        label="Line Charts"
        color="#6ab187"
        hide-details
        :disabled="!$store.state.options.isSessionRunning"
        @change="lineChartCheckboxHandler"
      ></v-checkbox>
    </v-col>
    <v-col>
      <v-checkbox
        v-model="isTimelineChecked"
        label="Timeline"
        color="#6ab187"
        hide-details
        :disabled="!$store.state.options.isSessionRunning"
        @change="timelineCheckboxHandler"
      ></v-checkbox>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require('electron')

export default {
  data(){
    return{
      isChartChecked: false,
      isCopChecked: false,
      isLineChartChecked:false,
      isTimelineChecked:false,
    }
  },
  mounted(){
    ipcRenderer.on('WINDOWS_STATUS_RESPONSE',(_,responseData)=>{
      const { chartWindowVisible, copWindowVisible, lineChartWindowVisible, isTimelineVisibile } = responseData
      this.isChartChecked = chartWindowVisible
      this.isCopChecked = copWindowVisible
      this.isLineChartChecked = lineChartWindowVisible
      this.isTimelineChecked = isTimelineVisibile
    })
  },
  methods:{
    chartCheckboxHandler(){
      if(this.isChartChecked){
        ipcRenderer.send('OPEN_SPEEDMETER_WINDOW');
      } else {
        ipcRenderer.send('CLOSE_SPEEDMETER_WINDOW');
      }
    },
    copCheckboxHandler(){
      if(this.isCopChecked){
        ipcRenderer.send('OPEN_COP_WINDOW');
      } else {
        ipcRenderer.send('CLOSE_COP_WINDOW');
      }
    },
    lineChartCheckboxHandler(){
      if(this.isLineChartChecked){
        ipcRenderer.send('OPEN_LINECHART_WINDOW');
      } else {
        ipcRenderer.send('CLOSE_LINECHART_WINDOW');
      }
    },
    timelineCheckboxHandler(){
      if(this.isTimelineChecked){
        ipcRenderer.send('OPEN_TIMELINE_WINDOW');
      } else {
        ipcRenderer.send('CLOSE_TIMELINE_WINDOW');
      }
    }
  }
}
</script>