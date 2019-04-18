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
	    padding: 10px;
    }

	h3 {
		border-bottom: 1px solid #d1d1d1;
		font-size: 12px;
		font-weight: 600;
		margin: 0;
		padding: 4px 10px;
	}

	table {
		font-size: 11px;
		margin-bottom: 18px;

		thead {
			th:last-child {
				padding-right: 20px;
				position: relative;
			}

			.fa-angle-down, .fa-angle-up {
				font-weight: bold;
				margin-left: 4px;
			}

			.toggle-filter {
				position: absolute;
				right: 4px;
				top: 4px;
				visibility: hidden;
			}

			&:hover {
				.toggle-filter {
					visibility: visible;
				}
			}
		}

		tr {
			&:first-child td {
				border-top: 1px solid rgb(209, 209, 209);

				body.dark & {
					border-top: 1px solid rgb(54, 54, 54);
				}
			}

			&:nth-child(even) {
				background: rgb(245, 245, 245);

				body.dark & {
					background: rgb(27, 27, 27);
				}
			}
		}

		th {
			font-size: 12px;
			font-weight: 600;
			padding: 4px 2px;
			white-space: nowrap;
		}

		td {
			padding: 8px 2px;
			vertical-align: top;

			&.key {
				font-size: 11px;
				white-space: nowrap;
			}

			&.value {
				word-break: break-all;
			}
		}

		.filter {
			background: none !important;

			td {
				border-top: 1px solid #d1d1d1;
				padding: 2px 10px;

				body.dark & {
					border-top: 1px solid rgb(54, 54, 54);
				}
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
	}
}
</style>
