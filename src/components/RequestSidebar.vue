<template>
	<div :class="{ 'request-sidebar': true, 'large': $settings.global.requestsListCollapsed }" class="popover-viewport">

		<div class="sidebar-header" v-if="$request">
			<div class="header-info" :title="$request.tooltip">
				<div class="info-main">
					<template v-if="$request.isCommand()">
						<span class="type-text">CMD</span>
						{{$request.commandName}}
					</template>
					<template v-else-if="$request.isQueueJob()">
						<span class="type-text">QUEUE</span>
						{{$request.jobName}}
					</template>
					<template v-else-if="$request.isTest()">
						<span class="type-text">TEST</span>
						{{$request.testGroup}}
					</template>
					<template v-else>
						<span v-if="$request.isAjax()" class="type-text">AJAX</span>
						<span class="method-text">{{$request.method}}</span> {{$request.uri}}
					</template>

					<a href="#" class="info-copy" v-if="$request && $request.url" v-clipboard:copy="$request.url" title="Copy url">
						<icon name="link"></icon>
					</a>
				</div>
				<div class="info-details">
					<template v-if="$request.isCommand()">
						{{$request.commandLine}}
					</template>
					<template v-else-if="$request.isQueueJob()">
						{{$request.jobDescription}}
					</template>
					<template v-else-if="$request.isTest()">
						{{$request.testName}}
					</template>
					<template v-else>
						{{$request.controller}}
					</template>
				</div>
			</div>

			<icon name="alert-circle" class="header-alert alert-errors" v-if="$request.errorsCount"></icon>
			<icon name="alert-triangle" class="header-alert alert-warnings" v-else-if="$request.warningsCount"></icon>

			<div class="header-status">
				<template v-if="$request.isCommand()">
					<span :class="{ 'status-text': true, 'client-error': $request.isCommandWarning(), 'server-error': $request.isCommandError() }" :title="$request.commandExitCode">{{$request.commandExitCode}}</span>
				</template>
				<template v-else-if="$request.isQueueJob()">
					<span :class="{ 'status-text': true, 'status-text-small': true, 'client-error': $request.isQueueJobWarning(), 'server-error': $request.isQueueJobError() }" :title="$request.jobStatus">{{$request.jobStatus}}</span>
				</template>
				<template v-else-if="$request.isTest()">
					<span :class="{ 'status-text': true, 'status-text-small': true, 'client-error': $request.isTestWarning(), 'server-error': $request.isTestError() }" :title="$request.testStatus">{{$request.testStatus}}</span>
				</template>
				<template v-else>
					<span :class="{ 'status-text': true, 'client-error': $request.isClientError(), 'server-error': $request.isServerError() }" :title="$request.responseStatus">{{$request.responseStatus}}</span>
				</template>
			</div>
		</div>

		<div class="sidebar-content">
			<parent-request></parent-request>
			<exception-section></exception-section>

			<command-tab v-if="$request && $request.isCommand()"></command-tab>
			<queue-job-tab v-if="$request && $request.isQueueJob()"></queue-job-tab>
			<test-tab v-if="$request && $request.isTest()"></test-tab>
			<request-tab v-else-if="$request"></request-tab>

			<div class="content-meta">
				<div class="meta-date" v-if="$request && $request.time">
					{{ $request.time * 1000 | moment('Y-MM-DD HH:mm:ss') }}
				</div>
				<div class="meta-id" v-if="$request">{{ $request.id }}</div>
			</div>
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
	components: { CommandTab, ExceptionSection, ParentRequest, QueueJobTab, RequestTab, TestTab }
}
</script>

<style lang="scss">
@import '../mixins.scss';

.request-sidebar {
	background: #fcfcfd;
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
		border-left: 1px solid hsl(240, 20, 85);
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
		align-items: center;
		background: hsl(240, 20, 99);
		border-bottom: 1px solid hsl(240, 20, 92);
		display: flex;
		flex-shrink: 0;
		font-size: 13px;
		padding: 14px 12px;
		width: 100%;

		@include dark {
			background: #1f1f1f;
			border-bottom: 1px solid rgb(54, 54, 54);
		}

		.header-info {
			flex: 1;
			margin-right: 5px;

			&:hover {
				.info-copy {
					display: inline-block;
				}
			}

			.info-main {
				font-size: 110%;
			}

			.info-details {
				color: dimgray;
				font-size: 95%;
				margin-top: 5px;
			}

			.info-copy {
				display: none;
				font-size: 90%;
				margin-left: 2px;
			}
		}

		.header-alert {
			margin-right: 5px;

			&.alert-errors {
				color: rgb(179, 73, 46);
				@include dark { color: #ed797a; }
			}

			&.alert-warnings {
				color: rgb(244, 189, 0);
				@include dark { color: #fad89f; }
			}
		}

		.type-text {
			background: hsla(206, 47%, 86%, 1);
			border-radius: 3px;
			color: hsla(205, 29%, 30%, 1);
			font-size: 80%;
			margin-right: 2px;
			padding: 1px 3px;
			vertical-align: 1px;

			@include dark {
				background: hsla(206, 100%, 16%, 1);
				color: hsla(205, 90%, 70%, 1);
			}
		}

		.method-text {
			color: dimgray;
			font-size: 80%;

			@include dark {
				color: rgb(118, 118, 118);
			}
		}

		.status-text {
			background: hsl(76, 47%, 86%);
			border-radius: 8px;
			color: #586336;
			padding: 2px 6px;
			text-transform: uppercase;

			@include dark {
				background: hsla(76, 100%, 11%, 1);
				color: hsla(75, 90%, 80%, 1);
			}

			&.client-error {
				background: #fffae2;
				color: #a85919;

				@include dark {
					background: #382f00;
					color: #fad89f;
				}
			}

			&.server-error {
				background: #ffebeb;
				color: #c51f24;

				@include dark {
					background: #380000;
					color: #ed797a;
				}
			}

			&.status-text-small {
				font-size: 9px;
			}
		}
	}

	.sidebar-content {
		background: #fcfcfd;
		display: flex;
		flex: 1;
		flex-direction: column;
		overflow: auto;

		.content-meta {
			margin-top: auto;
			padding: 10px 0;
			text-align: center;

			.meta-id {
				color: rgb(128, 128, 128);
				margin-top: 4px;

				@include dark { color: rgb(118, 118, 118); }
			}
		}
	}
}
</style>
