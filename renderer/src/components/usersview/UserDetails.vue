<template>
  <v-dialog
    v-model="userDetailsDialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    scrollable
    class="p-3"
  >
    <v-card tile color="#25282f">
      <div class="text-right pt-4 pr-4">
        <v-btn icon dark @click="closeUserDetailsDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-container>
        <v-row class="mt-0">
          <v-col>
            <h3>See the details of the user</h3>
            <hr class="hr" />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center">
            <v-text-field
              v-model="userDetails.hospital_id"
              label="Hospital ID"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.first_name"
              label="First Name"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.last_name"
              label="Last Name"
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center">
            <v-text-field
              v-model="userDetails.affected_side"
              label="Affected Side"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.year"
              label="Year of Birth"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.height"
              label="Height (cm)"
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center">
            <v-text-field
              v-model="userDetails.leg_length"
              label="Leg Length (cm)"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.sex"
              label="Sex"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              v-model="userDetails.weight"
              label="Weight (N)"
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center">
            <v-text-field
              :value="moment(userDetails.surgery_date).format('DD/MM/YYYY')"
              label="Surgery Date"
              outlined
              readonly
            />
          </v-col>
          <v-col align="center">
            <v-text-field
              :value="moment(userDetails.injury_date).format('DD/MM/YYYY')"
              label="Injury Date"
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col align="center">
            <v-textarea
              v-model="userDetails.other_info"
              label="Other Info"
              outlined
              readonly
              no-resize
              rows="4"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  props:{
    userDetails:Object,
    userDetailsDialog: Boolean,
    openUserDetailsDialog: Function,
    closeUserDetailsDialog: Function
  },
  methods:{
    moment
  }
}
</script>