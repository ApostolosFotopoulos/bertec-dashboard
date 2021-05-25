<template>
  <v-row>
    <v-col cols="5">
      <v-select
        @change="(v) => $store.commit('setMode', v)"
        :value="$store.state.options.mode"
        :items="modes"
        label="Modes"
        :disabled="$store.state.options.isSessionRunning"
        solo
      ></v-select>
    </v-col>
    <v-col cols="2">
      <v-btn
        elevation="25"
        :class="
          $store.state.options.isSessionRunning
            ? 'stopButton v-input__control'
            : 'startButton v-input__control'
        "
        @click="() => startStopSession()"
      >
        Real Time
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { START_SESSION, STOP_SESSION} = require('../../../../main/util/types')
export default {
  data() {
    return {
      modes: ["Walking", "Running", "Jumping", "Landing", "Balance"],
      dataType: ["Absolute", "Normalized"],
    };
  },
  methods: {
    startStopSession() {
      if (this.$store.state.options.isSessionRunning) {
        this.$store.commit("setSessionRunning", false);
        ipcRenderer.send(STOP_SESSION);
      } else {
        this.$store.commit("setSessionRunning", true);
        ipcRenderer.send(START_SESSION, {
          weight: this.$store.state.options.weight,
          session: this.$store.state.options.session,
          database: this.$store.state.options.database,
          user: this.$store.state.options.user,
        });
      }
    },
  },
};
</script>

<style scoped>
.startButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.stopButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
.getWeight {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
</style>