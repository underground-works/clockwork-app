<template>
	<table>
		<thead>
			<tr>
				<slot name="header" :filter="filter">
					<th v-for="column, index in columns" @click="filter.sortBy(column.sortBy || column.toLowerCase())">
						{{ column.name || column }}
						<font-awesome-icon v-show="filter.sortedBy == (column.sortBy || column.toLowerCase())" :icon="filter.sortedDesc ? 'angle-down' : 'angle-up'"></font-awesome-icon>
						<details-table-filter-toggle :filter="filter" v-if="index == columns.length - 1"></details-table-filter-toggle>
					</th>
				</slot>
			</tr>
			<tr class="filter" v-show="filter.shown">
				<td :colspan="columns ? columns.length : 2">
					<label>
						<font-awesome-icon icon="search"></font-awesome-icon>
						<input type="search" placeholder="Filter..." v-model="filter.input" ref="filterInput">
						<span class="example" v-show="! filter.input">eg. {{filterExample}}</span>
					</label>
				</td>
			</tr>
		</thead>
		<tbody>
			<slot name="body" :items="filter.filter(items)"></slot>
		</tbody>
	</table>
</template>

<script>
import DetailsTableFilterToggle from './DetailsTableFilterToggle'
import PrettyPrint from './PrettyPrint'

export default {
	name: 'DetailsTable',
	components: { DetailsTableFilterToggle, PrettyPrint },
	props: [ 'columns', 'filter', 'filterExample', 'items' ]
}
</script>
