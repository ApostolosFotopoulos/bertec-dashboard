<template>
  <div>
    <h3 class="pa-2">Messages</h3>
    <hr class="hr">
    <v-container class="alerts-container scrollbar">
      <v-alert
        dense
        border="left"
        type="warning"
        color="#d32d41"
        dismissible
      >
        I'm a dense alert with the <strong>border</strong> prop and a <strong>type</strong> of warning
      </v-alert>
      <v-alert
        dense
        border="left"
        type="warning"
        color="#d32d41"
        dismissible
      >
        I'm a dense alert with the <strong>border</strong> prop and a <strong>type</strong> of warning
      </v-alert>
    </v-container>
  </div>

</template>

<script>
export default {
  
}
</script>

<style scoped>
.alerts-container{
  height: 500px;
  max-height: 500px;
  overflow-y: auto;
}
.alerts-container::-webkit-scrollbar-track{
	background-color: transparent;
}
.alerts-container::-webkit-scrollbar-track{
	background-color: transparent;
}
.alerts-container::-webkit-scrollbar{
	width: 8px;
	background-color: transparent;
  border-radius: 20px;
}
.alerts-container::-webkit-scrollbar-thumb{
	background-color: #eee9ee;
	border: 2px solid #eee9ee;
  border-radius: 20px;
}
</style>