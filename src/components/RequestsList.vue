<template>
	<div :class="{ 'split-view-pane split-view-requests': true, 'large': $settings.global.requestSidebarCollapsed }">
		<table class="requests-header" id="requests-header">
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
		<div class="requests-search" v-show="$requestsSearch.shown">
			<label>
				<font-awesome-icon icon="search"></font-awesome-icon>
				<input type="search" placeholder="Search..." v-model="$requestsSearch.input" @input="$requestsSearch.searchDebounced">
				<span class="example" v-show="! $requestsSearch.input">eg. /api/users method:post status:500</span>
			</label>
		</div>
		<div class="requests-container" ref="requestsContainer">
			<div class="load-more" ref="loadMore">
				<p class="load" v-show="! loadingMoreRequests">
					<a href="#" @click="loadMoreRequests">load more</a>
				</p>
				<p class="loading" v-show="loadingMoreRequests">
					loading...
				</p>
			</div>
			<table id="requests" ref="requestsTable">
				<tr class="sizing">
					<td class="controller"></td>
					<td class="status"></td>
					<td class="duration"></td>
				</tr>
				<tr v-for="request in requests" :key="request.id" @click="showRequest(request)" :class="{ selected: isActive(request.id) }">
					<td class="controller" :title="request.tooltip">
						<div class="notifications-count">
							<span class="warnings-count" v-show="request.warningsCount">
								<font-awesome-icon icon="exclamation-triangle"></font-awesome-icon> {{request.warningsCount}}
							</span>
							<span class="errors-count" v-show="request.errorsCount">
								<font-awesome-icon icon="exclamation-circle"></font-awesome-icon> {{request.errorsCount}}
							</span>
						</div>
						<big>
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
				<tr class="filler">
					<td class="controller"></td>
					<td class="status"></td>
					<td class="duration"></td>
				</tr>
			</table>
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
		this.$refs.requestsContainer.scrollTop = this.$refs.loadMore.offsetHeight + 1
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
		}
	},
	watch: {
		requests: {
			handler(items) {
				if (this.shouldShowFirstRequest()) {
					this.showRequest(this.$requests.first())
				} else if (this.shouldShowIncomingRequest()) {
					this.showRequest(this.$requests.last(request => ! request.isAjax()) || this.$requests.last())
					this.$refs.requestsContainer.scrollTop = this.$refs.requestsTable.offsetHeight
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
	border-bottom: 1px solid rgb(209, 209, 209);
	cursor: default;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	height: 25%;
	width: 100%;

	@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

	&.large {
		.notifications-count {
			flex-direction: row;

			.errors-count {
				margin-left: 5px;

				svg { margin-right: 0; }
			}
		}
	}

	@media screen and (min-width: 900px) {
		border-bottom: 0;
		border-right: 1px solid rgb(209, 209, 209);
		height: 100%;
		width: 300px;

		@include dark { border-right: 1px solid rgb(54, 54, 54); }
		&.large { width: 400px; }
	}

	@media screen and (min-width: 1100px) {
		width: 320px;

		&.large { width: 420px; }
	}

	table {
		line-height: 1.4;
		table-layout: fixed;
	}

	tr {
		height: 28px;

		&:first-child td {
			border-top: 1px solid rgb(209, 209, 209);

			@include dark { border-top: 1px solid rgb(54, 54, 54); }
		}

		&:nth-child(even):not(.filler) {
			background: rgb(243, 243, 243);

			@include dark { background: rgb(24, 24, 24); }

			.notifications-count {
				background: rgba(243, 243, 243, 0.8);

				@include dark { background: rgba(27, 27, 27, 0.8); }
			}
		}

		&.selected {
			td {
				background: rgb(39, 134, 243) !important;
				color: white;

				@include dark { background: hsl(31, 98%, 48%) !important; }
			}

			small {
				color: white;

				@include dark { color: white; }
			}

			.notifications-count {
				background: rgb(39, 134, 243) !important;

				.errors-count, .warnings-count, .warnings-count svg {
					color: #fff;

					@include dark { color: #fff; }
				}

				@include dark { background: hsl(31, 98%, 48%) !important; }
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
		}

		&.sizing {
			height: 0;

			td {
				border-top: 0;
				padding: 0;

				@include dark {
					border-top: 0;
				}
			}
		}

		&.filler {
			height: auto;
		}
	}

	th {
		border-bottom: 1px solid rgb(209, 209, 209);
		font-weight: normal;
		height: 30px;
		line-height: 1.1;
		padding: 2px 4px;
		white-space: nowrap;

		@include dark {
			border-bottom: 1px solid rgb(54, 54, 54);
		}
	}

	td {
		overflow: hidden;
		padding: 8px 6px;
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

	.notifications-count {
		align-items: center;
		background: hsla(0, 0%, 98%, 0.8);
		display: flex;
		flex-direction: column;
		float: right;
		height: 100%;
	    justify-content: center;
		letter-spacing: -0.5px;
	    margin-right: -6px;
	    padding: 0 6px;
		position: relative;

		.errors-count {
			color: rgb(179, 73, 46);

			@include dark { color: #ed797a; }

			svg { margin-right: 1px; }
		}

		.warnings-count {
			color: #a85919;

			@include dark { color: #fad89f; }

			svg {
				color: rgb(244, 189, 0);

				@include dark { color: #fad89f; }
			}
		}

		@include dark {
			background: rgba(#1b1b1b, 0.8);
		}
	}

	.requests-header {
		height: 31px;
	}

	.requests-search {
		border-bottom: 1px solid #d1d1d1;
		padding: 6px 2px;

		@include dark {
			border-bottom: 1px solid rgb(54, 54, 54);
		}

		label {
			align-items: center;
			display: flex;
			position: relative;
		}

		.fa-search {
			color: #696969;
			margin: 0 4px;
		}

		input {
			background: transparent;
			border: none;
			width: 100%;

			&:focus {
				outline: none;
			}

			&::placeholder {
				color: #a9a9a9;

				@include dark {
					color: #777;
				}
			}

			@include dark {
				color: #b2b2b2;
			}
		}

		.example {
			color: #a9a9a9;
			font-size: 11px;
			pointer-events: none;
			position: absolute;
			right: 0;

			@include dark {
				color: #777;
			}
		}
	}

	.requests-container {
		background: hsl(0, 0%, 98%);
		height: calc(100% - 31px);
		overflow: auto;

		table {
			height: 100%;
		}

		@include dark {
			background: #1b1b1b;
		}
	}

	.load-more {
		align-items: center;
		border-bottom: 1px solid rgb(209, 209, 209);
		display: flex;
		height: 36px;
		justify-content: center;

		@include dark {
			border-bottom: 1px solid rgb(54, 54, 54);
		}

		a {
			color: rgb(64, 64, 64);
			text-decoration: none;

			&:hover {
				color: rgb(37, 140, 219);

				@include dark {
					color: hsl(31, 98%, 48%);
				}
			}

			@include dark {
				color: rgb(178, 178, 178);
			}
		}
	}
}
</style>
