<template>
  <v-dialog
    v-model="editTrialDialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    scrollable
    class="p-3"
  >
    <v-card tile color="#25282f">
      <div class="text-right pt-4 pr-4">
        <v-btn icon dark @click="closeEditTrialDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-container>
        <v-row class="mt-0">
          <v-col>
            <h3>Edit the trial details</h3>
            <hr class="hr" />
          </v-col>
        </v-row>
        <div class="mt-3">
          <v-alert
            outlined
            :type="updateAlertError ? 'error' : 'success'"
            text
            v-if="updateAlert"
          >
            {{ updateAlertMessage }}
          </v-alert>
        </div>
        <v-row align="center">
          <v-col align="center" cols="8" offset="2">
            <v-text-field
              v-model="trialToEdit.name"
              label="Trial"
              outlined
              
            />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center" cols="3" offset="7">
            <v-btn
              @click="editTrial"
              class="saveButton"
              block
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { UPDATE_TRIAL_DETAILS_RESPONSE } = require("../../../../main/util/types");
export default {
  props:{
    trialToEdit: Object,
    editTrialDialog: Boolean,
    editTrial: Function,
    closeEditTrialDialog: Function,
  },
  data(){
    return{
      updateAlert:false,
      updateAlertError:false,
      updateAlertMessage: ""
    }
  },
  mounted(){
    ipcRenderer.on(UPDATE_TRIAL_DETAILS_RESPONSE, (_, responseData) => {
      this.updateAlert = true;
      this.updateAlertError = responseData.error ? true : false;
      this.updateAlertMessage = responseData.error
        ? "An error occured while updating the trial"
        : "Successfully updated the trial";
      setTimeout(() => {
        this.updateAlert = false;
      }, 3000);
    });
  }
}
</script>

<style scoped>
.saveButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
</style>