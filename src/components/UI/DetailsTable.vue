<template>
	<div class="details-table">
		<div class="table-header" v-if="! noHeader">
			<div class="header-title">
				<font-awesome-icon icon="bars"></font-awesome-icon>
				{{title}}
				<span class="title-badge" v-if="badge">{{badge}}</span>
			</div>

			<slot name="toolbar" :filter="filter">
				<div class="header-group">
					<div class="header-search">
						<input type="search" v-model="filter.input" placeholder="Search...">
						<font-awesome-icon icon="search"></font-awesome-icon>
					</div>
				</div>
			</slot>
		</div>

		<table>
			<thead>
				<tr v-if="! noTableHead">
					<slot name="header" :filter="filter">
						<th v-for="column, index in columns" @click="filter.sortBy(column.sortBy || column.toLowerCase())" :class="column.class">
							{{ column.name || column }}
							<font-awesome-icon v-show="filter.sortedBy == (column.sortBy || column.toLowerCase())" :icon="filter.sortedDesc ? 'angle-down' : 'angle-up'"></font-awesome-icon>
						</th>
					</slot>
				</tr>
			</thead>
			<tbody>
				<tr v-if="hasPreviousItems" class="pagination-controls">
					<td :colspan="columns.length">
						<a href="#" @click="showPreviousItems">Show {{previousItemsCount}} previous</a>
					</td>
				</tr>
				<slot name="body" :items="shownItems"></slot>
				<tr v-if="hasNextItems" class="pagination-controls">
					<td :colspan="columns.length">
						<a href="#" @click="showNextItems">Show {{nextItemsCount}} more</a>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import DetailsTableFilterToggle from './DetailsTableFilterToggle'
import PrettyPrint from './PrettyPrint'

export default {
	name: 'DetailsTable',
	components: { DetailsTableFilterToggle, PrettyPrint },
	props: { badge: {}, columns: {}, filter: {}, filterExample: {}, items: {}, noHeader: {}, noTableHead: {}, perPage: { default: 30 }, title: {} },
	data: () => ({
		firstShown: 0
	}),
	computed: {
		filteredItems() {
			return this.filter ? this.filter.filter(this.items) : this.items
		},
		shownItems() {
			if (this.firstShown > this.filteredItems.length) {
				this.firstShown = Math.max(this.filteredItems.length - this.perPage, 0)
			}

			return this.filteredItems.slice(this.firstShown, this.firstShown + this.perPage)
		},
		hasPreviousItems() {
			return this.firstShown > 0
		},
		previousItemsCount() {
			return this.firstShown
		},
		hasNextItems() {
			return this.firstShown + this.perPage < this.filteredItems.length
		},
		nextItemsCount() {
			return this.filteredItems.length - this.perPage - this.firstShown
		},
	},
	methods: {
		showPreviousItems() {
			this.firstShown -= this.perPage
		},
		showNextItems() {
			this.firstShown += this.perPage

			// scroll the first scrollable parent to top of the table
			let firstScrollableParent = this.$el.parentElement
			while (firstScrollableParent && firstScrollableParent.scrollTop == 0) {
				firstScrollableParent = firstScrollableParent.parentElement
			}

			let tableOffsetTop = this.$el.offsetTop - firstScrollableParent.offsetTop - 5
			if (firstScrollableParent && firstScrollableParent.scrollTop > tableOffsetTop) {
				firstScrollableParent.scrollTop = tableOffsetTop
			}
		}
	},
	watch: {
		filteredItems() { this.firstShown = 0 }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.details-table {
	background: hsl(240, 20, 99);
	border-radius: 8px;
	box-shadow: 0 2px 5px rgba(162, 172, 180, 0.25), 0 0 2px rgba(162, 172, 180, 0.5);
	margin-bottom: 20px;
	padding-bottom: 10px;

	@include dark { background: hsl(240, 2, 15); }

	.table-header {
		align-items: center;
		background: #fff;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px 8px 0 0;
		display: flex;
		font-size: 14px;
		justify-content: space-between;
		padding: 8px 8px 8px 12px;

		.header-title {
			flex: 1;
			font-size: 13px;
			font-weight: 600;
			margin-right: 10px;

			.fa-bars {
				color: #111;
				font-size: 85%;
				margin-right: 5px;
			}

			.title-badge {
				background: rgb(37, 140, 219);
				color: #f5f5f5;
				border-radius: 8px;
				margin-left: 4px;
				padding: 0 8px;

				@include dark {
					background: hsl(31, 98%, 44%);
					color: #fff;
				}
			}
		}

		.header-group {
			align-items: center;
			display: flex;
			height: 100%;
			margin-right: 12px;

			&:last-child {
				margin-right: 0;
			}
		}

		.header-item {
			align-items: center;
			border-radius: 4px;
			display: flex;
			height: 24px;
			justify-content: center;
			margin-right: 4px;
			text-decoration: none;
			width: 24px;

			@include dark {
				color: rgb(158, 158, 158);
			}

			&:hover {
				color: rgb(37, 140, 219);

				@include dark {
					color: hsl(31, 98%, 44%);
				}
			}

			&.active {
				background: rgb(37, 140, 219);
				color: #f5f5f5;

				@include dark {
					background: hsl(31, 98%, 44%);
					color: #fff;
				}
			}

			&:last-child {
				margin-right: 0;
			}
		}

		.header-toggle {
			align-items: center;
			background: hsl(30, 1, 96);
			border-radius: 4px;
			display: flex;
			font-size: 95%;
			height: 24px;
			padding: 0 8px;

			@include dark {
				background: hsl(30, 1, 16);
			}

			input {
				margin: 0 5px 0 0;
			}
		}

		.header-search {
			position: relative;

			input {
				background: #eee;
				border: 0;
				border-radius: 4px;
				font-size: 13px;
				height: 24px;
				padding-left: 30px;
				width: 180px;

				@include dark {
					background: rgb(93, 92, 91);
					color: rgb(233, 233, 233);

					&::placeholder {
						color: rgb(167, 166, 165);
						opacity: 1;
					}
				}
			}

			.fa-search {
				left: 7px;
				position: absolute;
				top: 5px;
			}
		}
	}

	table {
		font-size: 12px;

		thead {
			.fa-angle-down, .fa-angle-up {
				font-weight: bold;
				margin-left: 4px;
			}
		}

		tbody {
		}

		tr {
			&:nth-child(even) {
				background: hsl(240, 20, 97);
				@include dark { background: hsl(240, 2, 15); }
			}

			&:nth-child(odd) {
				background: hsl(240, 20, 99);
				@include dark { background: hsl(240, 2, 15); }
			}
		}

		th {
			color: #333;
			font-size: 90%;
			font-weight: 600;
			padding: 8px 0;
			text-align: center;
			white-space: nowrap;
		}

		td {
			padding: 8px 10px;
			vertical-align: top;

			&:first-child { padding-left: 12px; }
			&:last-child { padding-right: 12px; }

			&.key {
				font-size: 12px;
				white-space: nowrap;
			}

			&.value {
				word-break: break-all;
			}
		}
	}

	.pagination-controls {
		background: transparent;

		td {
			text-align: center;
		}

		a {
			color: rgb(37, 140, 219);
			text-decoration: none;

			@include dark { color: hsl(31, 98%, 48%); }
		}
	}
}
</style>