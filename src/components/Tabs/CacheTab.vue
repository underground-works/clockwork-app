<template>
	<div v-show="active">
		<div class="counters-row">
			<div class="counter" v-show="$request.cacheQueries.length">
				<div class="counter-value">{{$request.cacheQueries.length}}</div>
				<div class="counter-title">queries</div>
			</div>
			<div class="counter" v-show="$request.cacheReads !== null">
				<div class="counter-value">{{$request.cacheReads}}</div>
				<div class="counter-title">reads</div>
			</div>
			<div class="counter" v-show="$request.cacheHits !== null">
				<div class="counter-value">{{$request.cacheHits}}</div>
				<div class="counter-title">hits</div>
			</div>
			<div class="counter" v-show="$request.cacheMisses !== null">
				<div class="counter-value">{{$request.cacheMisses}}</div>
				<div class="counter-title">misses</div>
			</div>
			<div class="counter" v-show="$request.cacheWrites !== null">
				<div class="counter-value">{{$request.cacheWrites}}</div>
				<div class="counter-title">writes</div>
			</div>
			<div class="counter" v-show="$request.cacheDeletes !== null">
				<div class="counter-value">{{$request.cacheDeletes}}</div>
				<div class="counter-title">deletes</div>
			</div>
			<div class="counter" v-show="$request.cacheTime !== null">
				<div class="counter-value">{{$request.cacheTime}}</div>
				<div class="counter-title">time</div>
			</div>
		</div>

		<details-table :columns="columns" :items="$request.cacheQueries" :filter="filter" filter-example="info@underground.works action:miss key:lastRequest file:Controller.php" v-if="$request.cacheQueries.length">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="query, index in items" :key="`${$request.id}-${index}`">
					<td v-if="columns.includes('Connection')">{{query.connection}}</td>
					<td class="cache-query-type">{{query.type}}</td>
					<td>{{query.key}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<pretty-print :data="query.value"></pretty-print>
							</div>
							<stack-trace class="database-query-path" :trace="query.trace" :file="query.file" :line="query.line"></stack-trace>
						</div>
					</td>
					<td><span v-if="query.expiration">{{query.expiration}}</span></td>
					<td v-if="columns.includes('Duration')">{{query.duration | round(3)}} ms</td>
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
	name: 'CacheTab',
	components: { DetailsTable, PrettyPrint, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'action', apply: (item, tagValue) => {
				if ([ 'read', 'write', 'delete', 'miss' ].includes(tagValue.toLowerCase())) {
					return item.type.toLowerCase() == tagValue.toLowerCase()
				}
			} },
			{ tag: 'key' },
			{ tag: 'file', map: item => item.shortPath }
		])
	}),
	computed: {
		columns() {
			let columns = [ { name: 'Action', sortBy: 'type' }, 'Key', 'Value', 'Expires' ]

			if (this.$request.cacheQueries.some(query => query.connection)) columns.unshift('Connection')
			if (this.$request.cacheQueries.some(query => query.duration)) columns.push('Duration')

			return columns
		}
	}
}
</script>
