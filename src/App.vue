<template>
	<div class="application split-view" :class="appearance">
		<requests-list v-if="showRequestsList"></requests-list>
		<request-details></request-details>
		<request-sidebar v-if="showRequestSidebar"></request-sidebar>

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
		appearance() { return this.$settings.appearance },
		showRequestsList() { return ! this.$settings.global.requestsListCollapsed && this.$platform.hasFeature('requests-list') },
		showRequestSidebar() { return ! this.$settings.global.requestSidebarCollapsed && this.$platform.hasFeature('request-sidebar') }
	}
}
</script>

<style lang="scss">
@use './main';
@use './features/pretty-jason/pretty-jason';
</style>
