<template>
	<div class="split-view">
		<requests-list v-show="! $store.data.requestsListCollapsed"></requests-list>
		<request-details></request-details>
		<request-sidebar v-show="! $store.data.requestSidebarCollapsed"></request-sidebar>
	</div>
</template>

<script>
import RequestDetails from './components/RequestDetails'
import RequestSidebar from './components/RequestSidebar'
import RequestsList from './components/RequestsList'

export default {
	name: 'App',
	components: { RequestDetails, RequestSidebar, RequestsList }
}
</script>

<style lang="scss">
@import './main.scss';
@import './features/pretty-jason/pretty-jason.css';
</style>
