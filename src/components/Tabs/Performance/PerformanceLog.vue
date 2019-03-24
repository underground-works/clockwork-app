<template>
	<div class="performance-log">
		<details-table :columns="databaseSlowQueriesColumns" :items="databaseSlowQueries" :filter="databaseSlowQueriesFilter" filter-example="where request_id model:request type:select file:Controller.php duration:&gt;100">
			<template slot="header" slot-scope="{ filter }">
				<th :colspan="databaseSlowQueriesColumns.length">
					Slow database queries <span class="count">{{$request.databaseSlowQueries}}</span>
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`" :class="{ 'database-slow-query': query.tags.includes('slow') }">
					<td>
						<shortened-text :full="query.model">{{query.shortModel}}</shortened-text>
					</td>
					<td v-if="databaseSlowQueriesColumns.includes('Connection')">{{query.connection}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">{{query.query}}</div>
							<stack-trace class="database-query-path" :trace="query.trace" :file="query.file" :line="query.line"></stack-trace>
						</div>
					</td>
					<td class="database-duration">{{query.duration}} ms</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'
import DetailsTableFilterToggle from '../../UI/DetailsTableFilterToggle'
import ShortenedText from '../../UI/ShortenedText'
import StackTrace from '../../UI/StackTrace'

import Filter from '../../../features/filter'

export default {
	name: 'PerformanceLog',
	components: { DetailsTable, DetailsTableFilterToggle, ShortenedText, StackTrace },
	data: () => ({
		databaseSlowQueriesFilter: new Filter([
			{ tag: 'model' },
			{ tag: 'type', apply: (item, tagValue) => {
				if ([ 'select', 'update', 'insert', 'delete' ].includes(tagValue.toLowerCase())) {
					return item.query.match(new RegExp(`^${tagValue.toLowerCase()}`, 'i'))
				}
			} },
			{ tag: 'file', map: item => item.shortPath },
			{ tag: 'duration', type: 'number' }
		])
	}),
	computed: {
		databaseSlowQueriesColumns() {
			let columns = [ 'Model', 'Query', 'Duration' ]

			let hasMultipleConnections = (new Set(this.databaseSlowQueries.map(query => query.connection))).length > 1

			if (hasMultipleConnections) columns.splice(1, 0, 'Connection')

			return columns
		},
		databaseSlowQueries() {
			return this.$request.databaseQueries.filter(query => query.tags.includes('slow'))
		}
	}
}
</script>

<style lang="scss">
.performance-log {
	margin-top: 25px;

	table {
		thead {
			.count {
				background: hsl(27, 48%, 54%);
				color: rgb(255, 250, 226);
				border-radius: 8px;
				margin-left: 2px;
				padding: 0 8px;

				body.dark & {
					background: rgb(250, 216, 159);
					color: hsl(50, 100%, 11%);
				}
			}
		}

		tr {
			background: rgb(255, 250, 226);
			color: rgb(168, 89, 25);

			&:nth-child(even) { background: hsl(50, 100%, 88%); }

			body.dark & {
				background: hsl(50, 100%, 11%);
				color: rgb(250, 216, 159);

				&:nth-child(even) { background: hsl(50, 100%, 9%); }
			}

			&:first-child td {
				border-top: 1px solid hsl(27, 55%, 65%) !important;
				body.dark & { border-top: 1px solid hsl(38, 42%, 68%) !important; }
			}

			.toggle-filter {
				color: hsl(27, 55%, 65%) !important;
				body.dark & { color: hsl(38, 42%, 68%) !important; }
			}

			&.filter {
				background: rgb(255, 250, 226) !important;
				body.dark & { background: hsl(50, 100%, 11%) !important; }

				td {
					border-top: 1px solid hsl(27, 55%, 65%) !important;
					body.dark & { border-top: 1px solid hsl(38, 42%, 68%) !important; }

					.fa-search, input, .example {
						color: hsl(27, 55%, 65%) !important;
						body.dark & { color: hsl(38, 42%, 68%) !important; }
					}
				}
			}
		}
	}
}
</style>
