<template>
  <div>
    <v-row class="pb-0 mb-0">
      <v-col class="pb-0 mb-0">
        <v-select
          class="mt-3"
          @change="(v) => $store.commit('setLeftPlateChannelAtTimeline', v)"
          :value="$store.state.timeline.leftPlateChannel"
          :items="leftForcePlateChannels"
          label="Channels"
          outlined
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          class="mt-3"
          @change="(v) => $store.commit('setRightPlateChannelAtTimeline', v)"
          :value="$store.state.timeline.rightPlateChannel"
          :items="rightForcePlateChannels"
          label="Channels"
          outlined
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          @change="
            (v) => {
              $store.commit('setDataTypeAtTimeline', v);
              $store.commit('resetTimelineState');
            }
          "
          class="mt-3"
          :disabled="$store.state.options.isSessionRunning"
          :value="$store.state.timeline.dataType"
          :items="dataTypes"
          label="Data Type"
          outlined
        ></v-select>
      </v-col>
      <!-- <v-col>
        <v-text-field
          class="mt-3"
          @input="(v) => $store.commit('setTrialThreshold', Number(v))"
          :value="$store.state.timeline.trialThreshold"
          label="Trial Threshold"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col> -->
      <v-col>
        <v-text-field
          class="mt-3"
          @change="(v) => $store.commit('setNofPointsAtTimeline', Number(v))"
          :value="$store.state.timeline.nOfPoints"
          label="Display"
          outlined
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col>
        <v-btn
          @click="$store.commit('resetTimelineState')"
          class="resetButton v-input__control mt-4"
          >Reset</v-btn
        >
      </v-col>
    </v-row>
    <v-row class="pt-0 mt-0">
      <v-col cols="2" class="pt-0 mt-0">
        <v-text-field
          @input="(v) => $store.commit('setRangeMin', Number(v))"
          :value="$store.state.timeline.rangeMin"
          label="Min Range"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col>
      <v-col cols="2" class="pt-0 mt-0">
        <v-text-field
          @input="(v) => $store.commit('setRangeMax', Number(v))"
          :value="$store.state.timeline.rangeMax"
          label="Max Range"
          outlined
          :disabled="$store.state.options.isSessionRunning"
        />
      </v-col>
      <v-col cols="4" class="pt-0 mt-0">
        <v-text-field
          @change="(v) => $store.commit('setThresholdAtLineChart', Number(v))"
          :value="$store.state.timeline.threshold"
          label="Minimum Threshold - Standard value = 5"
          outlined
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col cols="2" class="pt-0 mt-0">
        <v-text-field
          @change="(v) => $store.commit('setTime', Number(v))"
          :value="$store.state.options.timeout"
          label="Time (in seconds)"
          :disabled="$store.state.options.isSessionRunning"
          min="0"
          outlined
        />
      </v-col>
      <v-col cols="2" class="pt-0 mt-0">
        <v-btn
          elevation="25"
          :disabled="this.$store.state.options.session == -1"
          :class="
            isTrialRunning
              ? 'stopButton v-input__control mt-1'
              : 'startButton v-input__control mt-1'
          "
          @click="() => startStopTrial()"
        >
          {{ isTrialRunning ? "Stop" : "Start" }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const {
  CREATE_TRIAL,
  CREATE_TRIAL_RESPONSE,
  START_TRIAL_WRITING, STOP_TRIAL_WRITING,
  AFTER_TRIAL_PROCESS,
  AFTER_TRIAL_PROCESS_RESPONSE
} = require("../../../../main/util/types");
export default {
  data() {
    return {
      dataTypes: ["Normalized", "Absolute"],
      leftForcePlateChannels: [
        "FX1",
        "FY1",
        "FZ1",
        "MX1",
        "MY1",
        "MZ1",
        "COPX1",
        "COPY1",
        "COPXY1",
      ],
      rightForcePlateChannels: [
        "FX2",
        "FY2",
        "FZ2",
        "MX2",
        "MY2",
        "MZ2",
        "COPX2",
        "COPY2",
        "COPXY2",
      ],
      isTrialRunning: false,
      timeoutInstance: null,
    };
  },
  mounted() {
    ipcRenderer.on(CREATE_TRIAL_RESPONSE,(_,responseData)=>{
      this.isTrialRunning = true;
      this.$store.commit("setTrial", responseData.trial);
      this.$store.commit("setTrialId",responseData.trialId)
      ipcRenderer.send(START_TRIAL_WRITING,{ trial: responseData.trial })
      this.timeoutInstance = setTimeout(() => {
        ipcRenderer.send(STOP_TRIAL_WRITING,{
          database: this.$store.state.options.database , 
          session: this.$store.state.options.session ,
          trialId: this.$store.state.options.trialId 
        })
        ipcRenderer.send(AFTER_TRIAL_PROCESS,{
          database: this.$store.state.options.database , 
          trialId: this.$store.state.options.trialId 
        })
      }, this.$store.state.options.timeout * 1000);
    });

    ipcRenderer.on(AFTER_TRIAL_PROCESS_RESPONSE, (_, responseData) => {
      this.isTrialRunning = false;
      this.$store.commit("setTrial", "");
      this.$store.commit("setTrialId",-1);
    });
  },
  methods: {
    startStopTrial(){
      if(this.isTrialRunning){
        clearTimeout(this.timeoutInstance);
        ipcRenderer.send(STOP_TRIAL_WRITING,{
          database: this.$store.state.options.database , 
          session: this.$store.state.options.session ,
          trialId: this.$store.state.options.trialId 
        })
        ipcRenderer.send(AFTER_TRIAL_PROCESS,{
          database: this.$store.state.options.database , 
          trialId: this.$store.state.options.trialId 
        })
      } else {
        if(this.$store.state.options.session != -1){
          ipcRenderer.send(CREATE_TRIAL,{ 
            session: this.$store.state.options.session,
            database: this.$store.state.options.database, 
            userId: this.$store.state.options.user.id,
          })
        }
      }
    },
  },
};
</script>

<style>
.v-menu__content.theme--dark::-webkit-scrollbar {
  background-color: transparent !important;
  width: 0px;
}
.v-menu__content.theme--dark.menuable__content__active::-webkit-scrollbar-track {
  background-color: transparent;
  width: 0px;
}
</style>

<style>
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
.resetButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.v-text-field__details {
  display: none !important;
}
</style>