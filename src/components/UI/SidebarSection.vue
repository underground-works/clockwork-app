<template>
	<div class="sidebar-section">
		<div class="section-header">
			<span class="section-title" @click="toggle">
				{{ title }}
				<font-awesome-icon :icon="expanded ? 'angle-down' : 'angle-up'"></font-awesome-icon>
			</span>
			<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
		</div>
		<slot name="content" :expanded="expanded">
			<div v-show="expanded">
				<slot name="above-table"></slot>
			</div>
			<slot name="table" :items="items" :filter="filter" :filter-example="filterExample" :expanded="expanded">
				<details-table :columns="['Key', 'Value']" :items="items" :filter="filter" :filter-example="filterExample" :no-header="true" v-show="expanded">
					<template slot="body" slot-scope="{ items }">
						<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
							<td colspan="2">
								<div class="key">{{item.name}}</div>
								<div class="value"><pretty-print :data="item.value"></pretty-print></div>
							</td>
						</tr>
					</template>
				</details-table>
			</slot>
		</slot>
	</div>
</template>

<script>
import DetailsTable from './DetailsTable'
import DetailsTableFilterToggle from './DetailsTableFilterToggle'
import PrettyPrint from './PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'SidebarSection',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint },
	props: [ 'title', 'name', 'filterExample', 'items' ],
	data: () => ({
		filter: new Filter([ { tag: 'name' } ])
	}),
	computed: {
		expanded() {
			return this.$settings.global.requestSidebarCollapsedSections[this.name] !== false
		}
	},
	methods: {
		toggle() {
			this.$settings.global.requestSidebarCollapsedSections[this.name] = ! this.expanded
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.sidebar-section {
	.section-header {
		align-items: center;
		border-bottom: 1px solid rgb(209, 209, 209);
		display: flex;
		font-weight: bold;
		padding: 5px 10px;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

		.section-title {
			cursor: default;
		}

		.toggle-filter {
			display: none;
			margin-left: auto;
		}

		&:hover {
			.toggle-filter { display: block; }
		}
	}

	table {
		border-bottom: 1px solid rgb(209, 209, 209);
		font-size: 11px;
		margin-bottom: 0;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

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
				border-top: 0;

				@include dark {
					border-top: 0;
				}
			}

			&:nth-child(even) {
				background: rgb(245, 245, 245);

				@include dark {
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
			padding: 8px 10px;
			vertical-align: top;

			.key {
				font-size: 11px;
				font-weight: 600;
				margin-bottom: 3px;
				white-space: nowrap;
			}

			.value {
				word-break: break-all;
			}
		}

		.filter {
			background: none !important;

			td {
				border-bottom: 1px solid #d1d1d1;
				border-top: 0;
				padding: 2px 10px;

				@include dark {
					border-bottom: 1px solid rgb(54, 54, 54);
					border-top: 0;
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
	}
}
</style>
