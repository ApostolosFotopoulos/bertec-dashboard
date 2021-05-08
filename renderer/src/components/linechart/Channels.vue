<template>
  <div class="mt-3">
    <v-row>
      <v-col>
        <v-select
          class="mt-3"
          @change="(v) => $store.commit('setLeftPlateChannel', v)"
          :value="$store.state.lineChart.leftPlateChannel"
          :items="leftForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          class="mt-3"
          @change="(v) => $store.commit('setRightPlateChannel', v)"
          :value="$store.state.lineChart.rightPlateChannel"
          :items="rightForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          @change="
            (v) => {
              $store.commit('setDataTypeAtLineChart', v);
              $store.commit('resetLineChartState');
            }
          "
          class="mt-3"
          :disabled="$store.state.options.isSessionRunning"
          :value="$store.state.lineChart.dataType"
          :items="dataTypes"
          label="Data Type"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-bind="attrs"
              v-on="on"
              class="mt-3"
              @change="
                (v) => $store.commit('setThresholdAtLineChart', Number(v))
              "
              :value="$store.state.lineChart.threshold"
              label="Threshold (%BW) - Standard value = 5"
              outlined
              :disabled="$store.state.options.isSessionRunning"
              min="0"
            />
          </template>
          <span>Threshold</span>
        </v-tooltip>
      </v-col>
      <v-col>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-bind="attrs"
              v-on="on"
              class="mt-3"
              @change="
                (v) => $store.commit('setNofLinesAtLineChart', Number(v))
              "
              :value="$store.state.lineChart.nOfLines"
              label="Display"
              outlined
              :disabled="$store.state.options.isSessionRunning"
              min="0"
            />
          </template>
          <span>Number of Lines</span>
        </v-tooltip>
      </v-col>
      <v-col>
        <v-btn
          @click="$store.commit('resetLineChartState')"
          class="resetButton v-input__control mt-3"
          >Reset</v-btn
        >
      </v-col>
    </v-row>
    <v-row class="mt-0 pt-0">
      <v-col cols="2" class="mt-0 pt-0">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"
            v-on="on"
            @change="(v) => $store.commit('setTime', Number(v))"
            :value="$store.state.options.timeout"
            label="Time (in seconds)"
            solo
            :disabled="$store.state.options.isSessionRunning"
            min="0"
          />
        </template>
        <span>Time (in seconds)</span>
      </v-tooltip>
    </v-col>
    <v-col cols="2" class="mt-0 pt-0">
      <v-btn
        elevation="25"
        :class="
          $store.state.options.isSessionRunning
            ? 'stopButton v-input__control'
            : 'startButton v-input__control'
        "
        @click="() => startStopSession()"
      >
        {{ $store.state.options.isSessionRunning ? "Stop" : "Start" }}
      </v-btn>
    </v-col>
    </v-row>
  </div>
</template>

<script>
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
    };
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
.v-text-field.v-text-field--enclosed .v-text-field__details{
  display: none !important;
}
</style>

<style scoped>
.resetButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
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
</style>