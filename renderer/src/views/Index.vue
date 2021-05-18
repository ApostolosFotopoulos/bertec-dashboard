<template>
  <div>
    <Setup
      v-if="!isDatabaseReady"
      :skipDatabase="skipDatabase"
      :continueToMain="continueToMain"
    />
    <Session v-else :backToDatabase="backToDatabase" />
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import Session from "../components/session/Session.vue";
import Setup from "../components/setup/Setup.vue";
const { WINDOWS_STATUS, CREATE_SESSION } = require("../../../main/util/types");
export default {
  components: {
    Session,
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
    continueToMain(d, u, s) {
      this.$store.commit("setDatabase", d);
      this.$store.commit("setUser", u);
      this.$store.commit("setWeight", u.weight);
      ipcRenderer.send(CREATE_SESSION,{ database: d, userId: u.id , session: s})
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
