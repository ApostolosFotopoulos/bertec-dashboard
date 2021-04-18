<template>
  <div>
    <v-row class="pb-0 mb-0">
      <v-col class="pb-0 mb-0">
        <v-select
          class="mt-3"
          @change="(v)=>$store.commit('setLeftPlateChannelAtTimeline',v)"
          :value="$store.state.timeline.leftPlateChannel"
          :items="leftForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          class="mt-3"
          @change="(v)=>$store.commit('setRightPlateChannelAtTimeline',v)"
          :value="$store.state.timeline.rightPlateChannel"
          :items="rightForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          @change="(v)=>{
            $store.commit('setDataTypeAtTimeline',v)
            $store.commit('resetTimelineState')
          }"
          class="mt-3"
          :disabled="$store.state.options.isSessionRunning"
          :value="$store.state.timeline.dataType"
          :items="dataTypes"
          label="Data Type"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          class="mt-3"
          @input="(v)=>$store.commit('setTrialThreshold',Number(v))"
          :value="$store.state.timeline.trialThreshold"
          label="Trial Threshold"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col>
      <v-col>
        <v-text-field
          class="mt-3"
          @change="(v)=>$store.commit('setNofPointsAtTimeline',Number(v))"
          :value="$store.state.timeline.nOfPoints"
          label="Display"
          outlined
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col>
        <v-btn @click="$store.commit('resetTimelineState')" class="resetButton  v-input__control mt-3">Reset</v-btn>
      </v-col>
    </v-row>
    <v-row class="pt-0 mt-0">
      <v-col cols="2" class="pt-0 mt-0">
        <v-text-field
          @input="(v)=>$store.commit('setRangeMin',Number(v))"
          :value="$store.state.timeline.rangeMin"
          label="Min Range"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col>
      <v-col cols="2" class="pt-0 mt-0">
        <v-text-field
          @input="(v)=>$store.commit('setRangeMax',Number(v))"
          :value="$store.state.timeline.rangeMax"
          label="Max Range"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col>
      <v-col cols="4" class="pt-0 mt-0">
        <v-text-field
          @change="(v)=>$store.commit('setThresholdAtLineChart',Number(v))"
          :value="$store.state.timeline.threshold"
          label="Minimum Threshold - Standard value = 5"
          outlined
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data(){
    return{
      dataTypes:["Normalized","Absolute"],
      leftForcePlateChannels: ["FX1","FY1","FZ1","MX1","MY1","MZ1","COPX1","COPY1","COPXY1"],
      rightForcePlateChannels: ["FX2","FY2","FZ2","MX2","MY2","MZ2","COPX2","COPY2","COPXY2"],
    }
  },
}
</script>

<style>
.v-menu__content.theme--dark::-webkit-scrollbar{
  background-color: transparent !important;
  width: 0px;
}
.v-menu__content.theme--dark.menuable__content__active::-webkit-scrollbar-track{
	background-color: transparent;
  width: 0px;
}
</style>

<style>
.resetButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.v-text-field__details{
  display: none!important;
}
</style>