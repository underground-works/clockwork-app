<template>
	<div class="split-view">
		<requests-list v-show="! requestsListCollapsed"></requests-list>
		<request-details></request-details>
	</div>
</template>

<script>
import RequestDetails from './components/RequestDetails'
import RequestsList from './components/RequestsList'

export default {
	name: 'App',
	components: { RequestDetails, RequestsList }
}
</script>

<style lang="scss">
@import './main.scss';
@import './features/pretty-jason/pretty-jason.css';
</style>
