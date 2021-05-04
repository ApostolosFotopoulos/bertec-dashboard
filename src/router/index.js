import VueRouter from 'vue-router';
import Vue from 'vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('../views/Index.vue')
	},
	{
		path: '/cop',
		name: 'Cop',
		component: () => import('../views/CopChartPage.vue')
	},
	{
		path: '/linechart',
		name: 'LineChartPage',
		component: () => import('../views/LineChartPage.vue')
	},
	{
		path: '/speedmeter',
		name: 'SpeedMeterPage',
		component: () => import('../views/SpeedMeterPage.vue')
	},
	{
		path: '/timeline',
		name: 'TimelinePage',
		component: () => import('../views/TimelinePage.vue')
	},
	{
		path: '/users',
		name: 'UsersPage',
		component: () => import('../views/UsersPage.vue')
	},
	{
		path: '/user/create',
		name: 'UserCreatePage',
		component: () => import('../views/UserCreatePage.vue')
	},
	{
		path: '/tag/create',
		name: 'TagCreatePage',
		component: () => import('../views/TagCreatePage.vue')
	}
];

export default new VueRouter({
	routes
});
