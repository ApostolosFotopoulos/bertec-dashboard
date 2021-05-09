<template>
  <div>
    <Setup
      v-if="!isDatabaseReady"
      :skipDatabase="skipDatabase"
      :continueToMain="continueToMain"
    />
    <Trial v-else :backToDatabase="backToDatabase" />
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import Trial from "../components/trial/Trial.vue";
import Setup from "../components/setup/Setup.vue";
const { WINDOWS_STATUS } = require("../../../main/util/types");
export default {
  components: {
    Trial,
    Setup,
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send(WINDOWS_STATUS);
    }, 10);
  },
  data() {
    return {
      isDatabaseReady: false,
      newDatabaseName: "",
    };
  },
  methods: {
    skipDatabase() {
      this.isDatabaseReady = true;
    },
    continueToMain(d, u) {
      this.$store.commit("setDatabase", d);
      this.$store.commit("setUser", u);
      this.$store.commit("setWeight", u.weight);
      this.isDatabaseReady = true;
    },
    backToDatabase() {
      this.isDatabaseReady = false;
      this.$store.commit("setDatabase", "");
      this.$store.commit("setUser", "");
      this.$store.commit("setWeight", 700);
    },
  },
};
</script>
