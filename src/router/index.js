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
		name: 'UsersViewPage',
		component: () => import('../views/UsersViewPage.vue')
	},
	{
		path: '/user/manage',
		name: 'UserManagePage',
		component: () => import('../views/UserManagePage.vue')
	},
	{
		path: '/tag/manage',
		name: 'TagManagePage',
		component: () => import('../views/TagManagePage.vue')
	}
];

export default new VueRouter({
	routes
});
