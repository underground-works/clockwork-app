<template>
	<div :class="{ 'split-view-pane split-view-requests': true, 'large': $settings.global.requestSidebarCollapsed }" class="popover-viewport">
		<div class="requests-header" id="requests-header">
			<table>
				<thead>
					<tr>
						<th class="controller">
							Path<br><small>Controller</small>
						</th>
						<th class="status">
							Status
						</th>
						<th class="duration">
							Time<br><small v-if="showDatabaseTime">Database</small>
						</th>
					</tr>
				</thead>
			</table>
		</div>
		<div class="requests-container" ref="requestsContainer">
			<div class="requests-content">
				<div class="content-above" ref="contentAbove">
					<div class="requests-search">
						<input type="search" v-model="$requestsSearch.input" @input="$requestsSearch.searchDebounced" placeholder="Search...">
						<icon name="search"></icon>
					</div>

					<a href="#" class="button" @click.prevent="loadMoreRequests">
						{{loadingMoreRequests ? 'Loading...' : 'Load more'}}
					</a>
				</div>

				<div class="requests-table" ref="requestsTable">
					<table id="requests">
						<tr v-for="request in requests" :key="request.id" @click="showRequest(request)" :class="{ selected: isActive(request.id) }">
							<td class="controller" :title="request.tooltip">
								<big>
									<icon name="alert-circle" class="request-alert alert-errors" v-if="request.errorsCount"></icon>
									<icon name="alert-triangle" class="request-alert alert-warnings" v-else-if="request.warningsCount"></icon>

									<template v-if="request.isCommand()">
										<span class="type-text">CMD</span>
										{{request.commandName}}
									</template>
									<template v-else-if="request.isQueueJob()">
										<span class="type-text">QUEUE</span>
										{{request.jobName}}
									</template>
									<template v-else-if="request.isTest()">
										<span class="type-text">TEST</span>
										{{request.testGroup}}
									</template>
									<template v-else>
										<span v-if="request.isAjax()" class="type-text">AJAX</span>
										<span class="method-text">{{request.method}}</span> {{request.uri}}
									</template>
								</big>
								<br>
								<template v-if="request.isCommand()">
									<small>{{request.commandLine}}</small>
								</template>
								<template v-else-if="request.isQueueJob()">
									<small>{{request.jobDescription}}</small>
								</template>
								<template v-else-if="request.isTest()">
									<small>{{request.testName}}</small>
								</template>
								<template v-else>
									<small v-if="$settings.global.requestSidebarCollapsed">{{request.controller}}</small>
									<small v-else>{{request.controller | shortClass}}</small>
								</template>
							</td>
							<template v-if="request.isCommand()">
								<td class="status" :title="request.commandExitCode">
									<span :class="{ 'status-text': true, 'client-error': request.isCommandWarning(), 'server-error': request.isCommandError() }">{{request.commandExitCode}}</span>
								</td>
							</template>
							<template v-else-if="request.isQueueJob()">
								<td class="status" :title="request.jobStatus">
									<span :class="{ 'status-text': true, 'status-text-small': true, 'client-error': request.isQueueJobWarning(), 'server-error': request.isQueueJobError() }">{{request.jobStatus}}</span>
								</td>
							</template>
							<template v-else-if="request.isTest()">
								<td class="status" :title="request.testStatus">
									<span :class="{ 'status-text': true, 'status-text-small': true, 'client-error': request.isTestWarning(), 'server-error': request.isTestError() }">{{request.testStatus}}</span>
								</td>
							</template>
							<template v-else>
								<td class="status" :title="request.responseStatus">
									<span :class="{ 'status-text': true, 'client-error': request.isClientError(), 'server-error': request.isServerError() }">{{request.responseStatus}}</span>
								</td>
							</template>
							<td class="duration" :title="`${request.responseDurationRounded} ms (${request.databaseDurationRounded} ms)`">
								{{request.responseDurationRounded}} ms<br>
								<small v-if="showDatabaseTime">{{request.databaseDurationRounded}} ms</small>
							</td>
						</tr>
					</table>
				</div>

				<a href="#" class="button requests-clear" @click.prevent="clear">
					<icon name="slash"></icon>
					Clear
				</a>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'RequestsList',
	components: { },
	data: () => ({
		loadingMoreRequests: false
	}),
	computed: {
		requests() {
			let requests = this.$requests.items

			if (this.$settings.global.hideCommandTypeRequests) {
				requests = requests.filter(request => request.type != 'command')
			}

			if (this.$settings.global.hideQueueJobTypeRequests) {
				requests = requests.filter(request => request.type != 'queue-job')
			}

			if (this.$settings.global.hideTestTypeRequests) {
				requests = requests.filter(request => request.type != 'test')
			}

			return requests
		},

		showDatabaseTime() {
			return this.requests.find(request => request.databaseDuration > 0)
		}
	},
	mounted() {
		this.$refs.requestsContainer.scrollTop = this.$refs.requestsTable.offsetTop
	},
	methods: {
		isActive(id) { return this.$request?.id == id },
		showRequest(request) {
			this.global.$request = request
		},
		loadMoreRequests() {
			this.loadingMoreRequests = true

			this.$requests.loadPrevious(10).then(() => {
				this.loadingMoreRequests = false
			})
		},
		shouldShowFirstRequest() {
			return ! this.$settings.global.preserveLog
				&& (! this.$request || ! this.$requests.findId(this.$request.id))
		},
		shouldShowIncomingRequest() {
			return this.$settings.global.preserveLog
				&& (! this.$request || (this.$settings.global.showIncomingRequests && this.global.showIncomingRequests))
		},
		clear() { this.$requests.clear() }
	},
	watch: {
		requests: {
			handler(items) {
				if (this.shouldShowFirstRequest()) {
					this.showRequest(this.$requests.first())
				} else if (this.shouldShowIncomingRequest()) {
					this.showRequest(this.$requests.last(request => ! request.isAjax()) || this.$requests.last())
					this.$refs.requestsContainer.scrollTop = this.$refs.requestsTable.offsetHeight + this.$refs.requestsTable.offsetTop
				}
			},
			deep: true
		},

		$request: {
			handler(request) {
				if (this.$request?.error?.error == 'requires-authentication') {
					this.$authentication.request(this.$request.error.message, this.$request.error.requires)
				}

				let lastPageRequest = this.$requests.last(request => ! request.isAjax()) || this.$requests.last()
				let lastPageRequestIndex = this.$requests.all().indexOf(lastPageRequest)
				this.global.showIncomingRequests = this.$requests.all().slice(lastPageRequestIndex).includes(request)
			}
		},

		'$request.loading': {
			handler(loading) {
				if (loading) return

				if (this.$request?.error?.error == 'requires-authentication') {
					this.$authentication.request(this.$request.error.message, this.$request.error.requires)
				}
			}
		}
	}
}
</script>

