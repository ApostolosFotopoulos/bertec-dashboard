<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-select
          @change="(v)=>$store.commit('setSelectedProtocol',v)"
          :value="this.$store.state.selectedProtocol"
          :items="protocols"
          label="Protocol"
          :disabled="$store.state.isSessionRunning"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          @change="(v)=>$store.commit('setTime',v)"
          :value="this.$store.state.duration"
          label="Time (in seconds)"
          solo
          :disabled="$store.state.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col>
        <v-btn 
          :class="$store.state.isSessionRunning?'stopButton v-input__control':'startButton v-input__control'" 
          @click="()=>startStopSession()"
          :disabled="$store.state.time == '' || $store.state.filePath ==''"
        >
          {{$store.state.isSessionRunning?'Stop':'Start'}}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8">
        <v-text-field
          @change="(v)=>$store.commit('setWeight',v)"
          :value="this.$store.state.weight"
          label="Weight (in Kg)"
          solo
          :disabled="$store.state.isSessionRunning"
        />
      </v-col>
      <v-col>
        <v-btn 
          class="getWeight v-input__control"
          :disabled="$store.state.isSessionRunning"
        >
          Get Weight
          
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col>
        <v-select
          @change="(v)=>{
            $store.commit('setDataType',v)
          }"
          :disabled="$store.state.isSessionRunning"
          :value="this.$store.state.selectedDataType"
          :items="dataType"
          label="Data Type"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          @change="(v)=>$store.commit('setStepsPerMinuteTarget',v)"
          :value="this.$store.state.stepsPerMinuteTarget"
          label="Steps/Minute"
          solo
          :disabled="$store.state.isSessionRunning"
          min="0"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-checkbox
          v-model="isChartChecked"
          label="Display Charts"
          color="#6ab187"
          hide-details
          @change="chartCheckboxHandler"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          v-model="isCopChecked"
          label="Display COP"
          color="#6ab187"
          hide-details
          @change="copCheckboxHandler"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          v-model="isLineChartChecked"
          label="Display Line Chart"
          color="#6ab187"
          hide-details
          @change="lineChartCheckboxHandler"
        ></v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
export default {
  data(){
    return{
      isChartChecked: false,
      isCopChecked: false,
      isLineChartChecked:false,
      ipcRenderer: window.require('electron').ipcRenderer,
      protocols:["Walking","Running","Jumping","Landing","Balance"],
      dataType:["Absolute","Normalized"],
    }
  },
  beforeMount(){
    ipcRenderer.on('WINDOWS_STATUS_RESPONSE',(_,responseData)=>{
      const { chartWindowVisible, copWindowVisible,lineChartWindowVisible } = responseData
      this.isChartChecked = chartWindowVisible
      this.isCopChecked = copWindowVisible
      this.isLineChartChecked = lineChartWindowVisible
    })
  },
  methods:{
    startStopSession(){
      if(this.$store.state.isSessionRunning){
        this.$store.commit('startStopSession',false)
        this.ipcRenderer.send('STOP_SESSION',)
      } else {
        this.$store.commit('startStopSession',true)
        this.ipcRenderer.send('START_SESSION',{ weight: this.$store.state.weight, dataType:this.$store.state.selectedDataType, stepsPerMinuteTarget: this.$store.state.stepsPerMinuteTarget})
      }
    },
    chartCheckboxHandler(){
      if(this.isChartChecked){
        this.ipcRenderer.send('OPEN_BARPLOT_WINDOW');
      } else {
        this.ipcRenderer.send('CLOSE_BARPLOT_WINDOW');
      }
    },
    copCheckboxHandler(){
      if(this.isCopChecked){
        this.ipcRenderer.send('OPEN_COP_WINDOW');
      } else {
        this.ipcRenderer.send('CLOSE_COP_WINDOW');
      }
    },
    lineChartCheckboxHandler(){
      if(this.isLineChartChecked){
        this.ipcRenderer.send('OPEN_LINECHART_WINDOW');
      } else {
        this.ipcRenderer.send('CLOSE_LINECHART_WINDOW');
      }
    }
  }
}
</script>

<style scoped>
.startButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.stopButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #d32d41!important;
}
.getWeight{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187!important;
}
</style>