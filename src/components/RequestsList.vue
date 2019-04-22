<template>
	<div :class="{ 'split-view-pane split-view-requests': true, 'large': $store.data.requestSidebarCollapsed }">
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
						Time<br><small>Database</small>
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
				<tr v-for="request in $requests.items" :key="request.id" @click="showRequest(request)" :class="{ selected: isActive(request.id) }">
					<td class="controller" :title="`${request.method} ${request.uri} (${request.controller})`">
						<div class="notifications-count">
							<span class="warnings-count" v-show="request.warningsCount">
								<font-awesome-icon icon="exclamation-triangle"></font-awesome-icon> {{request.warningsCount}}
							</span>
							<span class="errors-count" v-show="request.errorsCount">
								<font-awesome-icon icon="exclamation-circle"></font-awesome-icon> {{request.errorsCount}}
							</span>
						</div>
						<big><span class="method-text">{{request.method}}</span> {{request.uri}}</big><br>
						<small>{{request.controller}}</small>
					</td>
					<td class="status" :title="request.responseStatus">
						<span :class="{ 'status-text': true, 'client-error': request.isClientError(), 'server-error': request.isServerError() }">{{request.responseStatus}}</span>
					</td>
					<td class="duration" :title="`${request.responseDurationRounded} ms (${request.databaseDurationRounded} ms)`">
						{{request.responseDurationRounded}} ms<br>
						<small>{{request.databaseDurationRounded}} ms</small>
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
		requests () { return this.$requests.items }
	},
	mounted () {
		this.$refs.requestsContainer.scrollTop = this.$refs.loadMore.offsetHeight + 1
	},
	methods: {
		isActive: function (id) { return this.$request?.id == id },
		showRequest: function (request) {
			this.global.$request = request

			if (this.$request?.error?.error == 'requires-authentication') {
				this.$authentication.request(this.$request.error.message, this.$request.error.requires)
			}

			this.global.showIncomingRequests = request == this.$requests.last()
		},
		loadMoreRequests: function () {
			this.loadingMoreRequests = true

			this.$requests.loadPrevious(10).then(() => {
				this.loadingMoreRequests = false
			})
		}
	},
	watch: {
		requests: { handler: function (items) {
			if (! this.global.preserveLog) {
				this.showRequest(this.global.$requests.first())
			} else if (this.global.showIncomingRequests) {
				this.showRequest(this.global.$requests.last())
				this.$refs.requestsContainer.scrollTop = this.$refs.requestsTable.offsetHeight
			}
		}, deep: true }
	}
}
</script>

<style lang="scss">
.split-view-requests {
	border-bottom: 1px solid rgb(209, 209, 209);
	cursor: default;
	display: flex;
	flex-direction: column;
	height: 25%;
	width: 100%;

	body.dark & { border-bottom: 1px solid rgb(54, 54, 54); }

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

		body.dark & { border-right: 1px solid rgb(54, 54, 54); }
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

			body.dark & { border-top: 1px solid rgb(54, 54, 54); }
		}

		&:nth-child(even):not(.filler) {
			background: rgb(243, 243, 243);

			body.dark & { background: rgb(24, 24, 24); }

			.notifications-count {
				background: rgba(243, 243, 243, 0.8);

				body.dark & { background: rgba(27, 27, 27, 0.8); }
			}
		}

		&.selected {
			td {
				background: rgb(39, 134, 243) !important;
				color: white;

				body.dark & { background: hsl(31, 98%, 48%) !important; }
			}

			small {
				color: white;

				body.dark & { color: white; }
			}

			.notifications-count {
				background: rgb(39, 134, 243) !important;

				.errors-count, .warnings-count, .warnings-count svg {
					color: #fff;

					body.dark & { color: #fff; }
				}

				body.dark & { background: hsl(31, 98%, 48%) !important; }
			}

			.method-text {
				color: white;

				body.dark & { color: white; }
			}

			.status-text {
				background: transparent;
				color: #fff;

				body.dark & {
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

				body.dark & {
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

		body.dark & {
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

		body.dark & {
			color: rgb(118, 118, 118);
		}
	}

	big {
		font-size: 115%;
	}

	.method, .status {
		text-align: center;
		width: 42px;
	}

	.duration {
		text-align: right;
		width: 68px;
	}

	.method-text {
		color: gray;
		font-size: 90%;

		body.dark & {
			color: rgb(118, 118, 118);
		}
	}

	.status-text {
		background: hsl(76, 47%, 86%);
		border-radius: 8px;
		color: #586336;
		padding: 2px 6px;

		body.dark & {
			background: hsla(76, 100%, 11%, 1);
		    color: hsla(75, 90%, 80%, 1);
		}

		&.client-error {
			background: #fffae2;
			color: #a85919;

			body.dark & {
			    background: #382f00;
			    color: #fad89f;
			}
		}

		&.server-error {
			background: #ffebeb;
			color: #c51f24;

			body.dark & {
				background: #380000;
				color: #ed797a;
			}
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

			body.dark & { color: #ed797a; }

			svg { margin-right: 1px; }
		}

		.warnings-count {
			color: #a85919;

			body.dark & { color: #fad89f; }

			svg {
				color: rgb(244, 189, 0);

				body.dark & { color: #fad89f; }
			}
		}

		body.dark & {
			background: rgba(#1b1b1b, 0.8);
		}
	}

	.requests-header {
		height: 31px;
	}

	.requests-search {
		border-bottom: 1px solid #d1d1d1;
		padding: 6px 2px;

		body.dark & {
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

				body.dark & {
					color: #777;
				}
			}

			body.dark & {
				color: #b2b2b2;
			}
		}

		.example {
			color: #a9a9a9;
			font-size: 11px;
			pointer-events: none;
			position: absolute;
			right: 0;

			body.dark & {
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

		body.dark & {
			background: #1b1b1b;
		}
	}

	.load-more {
		align-items: center;
		border-bottom: 1px solid rgb(209, 209, 209);
		border-right: 1px solid rgb(209, 209, 209);
		display: flex;
		height: 36px;
		justify-content: center;

		body.dark & {
			border-bottom: 1px solid rgb(54, 54, 54);
			border-right: 1px solid rgb(54, 54, 54);
		}

		a {
			color: rgb(64, 64, 64);
			text-decoration: none;

			&:hover {
				color: rgb(37, 140, 219);

				body.dark & {
					color: hsl(31, 98%, 48%);
				}
			}

			body.dark & {
				color: rgb(178, 178, 178);
			}
		}
	}
}
</style>
