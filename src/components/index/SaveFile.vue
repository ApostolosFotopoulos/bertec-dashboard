<template>
  <div>
    <v-text-field
      v-model="trialName"
      label="Trial Name"
      type="text"
      solo
      :disabled="databaseName ==='' || user === ''"
    />
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  props:{
    databaseName: String,
    user: String,
  },
  data() {
    return {
      trialName: "",
    };
  },
};
</script>

<style scoped>
.saveButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #1c4e80 !important;
}
</style>

<style>
.v-text-field.v-text-field--solo .v-input__control {
  height: 38px !important;
  min-height: 38px !important;
}
</style>