<template>
	<div :class="{ 'request-sidebar': true, 'large': requestsListCollapsed }">

		<div class="sidebar-header">
			<div class="sidebar-title">
				Request
				<font-awesome-icon icon="angle-down"></font-awesome-icon>
			</div>

			<div class="sidebar-actions">
				<a href="#" title="Preserve log" @click="togglePreserveLog">
					<font-awesome-icon :icon="preserveLog ? 'circle' : ['far', 'circle']"></font-awesome-icon>
				</a>
				<a href="#" title="Clear" @click="clear">
					<font-awesome-icon icon="ban"></font-awesome-icon>
				</a>
			</div>
		</div>

		<div class="sidebar-content">
			<request-tab v-if="$request"></request-tab>
		</div>

	</div>
</template>

<script>
import RequestTab from './Tabs/RequestTab'

export default {
	name: 'RequestDetails',
	components: { RequestTab },
	methods: {
		togglePreserveLog: function () { this.global.preserveLog = ! this.global.preserveLog },
		clear: function () { this.$requests.clear() }
	}
}
</script>

<style lang="scss">
.request-sidebar {
	border-left: 1px solid #ccc;
	display: flex;
	flex-direction: column;
	width: 360px;

    &.large { width: 460px; }

    .sidebar-header {
    	border-bottom: 1px solid #ccc;
    	display: flex;
    	flex-shrink: 0;
        font-size: 12px;
	    height: 31px;
    	justify-content: space-between;
	    line-height: 31px;
    	width: 100%;

    	.sidebar-title {
	    	padding: 0 10px;
	    }

    	.sidebar-actions {
			align-items: center;
			display: flex;
			font-size: 15px;
			padding: 0 5px;

			a { padding: 0 5px; }
		}
    }

    .sidebar-content {
    	flex: 1;
		overflow: auto;
    }
}
</style>
