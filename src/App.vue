<template>
	<div class="application split-view" :class="appearance">
		<requests-list v-show="! $settings.global.requestsListCollapsed"></requests-list>
		<request-details></request-details>
		<request-sidebar v-show="! $settings.global.requestSidebarCollapsed"></request-sidebar>

		<whats-new></whats-new>
	</div>
</template>

<script>
import RequestDetails from './components/RequestDetails'
import RequestSidebar from './components/RequestSidebar'
import RequestsList from './components/RequestsList'
import WhatsNew from './components/Details/WhatsNew'

export default {
	name: 'App',
	components: { RequestDetails, RequestSidebar, RequestsList, WhatsNew },
	computed: {
		appearance() { return this.$settings.appearance }
	}
}
</script>

<style lang="scss">
@import './mixins.scss';
@import './main.scss';
@import './features/pretty-jason/pretty-jason.css';
</style>
