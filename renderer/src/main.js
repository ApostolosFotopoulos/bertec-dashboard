import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import vcalendar from './plugins/vcalendar';
import store from './plugins/store';

new Vue({
	store,
	router,
	vuetify,
	vcalendar,
	render: (h) => h(App)
}).$mount('#app');
