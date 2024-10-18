<template>
	<div class="performance-log">
		<details-table title="Performance issues" icon="alert-triangle" :badge="issues.length" :columns="['Message']" :items="issues" :filter="performanceLogFilter" filter-example="query failed file:Controller.php time:>13:08:29" :no-table-head="true" v-if="issues.length">
			<template v-slot:body="{ items }">
				<tr v-for="message, index in items" class="log-row" :key="`${$request.id}-${index}`">
					<td>
						<div class="log-message">
							<div class="log-message-content">
								<pretty-print :data="message.message"></pretty-print>
								<div v-if="message.context && message.context.length">
									<pretty-print :data="message.context"></pretty-print>
								</div>
							</div>
							<stack-trace class="log-message-path" :trace="message.trace" :file="message.file" :line="message.line"></stack-trace>
						</div>
					</td>
				</tr>
			</template>
		</details-table>

		<details-table title="Slow database queries" icon="database" :badge="slowQueries.length" :columns="databaseSlowQueriesColumns" :items="slowQueries" :filter="databaseSlowQueriesFilter" filter-example="where request_id model:request type:select file:Controller.php duration:&gt;100" v-if="slowQueries.length">
			<template v-slot:body="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`">
					<td>
						<shortened-text :full="query.model">{{query.shortModel}}</shortened-text>
					</td>
					<td v-if="databaseSlowQueriesColumns.includes('Connection')">{{query.connection}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<highlighted-code language="sql" :code="query.query"></highlighted-code>
							</div>
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
import HighlightedCode from '../../UI/HighlightedCode'
import PrettyPrint from '../../UI/PrettyPrint'
import ShortenedText from '../../UI/ShortenedText'
import StackTrace from '../../UI/StackTrace'

import createFilter from '../../../features/filter'

export default {
	name: 'PerformanceLog',
	components: { DetailsTable, DetailsTableFilterToggle, HighlightedCode, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'issues', 'slowQueries' ],
	data: () => ({
		databaseSlowQueriesFilter: createFilter([
			{ tag: 'model' },
			{ tag: 'type', apply: (item, tagValue) => {
				if ([ 'select', 'update', 'insert', 'delete' ].includes(tagValue.toLowerCase())) {
					return item.query.match(new RegExp(`^${tagValue.toLowerCase()}`, 'i'))
				}
			} },
			{ tag: 'file', map: item => item.shortPath },
			{ tag: 'duration', type: 'number' }
		]),
		performanceLogFilter: createFilter([
			{ tag: 'time', type: 'date' },
			{ tag: 'file', map: item => item.shortPath }
		], item => item.message)
	}),
	computed: {
		databaseSlowQueriesColumns() {
			let columns = [ 'Model', 'Query', 'Duration' ]

			let hasMultipleConnections = (new Set(this.slowQueries.map(query => query.connection))).size > 1

			if (hasMultipleConnections) columns.splice(1, 0, 'Connection')

			return columns
		}
	}
}
</script>
