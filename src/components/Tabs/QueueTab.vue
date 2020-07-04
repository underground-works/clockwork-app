<template>
	<div v-show="active">
		<details-table title="Jobs" :columns="columns" :items="queueJobs" :filter="filter" filter-example="Underground.works name:GenerateInvoice queue:priority">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="job, index in items" :key="`${$request.id}-${index}`">
					<td v-if="columns.includes('Queue')">{{job.queue}}</td>
					<td v-if="columns.includes('Connection')">{{job.connection}}</td>
					<td>
						<shortened-text :full="job.name">{{job.shortName}}</shortened-text>
					</td>
					<td>
						<div class="database-query">
							<div class="database-query-content">
								<pretty-print :data="job.data"></pretty-print>
							</div>
							<div class="job-options" v-if="job.maxTries || job.timeout">
								<span v-if="job.maxTries">{{job.maxTries}} tries</span>
								<span v-if="job.timeout">{{job.timeout}}s timeout</span>
							</div>
							<stack-trace class="database-query-path" :trace="job.trace" :file="job.file" :line="job.line"></stack-trace>
						</div>
					</td>
					<td>
						<span :class="{ 'job-status-text': true, 'is-success': job.request && job.request.jobStatus == 'done', 'is-error': job.request && job.request.jobStatus == 'failed' }">
							{{job.request ? job.request.jobStatus : 'waiting'}}
						</span>
					</td>
					<td>
						<a href="#" @click.prevent="showJob(job)" title="Show details" v-if="job.request">
							<font-awesome-icon icon="search"></font-awesome-icon>
						</a>
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

import extend from 'just-extend'

export default {
	name: 'QueueTab',
	components: { DetailsTable, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'connection' },
			{ tag: 'queue' },
			{ tag: 'name' }
		]),
		jobRequests: {}
	}),
	computed: {
		columns() {
			let columns = [ 'Name', 'Data' ]

			let hasMultipleQueues = (new Set(this.$request.queueJobs.map(job => job.queue))).size > 1
			let hasMultipleConnections = (new Set(this.$request.queueJobs.map(job => job.connection))).size > 1

			if (hasMultipleQueues) columns.splice(0, 0, 'Queue')
			if (hasMultipleConnections) columns.splice(0, 0, 'Connection')

			return columns.concat([ 'Status', '' ])
		},

		queueJobs() {
			if (! this.$request) return []

			return this.$request.queueJobs.map(job => {
				return extend({ request: this.jobRequests[job.id] }, job)
			})
		}
	},
	methods: {
		showJob(job) {
			this.global.$request = this.$requests.findId(job.id)
		},

		async loadQueueJobRequest(job, attempt = 0) {
			if (attempt == 12) return
			if (job.loadRequestTimeout) return

			let request = this.$requests.findId(job.id) || await this.$requests.loadId(job.id, false)

			if (! request) {
				return job.loadRequestTimeout = setTimeout(() => {
					job.loadRequestTimeout = null
					this.loadQueueJobRequest(job, attempt + 1)
				}, 5000)
			}

			this.$set(this.jobRequests, job.id, request)
		}
	},
	watch: {
		active(val) {
			if (! val) return

			this.$request.queueJobs.forEach(job => {
				if (job.id) this.loadQueueJobRequest(job)
			})
		}
	}
}
</script>

<style lang="scss" scoped>
@import '../../mixins.scss';

.job-options {
	margin: 2px 0;
	width: 100%;

	span {
		display: block;
		white-space: nowrap;
	}
}

.job-status-text {
	background: #fffae2;
	border-radius: 8px;
	color: #a85919;
	font-size: 9px;
	padding: 2px 6px;
	text-transform: uppercase;

	@include dark {
		background: #382f00;
		color: #fad89f;
	}

	&.is-success {
		background: hsl(76, 47%, 86%);
		color: #586336;

		@include dark {
			background: hsla(76, 100%, 11%, 1);
			color: hsla(75, 90%, 80%, 1);
		}
	}

	&.is-error {
		background: #ffebeb;
		color: #c51f24;

		@include dark {
			background: #380000;
			color: #ed797a;
		}
	}
}
</style>
