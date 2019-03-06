<template>
	<div>
		<div class="counters-row">
			<div class="counter">
				<div class="counter-value">{{queriesCount}}</div>
				<div class="counter-title">queries</div>
			</div>
			<div class="counter" v-if="selectsCount">
				<div class="counter-value">{{selectsCount}}</div>
				<div class="counter-title">selects</div>
			</div>
			<div class="counter" v-if="insertsCount">
				<div class="counter-value">{{insertsCount}}</div>
				<div class="counter-title">inserts</div>
			</div>
			<div class="counter" v-if="updatesCount">
				<div class="counter-value">{{updatesCount}}</div>
				<div class="counter-title">updates</div>
			</div>
			<div class="counter" v-if="deletesCount">
				<div class="counter-value">{{deletesCount}}</div>
				<div class="counter-title">deletes</div>
			</div>
			<div class="counter" v-if="otherCount">
				<div class="counter-value">{{otherCount}}</div>
				<div class="counter-title">other</div>
			</div>
			<div class="counter">
				<div class="counter-value">{{$request.databaseDurationRounded}}&nbsp;ms</div>
				<div class="counter-title">time</div>
			</div>
		</div>

		<details-table :columns="columns" :items="$request.databaseQueries" :filter="filter" filter-example="where request_id model:request type:select file:Controller.php duration:&gt;100">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`">
					<td>
						<shortened-text :full="query.model">{{query.shortModel}}</shortened-text>
					</td>
					<td v-if="columns.includes('Connection')">{{query.connection}}</td>
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
import DetailsTable from '../UI/DetailsTable'
import ShortenedText from '../UI/ShortenedText'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'DatabaseTab',
	components: { DetailsTable, ShortenedText, StackTrace },
	data: () => ({
		filter: new Filter([
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
		queriesCount() { return this.$request.databaseQueries.length },
		selectsCount() { return this.$request.databaseQueries.filter(query => query.query.match(/^select /i)).length },
		insertsCount() { return this.$request.databaseQueries.filter(query => query.query.match(/^insert /i)).length },
		updatesCount() { return this.$request.databaseQueries.filter(query => query.query.match(/^update /i)).length },
		deletesCount() { return this.$request.databaseQueries.filter(query => query.query.match(/^delete /i)).length },
		otherCount() { return this.$request.databaseQueries.filter(query => ! query.query.match(/^(select|insert|update|delete) /i)).length },
		columns() {
			let columns = [ 'Model', 'Query', 'Duration' ]

			let hasMultipleConnections = (new Set(this.$request.databaseQueries.map(query => query.connection))).length > 1

			if (hasMultipleConnections) columns.splice(1, 0, 'Connection')

			return columns
		}
	}
}
</script>
