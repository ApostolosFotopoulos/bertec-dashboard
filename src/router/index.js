import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes = [{
	path: "/",
	name: "Home",
	component: ()=> import("../views/Index.vue"),
},{
	path: "/chart",
	name: "Chart",
	component: ()=> import("../views/Chart.vue")
},{
	path: "/cop",
	name: "Cop",
	component: ()=> import("../views/Cop.vue")
}]

export default new VueRouter({
	routes
})
