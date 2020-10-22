<template>
	<div class="performance-log">
		<details-table title="Performance issues" icon="alert-triangle" :badge="issues.length" :columns="['Message']" :items="issues" :filter="performanceLogFilter" filter-example="query failed file:Controller.php time:>13:08:29" v-if="issues.length">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="message, index in items" class="log-row" :key="`${$request.id}-${index}`">
					<td>
						<div class="log-message">
							<div class="log-message-content">
								<pretty-print :data="message.message"></pretty-print>
								<div v-show="message.context && message.context.length">
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
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`">
					<td>
						<shortened-text :full="query.model">{{query.shortModel}}</shortened-text>
					</td>
					<td v-if="databaseSlowQueriesColumns.includes('Connection')">{{query.connection}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<highlightjs language="sql" :code="query.query" />
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
import PrettyPrint from '../../UI/PrettyPrint'
import ShortenedText from '../../UI/ShortenedText'
import StackTrace from '../../UI/StackTrace'

import Filter from '../../../features/filter'

import extend from 'just-extend'
import omit from 'just-omit'

export default {
	name: 'PerformanceLog',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'issues', 'slowQueries' ],
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
		]),
		performanceLogFilter: new Filter([
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