<style lang="scss">
@import '../mixins.scss';

.split-view-requests {
	background: hsl(240, 20, 98%);
	border-bottom: 1px solid rgb(209, 209, 209);
	cursor: default;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	height: 25%;
	width: 100%;

	@include dark {
		background: #1b1b1b;
		border-bottom: 1px solid hsl(240, 17%, 20%);
	}

	@media screen and (min-width: 900px) {
		border-bottom: 0;
		border-right: 1px solid hsl(240, 20, 85);
		height: 100%;
		width: 300px;

		@include dark { border-right: 1px solid hsl(240, 17%, 20%); }
		&.large { width: 380px; }
	}

	@media screen and (min-width: 1100px) {
		width: 320px;
	}

	table {
		line-height: 1.4;
		table-layout: fixed;
	}

	tr {
		&:first-child td {
			border-top: 1px solid transparent;

			@include dark { border-top: 1px solid transparent; }
		}

		&.selected {
			td {
				background: rgb(39, 134, 243) !important;
				border-top: 1px solid transparent;
				color: white;

				@include dark { background: hsl(31, 98%, 42%) !important; }
			}

			& + tr td {
				border-top: 1px solid transparent;
			}

			small {
				color: white;

				@include dark { color: white; }
			}

			.method-text {
				color: white;

				@include dark { color: white; }
			}

			.status-text, .type-text {
				background: transparent;
				color: #fff;

				@include dark {
					background: transparent;
					color: #fff;
				}
			}

			.request-alert {
				color: #fff;
				@include dark { color: #fff; }
			}
		}

		td {
			border-top: 1px solid hsl(0, 0, 94%);

			@include dark {
				border-top: 1px solid #242424;
			}

			&:first-child { border-radius: 6px 0 0 6px; }
			&:last-child { border-radius: 0 6px 6px 0; }
		}
	}

	th {
		color: #333;
	    font-size: 90%;
	    font-weight: 600;
		height: 30px;
		line-height: 1.1;
	    padding: 8px;
		white-space: nowrap;

		@include dark {
			color: #b2b2b2;
		}
	}

	td {
		overflow: hidden;
		padding: 7px 6px 8px;
		vertical-align: middle;
		white-space: nowrap;
	}

	small {
		color: rgb(128, 128, 128);
		font-size: 100%;

		@include dark {
			color: rgb(118, 118, 118);
		}
	}

	big {
		font-size: 115%;
	}

	.status {
		text-align: center;
		width: 52px;
	}

	.duration {
		text-align: right;
		width: 68px;
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
		color: gray;
		font-size: 90%;

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

	.request-alert {
		font-size: 90%;
		margin-right: 4px;

		&.alert-errors {
			color: rgb(179, 73, 46);
			@include dark { color: #ed797a; }
		}

		&.alert-warnings {
			color: rgb(244, 189, 0);
			@include dark { color: #fad89f; }
		}
	}

	.requests-header {
		padding: 2px 4px;
	}

	.requests-search {
		font-size: 14px;
		margin-bottom: 10px;
		position: relative;

		input {
			background: #eee;
			border: 0;
			border-radius: 4px;
			font-size: 13px;
			height: 24px;
			padding-left: 28px;
			width: 100%;

			@include dark {
				background: rgb(63, 62, 61);
				color: rgb(233, 233, 233);

				&::placeholder {
					color: rgb(167, 166, 165);
					opacity: 1;
				}
			}
		}

		.ui-icon {
			left: 7px;
			position: absolute;
			top: 5px;
		}
	}

	.requests-container {
		height: calc(100% - 31px);
		overflow: auto;
		padding: 5px;
	}

	.requests-content {
		display: flex;
		flex-direction: column;
		min-height: calc(100% + 69px);

		.content-above {
			padding-top: 2px;

			.button {
				font-size: 13px;
			}
		}
	}

	.requests-table {
		margin-bottom: auto;
		margin-top: 10px;
	}

	.requests-clear {
		font-size: 13px;
		margin-bottom: 5px;
		margin-top: 5px;
	}
}
</style>
