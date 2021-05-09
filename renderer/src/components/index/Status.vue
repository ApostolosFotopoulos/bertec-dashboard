<template>
  <div>
    <v-row class="pb-0 mb-0">
      <v-col>
        <v-select
          @change="(v) => $store.commit('setLeftPlateChannelAtOptions', v)"
          :value="$store.state.options.leftPlateChannel"
          :items="leftForcePlateChannels"
          hide-details="auto"
          label="Left Plate Channel"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          :value="$store.state.options.leftPlateValue"
          hide-details="auto"
          solo
          readonly
        />
      </v-col>
      <v-col>
        <v-select
          @change="(v) => $store.commit('setRightPlateChannelAtOptions', v)"
          :value="$store.state.options.rightPlateChannel"
          :items="rightForcePlateChannels"
          hide-details="auto"
          label="Right Plate Channel"
          solo
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          :value="$store.state.options.rightPlateValue"
          hide-details="auto"
          solo
          readonly
        />
      </v-col>
      <v-col>
        <v-btn
          :class="`${setButtonStyle()} v-input__control`"
          @click="resetForcePlate"
        >
          {{ setButtonText() }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="pt-0 mt-0">
      <v-col class="pt-0 mt-0" cols="5">
        <strong
          :class="`${
            $store.state.options.deviceLeft != -1
              ? 'device-success'
              : 'device-error'
          }`"
        >
          {{
            `${
              $store.state.options.deviceLeft != -1
                ? `${$store.state.options.deviceLeft} Connected`
                : "• No Device Connected"
            }`
          }}
        </strong>
      </v-col>
      <v-col class="pt-0 mt-0">
        <strong
          :class="`${
            $store.state.options.deviceRight != -1
              ? 'device-success'
              : 'device-error'
          }`"
        >
          {{
            `${
              $store.state.options.deviceRight != -1
                ? `${$store.state.options.deviceRight} Connected`
                : "• No Device Connected"
            }`
          }}
        </strong>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import rowsNames from "../../../../assets/store/rowsNames.json";
const { ipcRenderer } = window.require("electron");
const { SESSION_OPTIONS,DEVICE_DETAILS, RESET_FORCE_PLATES } = require("../../../../main/util/types");

export default {
  data() {
    return {
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
  mounted() {
    var _this = this;
    ipcRenderer.on(SESSION_OPTIONS, (_, responseData) => {
      _this.$store.commit(
        "setLeftPlateValue",
        responseData.rows[
          rowsNames[_this.$store.state.options.leftPlateChannel]
        ]
      );
      _this.$store.commit(
        "setRightPlateValue",
        responseData.rows[
          rowsNames[_this.$store.state.options.rightPlateChannel]
        ]
      );
    });
    ipcRenderer.on(DEVICE_DETAILS, (_, responseData) => {
      _this.$store.commit("setDeviceLeft", responseData.deviceLeft);
      _this.$store.commit("setDeviceRight", responseData.deviceRight);
    });
  },
  methods: {
    resetForcePlate() {
      ipcRenderer.send(RESET_FORCE_PLATES);
    },
    setButtonStyle() {
      if (
        Number(this.$store.state.options.leftPlateValue) < 4 &&
        Number(this.$store.state.options.leftPlateValue) > -4 &&
        Number(this.$store.state.options.rightPlateValue) < 4 &&
        Number(this.$store.state.options.rightPlateValue) > -4
      ) {
        return "resetButton";
      } else {
        return "errorButton";
      }
    },
    setButtonText() {
      if (
        Number(this.$store.state.options.leftPlateValue) < 4 &&
        Number(this.$store.state.options.leftPlateValue) > -4 &&
        Number(this.$store.state.options.rightPlateValue) < 4 &&
        Number(this.$store.state.options.rightPlateValue) > -4
      ) {
        return "Reset";
      } else {
        return "Press to reset";
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

<style scoped>
.device-error {
  color: #d32d41;
}
.device-success {
  color: #6ab187;
}
.errorButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #d32d41 !important;
}
.resetButton {
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
</style>