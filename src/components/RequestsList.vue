<template>
	<div class="split-view-pane split-view-requests">
		<table class="requests-header" id="requests-header">
			<thead>
				<tr>
					<th class="controller">
						Path<br><small>Controller</small>
					</th>
					<th class="method">
						Method
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
					<td class="method"></td>
					<td class="status"></td>
					<td class="duration"></td>
				</tr>
				<tr v-for="request in $requests.items" :key="request.id" @click="showRequest(request)" :class="{ selected: isActive(request.id) }">
					<td class="controller" :title="`${request.uri} (${request.controller})`">
						<span class="notifications-count">
							<span class="errors-count" v-show="request.errorsCount">
								<font-awesome-icon icon="exclamation-circle"></font-awesome-icon> {{request.errorsCount}}
							</span>
							<span class="warnings-count" v-show="request.warningsCount">
								<font-awesome-icon icon="exclamation-triangle"></font-awesome-icon> {{request.warningsCount}}
							</span>
						</span>
						{{request.uri}}<br>
						<small>{{request.controller}}</small>
					</td>
					<td class="method" :title="request.method">
						{{request.method}}
					</td>
					<td class="status" :title="request.responseStatus">
						{{request.responseStatus}}
					</td>
					<td class="duration" :title="`${request.responseDurationRounded} ms (${request.databaseDurationRounded} ms)`">
						{{request.responseDurationRounded}} ms<br>
						<small>{{request.databaseDurationRounded}} ms</small>
					</td>
				</tr>
				<tr class="filler">
					<td class="controller"></td>
					<td class="method"></td>
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
	cursor: default;

	table {
		line-height: 1.4;
		table-layout: fixed;
	}

	tr {
		height: 28px;

		&:first-child td {
			border-top: 1px solid rgb(209, 209, 209);

			body.dark & {
				border-top: 1px solid rgb(54, 54, 54);
			}
		}

		&:nth-child(even):not(.filler) {
			background: rgb(243, 243, 243);

			body.dark & {
				background: rgb(24, 24, 24);
			}

			td.method, td.status, td.duration {
				background: rgb(225, 225, 225);

				body.dark & {
					background: rgb(17, 17, 17);
				}
			}

			.notifications-count {
				background: rgba(243, 243, 243, 0.8);

				body.dark & {
					background: rgba(27, 27, 27, 0.8);
				}
			}
		}

		&.selected {
			td {
				background: rgb(39, 134, 243) !important;
				color: white;

				body.dark & {
					background: hsl(31, 98%, 48%) !important;
				}
			}

			small {
				color: white;

				body.dark & {
					color: white;
				}
			}

			.notifications-count {
				background: rgb(39, 134, 243) !important;

				.errors-count svg, .warnings-count svg {
					color: #fff;
				}

				body.dark & {
					background: hsl(31, 98%, 48%) !important;
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
		border-right: 1px solid rgb(209, 209, 209);
		font-weight: normal;
		height: 30px;
		line-height: 1.1;
		padding: 2px 4px;
		white-space: nowrap;

		body.dark & {
			border-bottom: 1px solid rgb(54, 54, 54);
			border-right: 1px solid rgb(54, 54, 54);
		}
	}

	td {
		border-right: 1px solid rgb(209, 209, 209);
		overflow: hidden;
		padding: 8px 6px;
		vertical-align: middle;
		white-space: nowrap;

		&.method, &.status, &.duration {
			background: rgb(237, 237, 237);

			body.dark & {
				background: rgb(29, 29, 29);
			}
		}

		body.dark & {
			border-right: 1px solid rgb(54, 54, 54);
		}
	}

	small {
		color: rgb(128, 128, 128);
		font-size: 100%;

		body.dark & {
			color: rgb(118, 118, 118);
		}
	}

	.method, .status {
		text-align: center;
		width: 50px;
	}

	.duration {
		text-align: right;
		width: 80px;
	}

	.notifications-count {
		background: rgba(255, 255, 255, 0.8);
		float: right;
		letter-spacing: -0.5px;
		line-height: 29px;
	    margin-right: -6px;
	    padding: 0 6px;
		position: relative;

		.errors-count svg {
			color: rgb(179, 73, 46);
			margin-left: 2px;
		}

		.warnings-count svg {
			color: rgb(244, 189, 0);
			margin-left: 2px;
		}

		body.dark & {
			background: rgba(31, 31, 31, 0.8);
		}
	}

	.requests-header {
		height: 31px;
	}

	.requests-container {
		height: calc(100% - 31px);
		overflow: auto;

		table {
			height: 100%;
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
