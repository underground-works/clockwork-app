<template>
	<div class="sidebar-section">
		<div class="section-header">
			<span class="section-title" @click="toggle">
				{{ title }}
				<font-awesome-icon :icon="expanded ? 'angle-down' : 'angle-up'"></font-awesome-icon>
			</span>
			<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
		</div>
		<slot name="content" :items="items">
			<details-table :items="items" :filter="filter" :filter-example="filterExample" v-show="expanded">
				<template slot="header" slot-scope="{ filter }">
				</template>
				<template slot="body" slot-scope="{ items }">
					<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
						<td class="key">{{item.name}}</td>
						<td class="value"><pretty-print :data="item.value"></pretty-print></td>
					</tr>
				</template>
			</details-table>
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
	props: [ 'title', 'filterExample', 'items' ],
	data: () => ({
		expanded: true,
		filter: new Filter([ { tag: 'name' } ])
	}),
	methods: {
		toggle: function () { this.expanded = ! this.expanded }
	}
}
</script>

<style lang="scss">
.sidebar-section {
	.section-header {
		align-items: center;
		border-bottom: 1px solid rgb(209, 209, 209);
		display: flex;
		font-weight: bold;
		padding: 5px 10px;

		body.dark & { border-bottom: 1px solid rgb(54, 54, 54); }

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

		body.dark & { border-bottom: 1px solid rgb(54, 54, 54); }

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

				body.dark & {
					border-top: 0;
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
			padding: 8px 10px;
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
				border-bottom: 1px solid #d1d1d1;
				border-top: 0;
				padding: 2px 10px;

				body.dark & {
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
