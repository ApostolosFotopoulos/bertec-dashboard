import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes = [{
	path: "/",
	name: "Home",
	component: ()=> import("../views/Index.vue"),
},{
	path: "/cop",
	name: "Cop",
	component: ()=> import("../views/Cop.vue")
},{
	path: "/linechart",
	name: "LineChartPage",
	component: ()=> import("../views/LineChartPage.vue")
	},{
		path: "/speedmeter",
		name: "SpeedMeterPage",
		component: () => import("../views/SpeedMeterPage.vue")
	}]

export default new VueRouter({
	routes
})
