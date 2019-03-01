<template>
	<div>
		<details-table :columns="['Time', 'Level', 'Message']" :items="$request.log" :filter="filter" filter-example="query failed level:error file:Controller.php time:>13:08:29">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="message in items" :class="{ 'log-row': true, 'error': ['emergency', 'alert', 'critical', 'error'].includes(message.level), warning: message.level == 'warning' }">
					<td class="log-date">{{message.time | moment('HH:mm:ss')}}</td>
					<td class="log-level">{{message.level}}</td>
					<td>
						<div class="log-message">
							<div class="log-message-content">
								<pretty-print :data="message.message"></pretty-print>
								<div v-show="message.context">
									<pretty-print :data="message.context"></pretty-print>
								</div>
							</div>
							<div class="log-message-exception" v-if="message.exception">
								<a href="#" class="exception-previous" v-if="message.exception.previous" @click.prevent="showPreviousException(message)">Show previous</a>
								<span class="exception-type">{{message.exception.type}}</span>
								<span class="exception-code" v-if="message.exception.code">#{{message.exception.code}}</span>
							</div>
							<stack-trace class="log-message-path" :trace="message.trace" :short-path="message.shortPath" :full-path="message.fullPath"></stack-trace>
						</div>
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
	name: 'LogTab',
	components: { DetailsTable, PrettyPrint, StackTrace },
	data: () => ({
		filter: new Filter([
			{ tag: 'time', type: 'date' },
			{ tag: 'level' },
			{ tag: 'file', map: item => item.shortPath }
		], item => item.message)
	}),
	methods: {
		showPreviousException: function (message) {
			let messageIndex = this.$request.log.indexOf(message)

			this.$request.log.splice(messageIndex + 1, 0, {
				message:   message.exception.previous.message,
				exception: message.exception.previous,
				level:     'error',
				shortPath: `${message.exception.previous.file.split(/[\/\\]/).pop()}:${message.exception.previous.line}`,
				trace:     message.exception.previous.trace
			})

			message.exception.previous = undefined
		}
	}
}
</script>
