<template>
	<div :class="{ 'request-sidebar': true, 'large': $settings.global.requestsListCollapsed }">

		<div class="sidebar-header">
			<div class="sidebar-title">
				<template v-if="$request && $request.isCommand()">
					Command
				</template>
				<template v-else-if="$request && $request.isQueueJob()">
					Queue job
				</template>
				<template v-else-if="$request && $request.isTest()">
					Test
				</template>
				<template v-else>
					Request
				</template>
			</div>

			<div class="sidebar-actions">
				<a href="#" v-if="$request && $request.url" v-clipboard:copy="$request.url" title="Copy url">
					<font-awesome-icon icon="link"></font-awesome-icon>
				</a>
				<a href="#" title="Preserve log" @click="togglePreserveLog">
					<font-awesome-icon :icon="$settings.global.preserveLog ? 'circle' : ['far', 'circle']"></font-awesome-icon>
				</a>
				<a href="#" title="Clear" @click="clear">
					<font-awesome-icon icon="ban"></font-awesome-icon>
				</a>
			</div>
		</div>

		<div class="sidebar-content">
			<parent-request></parent-request>
			<exception-section></exception-section>

			<command-tab v-if="$request && $request.isCommand()"></command-tab>
			<queue-job-tab v-if="$request && $request.isQueueJob()"></queue-job-tab>
			<test-tab v-if="$request && $request.isTest()"></test-tab>
			<request-tab v-else-if="$request"></request-tab>

			<div class="sidebar-date" v-if="$request && $request.time">
				{{ $request.time * 1000 | moment('Y-MM-DD HH:mm:ss') }}
			</div>
			<div class="sidebar-id" v-if="$request">{{ $request.id }}</div>
		</div>

	</div>
</template>

<script>
import CommandTab from './Tabs/CommandTab'
import ExceptionSection from './Sidebar/ExceptionSection'
import ParentRequest from './Sidebar/ParentRequest'
import QueueJobTab from './Tabs/QueueJobTab'
import RequestTab from './Tabs/RequestTab'
import TestTab from './Tabs/TestTab'

export default {
	name: 'RequestSidebar',
	components: { CommandTab, ExceptionSection, ParentRequest, QueueJobTab, RequestTab, TestTab },
	methods: {
		togglePreserveLog() {
			this.$settings.global.preserveLog = ! this.$settings.global.preserveLog
			this.$settings.save()
		},
		clear() { this.$requests.clear() }
	}
}
</script>

<style lang="scss">
@import '../mixins.scss';

.request-sidebar {
	background: #fafafa;
	border-top: 1px solid rgb(209, 209, 209);
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	height: 25%;

	@include dark {
		background: #1b1b1b;
		border-top: 1px solid rgb(54, 54, 54);
	}

	&.large { height: 33%; }

	@media screen and (min-width: 900px) {
		border-left: 1px solid rgb(209, 209, 209);
		border-top: 0;
		height: 100%;
		width: 300px;

		@include dark {
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

		@include dark {
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

		@include dark { color: rgb(118, 118, 118); }
	}
}
</style>
