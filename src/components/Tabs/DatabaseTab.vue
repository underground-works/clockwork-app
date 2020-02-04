<template>
	<div v-show="active">
		<div class="counters-row">
			<div class="counter">
				<div class="counter-value">{{$request.databaseQueriesCount}}</div>
				<div class="counter-title">queries</div>
			</div>
			<div class="counter database-slow-query" v-if="$request.databaseSlowQueries">
				<div class="counter-value">{{$request.databaseSlowQueries}}</div>
				<div class="counter-title">slow</div>
			</div>
			<div class="counter" v-if="$request.databaseSelects">
				<div class="counter-value">{{$request.databaseSelects}}</div>
				<div class="counter-title">selects</div>
			</div>
			<div class="counter" v-if="$request.databaseInserts">
				<div class="counter-value">{{$request.databaseInserts}}</div>
				<div class="counter-title">inserts</div>
			</div>
			<div class="counter" v-if="$request.databaseUpdates">
				<div class="counter-value">{{$request.databaseUpdates}}</div>
				<div class="counter-title">updates</div>
			</div>
			<div class="counter" v-if="$request.databaseDeletes">
				<div class="counter-value">{{$request.databaseDeletes}}</div>
				<div class="counter-title">deletes</div>
			</div>
			<div class="counter" v-if="$request.databaseOthers">
				<div class="counter-value">{{$request.databaseOthers}}</div>
				<div class="counter-title">other</div>
			</div>
			<div class="counter">
				<div class="counter-value">{{$request.databaseDurationRounded}}&nbsp;ms</div>
				<div class="counter-title">time</div>
			</div>
		</div>

		<details-table :columns="columns" :items="$request.databaseQueries" :filter="filter" filter-example="where request_id model:request type:select file:Controller.php duration:&gt;100" v-if="$request.databaseQueries.length">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`" :class="{ 'database-slow-query': query.tags.includes('slow') }">
					<td>
						<shortened-text :full="query.model">{{query.shortModel}}</shortened-text>
					</td>
					<td v-if="columns.includes('Connection')">{{query.connection}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<div>{{query.query}}</div>
								<div class="database-query-bindings" v-if="query.bindings">
									<pretty-print :data="query.bindings"></pretty-print>
								</div>
							</div>
							<stack-trace class="database-query-path" :trace="query.trace" :file="query.file" :line="query.line"></stack-trace>
						</div>
					</td>
					<td class="database-duration">
						<span v-if="query.duration">{{query.duration | round(3)}} ms</span>
					</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'
import ShortenedText from '../UI/ShortenedText'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'DatabaseTab',
	components: { DetailsTable, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'active' ],
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
		columns() {
			let columns = [ 'Model', 'Query', 'Duration' ]

			let hasMultipleConnections = (new Set(this.$request.databaseQueries.map(query => query.connection))).size > 1

			if (hasMultipleConnections) columns.splice(1, 0, 'Connection')

			return columns
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.counter.database-slow-query {
	border-color: hsl(27, 55%, 65%) !important;
	@include dark { border-color: hsl(38, 42%, 68%) !important; }
}

.database-slow-query {
	background: rgb(255, 250, 226);
	color: rgb(168, 89, 25);

	&:nth-child(even) { background: hsl(50, 100%, 88%) !important; }

	.database-query-path > a { color: hsl(27, 55%, 65%) !important; }

	@include dark {
		background: hsl(50, 100%, 11%);
		color: rgb(250, 216, 159);

		&:nth-child(even) { background: hsl(50, 100%, 9%) !important; }

		.database-query-path > a { color: hsl(38, 42%, 68%) !important; }
	}
}

.database-query-bindings {
	margin-top: 2px;
}
</style>
