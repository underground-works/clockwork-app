<template>
	<div>
		<details-table :columns="columns" :items="$request.redisCommands" :filter="filter" filter-example="command:zrange connection:eshop file:StatsController.php duration:&gt;50">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`">
					<td v-if="columns.includes('Connection')">{{query.connection}}</td>
					<td>{{query.command}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<pretty-print :data="query.parameters"></pretty-print>
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
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'RedisTab',
	components: { DetailsTable, PrettyPrint, StackTrace },
	data: () => ({
		filter: new Filter([
			{ tag: 'connection' },
			{ tag: 'command' },
			{ tag: 'file', map: item => item.shortPath },
			{ tag: 'duration', type: 'number' }
		])
	}),
	computed: {
		columns() {
			let columns = [ 'Command', 'Parameters', 'Duration' ]

			let hasMultipleConnections = (new Set(this.$request.redisCommands.map(query => query.connection))).size > 1

			if (hasMultipleConnections) columns.splice(0, 0, 'Connection')

			return columns
		}
	}
}
</script>
