<template>
	<div>
		<details-table :columns="columns" :items="$request.queueJobs" :filter="filter" filter-example="Underground.works name:GenerateInvoice queue:priority">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="job, index in items" :key="`${$request.id}-${index}`">
					<td v-if="columns.includes('Queue')">{{job.queue}}</td>
					<td v-if="columns.includes('Connection')">{{job.connection}}</td>
					<td>{{job.name}}</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<pretty-print :data="job.data"></pretty-print>
							</div>
							<stack-trace class="database-query-path" :trace="job.trace" :file="job.file" :line="job.line"></stack-trace>
						</div>
					</td>
					<td v-if="columns.includes('Options')" class="job-options">
						<span v-if="job.maxTries">{{job.maxTries}} tries</span>
						<span v-if="job.timeout">{{job.timeout}}s timeout</span>
					</td>
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
	name: 'QueueTab',
	components: { DetailsTable, PrettyPrint, StackTrace },
	data: () => ({
		filter: new Filter([
			{ tag: 'connection' },
			{ tag: 'queue' },
			{ tag: 'name' }
		])
	}),
	computed: {
		columns() {
			let columns = [ 'Name', 'Data' ]

			let hasMultipleQueues = (new Set(this.$request.queueJobs.map(job => job.queue))).length > 1
			let hasMultipleConnections = (new Set(this.$request.queueJobs.map(job => job.connection))).length > 1
			let hasOptions = this.$request.queueJobs.some(job => job.maxTries || job.timeout)

			if (hasMultipleQueues) columns.splice(0, 0, 'Queue')
			if (hasMultipleConnections) columns.splice(0, 0, 'Connection')
			if (hasOptions) columns.push('Options')

			return columns
		}
	}
}
</script>

<style lang="scss" scoped>
.job-options {
	span {
		display: block;
		white-space: nowrap;
	}
}
</style>
