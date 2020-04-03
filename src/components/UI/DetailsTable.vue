<template>
	<table class="details-table">
		<thead>
			<tr v-if="! noHeader">
				<slot name="header" :filter="filter">
					<th v-for="column, index in columns" @click="filter.sortBy(column.sortBy || column.toLowerCase())">
						{{ column.name || column }}
						<font-awesome-icon v-show="filter.sortedBy == (column.sortBy || column.toLowerCase())" :icon="filter.sortedDesc ? 'angle-down' : 'angle-up'"></font-awesome-icon>
						<details-table-filter-toggle :filter="filter" v-if="index == columns.length - 1"></details-table-filter-toggle>
					</th>
				</slot>
			</tr>
			<tr class="filter" v-show="filter.shown">
				<td :colspan="columns.length">
					<label>
						<font-awesome-icon icon="search"></font-awesome-icon>
						<input type="search" placeholder="Filter..." v-model="filter.input" ref="filterInput">
						<span class="example" v-show="! filter.input">eg. {{filterExample}}</span>
					</label>
				</td>
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
</template>

<script>
import DetailsTableFilterToggle from './DetailsTableFilterToggle'
import PrettyPrint from './PrettyPrint'

export default {
	name: 'DetailsTable',
	components: { DetailsTableFilterToggle, PrettyPrint },
	props: { columns: {}, filter: {}, filterExample: {}, items: {}, noHeader: {}, perPage: { default: 30 } },
	data: () => ({
		firstShown: 0
	}),
	computed: {
		filteredItems() {
			return this.filter.filter(this.items)
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
	.pagination-controls {
		background: transparent !important ;

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