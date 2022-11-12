<template>
	<div v-show="active">
		<details-table title="Messages" icon="edit-2" :columns="['Time', 'Level', 'Message']" :items="log" :filter="filter" filter-example="query failed level:error file:Controller.php time:>13:08:29">
			<template v-slot:body="{ items }">
				<tr v-for="message, index in items" :class="{ 'log-row': true, 'error': ['emergency', 'alert', 'critical', 'error'].includes(message.level), warning: message.level == 'warning' }" :key="`${$request.id}-${index}`">
					<td class="log-date">{{$date(message.time, 'HH:mm:ss')}}</td>
					<td class="log-level">{{message.level}}</td>
					<td>
						<div class="log-message">
							<div class="log-message-content">
								<pretty-print :data="message.message" :linkify="true"></pretty-print>
								<div class="log-message-context" v-show="message.context">
									<pretty-print :data="message.context"></pretty-print>
								</div>
							</div>
							<div class="log-message-exception" v-if="message.exception">
								<a href="#" class="exception-previous" v-if="message.exception.previous" @click.prevent="showPreviousException(message)">Show previous</a>
								<span class="exception-type">{{message.exception.type}}</span>
								<span class="exception-code" v-if="message.exception.code">#{{message.exception.code}}</span>
							</div>
							<stack-trace class="log-message-path" :trace="message.trace" :file="message.file" :line="message.line"></stack-trace>
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
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'time', type: 'date' },
			{ tag: 'level' },
			{ tag: 'file', map: item => item.shortPath }
		], item => item.message)
	}),
	computed: {
		log() { return this.$request.log.filter(message => ! message.context?.performance) }
	},
	methods: {
		showPreviousException(message) {
			let messageIndex = this.$request.log.indexOf(message)

			this.$request.log.splice(messageIndex + 1, 0, {
				time:      message.time,
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

<style lang="scss">
@import '../../mixins.scss';

.details-table {
	.log-row {
		&.error {
			background: rgb(255, 235, 235);
			color: rgb(197, 31, 36);

			&:nth-child(even) {
				background: hsl(0, 100%, 94%);
			}

			.log-message-path {
				color: hsl(358, 55%, 70%);
			}

			@include dark {
				background: hsl(0, 100%, 11%);
				color: rgb(237, 121, 122);

				&:nth-child(even) {
					background: hsl(0, 100%, 9%);
				}

				.log-message-path {
					color: hsl(359, 38%, 62%);
				}
			}
		}

		&.warning {
			background: rgb(255, 250, 226);
			color: rgb(168, 89, 25);

			&:nth-child(even) {
				background: hsl(50, 100%, 88%);
			}

			.log-message-path {
				color: hsl(27, 55%, 65%);
			}

			@include dark {
				background: hsl(50, 100%, 11%);
				color: rgb(250, 216, 159);

				&:nth-child(even) {
					background: hsl(50, 100%, 9%);
				}

				.log-message-path {
					color: hsl(38, 42%, 68%);
				}
			}
		}
	}

	.log-date, .log-level {
		width: 70px;
	}

	.log-message {
		align-items: flex-start;
		display: flex;
		flex-wrap: wrap;

		.log-message-content {
			flex: 1 0 auto;
			max-width: 100%;

			.linkified {
				text-decoration: none;
			}
		}

		.log-message-exception {
			flex: 0;
			font-size: 90%;
			margin: 3px 5px 0 0;
			white-space: nowrap;

			.exception-previous {
				border: 1px solid #aaa;
				border-radius: 4px;
				text-decoration: none;
				padding: 2px 4px;
				margin-right: 5px;

			    @include dark {
					border-color: gray;
			    }
			}
		}

		.log-message-context {
			margin-top: 4px;
		}

		.log-message-path {
			color: #aaa;
			flex: 0;
			font-size: 90%;
			margin-top: 3px;

			@include dark {
				color: #777;
			}
		}
	}
}
</style>