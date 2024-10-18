<template>
	<div class="content-request">
		<div class="counters-row">
			<div class="counter request-type" v-if="$request.isCommand() || $request.isQueueJob() || $request.isTest() || $request.isAjax()">
				<template v-if="$request.isCommand()">
					<span class="type-text">CMD</span>
				</template>
				<template v-else-if="$request.isQueueJob()">
					<span class="type-text">QUEUE</span>
				</template>
				<template v-else-if="$request.isTest()">
					<span class="type-text">TEST</span>
				</template>
				<template v-else-if="$request.isAjax()">
					<span class="type-text">AJAX</span>
				</template>
			</div>
			<div class="counter request-main">
				<template v-if="$request.isCommand()">
					{{$request.commandName}}
				</template>
				<template v-else-if="$request.isQueueJob()">
					{{$request.jobName}}
				</template>
				<template v-else-if="$request.isTest()">
					{{$request.testGroup}}
				</template>
				<template v-else>
					<span class="method-text">{{$request.method}}</span> {{$request.uri}}
				</template>
			</div>
			<div class="counter request-details">
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
			<div class="counters-group right-aligned">
				<div class="counter request-alerts" v-if="$request.errorsCount || $request.warningsCount">
					<icon name="alert-circle" class="header-alert alert-errors" v-if="$request.errorsCount"></icon>
					<icon name="alert-triangle" class="header-alert alert-warnings" v-else-if="$request.warningsCount"></icon>
				</div>
				<div class="counter request-status">
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
		</div>
	</div>
</template>

<script>
export default {
	name: 'DetailsRequest'
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.content-request {
	font-size: 130%;
	margin-top: -46px;
    padding: 15px 15px 61px;

    .counters-row {
    	margin-bottom: 0 !important;
    	margin-top: 10px;
    }

	.request-main {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.request-details {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.request-alerts {
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
		background: hsl(206deg 47% 86%);
		border-radius: 3px;
		color: hsl(205deg 29% 30%);
		font-size: 90%;
		padding: 2px 4px;

		@include dark {
			background: hsl(206deg 100% 16%);
			color: hsl(205deg 90% 70%);
		}
	}

	.status-text {
		background: hsl(76deg 47% 86%);
		border-radius: 8px;
		color: #586336;
		font-size: 90%;
		padding: 2px 6px;
		text-transform: uppercase;

		@include dark {
			background: hsl(76deg 100% 11%);
			color: hsl(75deg 90% 80%);
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
	}

	.method-text {
		color: dimgray;
		font-size: 90%;
		margin-right: 8px;

		@include dark {
			color: rgb(118, 118, 118);
		}
	}
}
</style>