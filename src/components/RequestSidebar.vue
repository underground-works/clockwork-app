<template>
	<div :class="{ 'request-sidebar': true, 'large': $store.data.requestsListCollapsed }">

		<div class="sidebar-header">
			<div class="sidebar-title">
				Request
			</div>

			<div class="sidebar-actions">
				<a href="#" v-if="$request && $request.url" v-clipboard:copy="$request.url" title="Copy url">
					<font-awesome-icon icon="link"></font-awesome-icon>
				</a>
				<a href="#" title="Preserve log" @click="togglePreserveLog">
					<font-awesome-icon :icon="$store.data.preserveLog ? 'circle' : ['far', 'circle']"></font-awesome-icon>
				</a>
				<a href="#" title="Clear" @click="clear">
					<font-awesome-icon icon="ban"></font-awesome-icon>
				</a>
			</div>
		</div>

		<div class="sidebar-content">
			<request-tab v-if="$request"></request-tab>

			<div class="sidebar-date" v-if="$request">{{ $request.time * 1000 | moment('Y-MM-DD HH:mm:ss') }}</div>
			<div class="sidebar-id" v-if="$request">{{ $request.id }}</div>
		</div>

	</div>
</template>

<script>
import RequestTab from './Tabs/RequestTab'

export default {
	name: 'RequestSidebar',
	components: { RequestTab },
	methods: {
		togglePreserveLog() {
			this.$store.set('preserveLog', ! this.$store.get('preserveLog'))
		},
		clear() { this.$requests.clear() }
	}
}
</script>

<style lang="scss">
.request-sidebar {
	background: #fafafa;
	border-top: 1px solid rgb(209, 209, 209);
	display: flex;
	flex-direction: column;
	height: 25%;

	body.dark & {
		background: #1b1b1b;
		border-top: 1px solid rgb(54, 54, 54);
	}

	&.large { height: 33%; }

	@media screen and (min-width: 900px) {
		border-left: 1px solid rgb(209, 209, 209);
		border-top: 0;
		height: 100%;
		width: 300px;

		body.dark & {
			border-left: 1px solid rgb(54, 54, 54);
			border-top: 0;
		}

		&.large {
			height: 100%;
			width: 400px;
		}
	}

	@media screen and (min-width: 1100px) {
		width: 360px;

		&.large {
			width: 460px;
		}
	}

	.sidebar-header {
		background: #fff;
		border-bottom: 1px solid #ccc;
		display: flex;
		flex-shrink: 0;
		font-size: 12px;
		height: 31px;
		justify-content: space-between;
		line-height: 31px;
		width: 100%;

		body.dark & {
			background: #1f1f1f;
			border-bottom: 1px solid rgb(54, 54, 54);
		}

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

	.sidebar-date, .sidebar-id {
		margin: 10px 0;
		text-align: center;
	}

	.sidebar-id {
		color: rgb(128, 128, 128);

		body.dark & { color: rgb(118, 118, 118); }
	}
}
</style>
