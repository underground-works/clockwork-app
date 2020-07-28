<template>
	<div v-show="active">
		<details-table title="Events" icon="zap" :columns="['Time', 'Event', '']" :items="$request.events" :filter="filter" filter-example="&quot;user registered&quot; file:Controller.php time:&lt;13:08:30">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="event, index in items" :key="`${$request.id}-${index}`">
					<td>{{event.time | moment('HH:mm:ss')}}</td>
					<td>
						<div class="fired-event">
							<div class="fired-event-content">
								<div v-if="event.objectEvent">
									<pretty-print :data="event.data"></pretty-print>
								</div>
								<div v-if="! event.objectEvent">
									{{event.event}}
								</div>
							</div>
							<stack-trace class="fired-query-path" :trace="event.trace" :file="event.file" :line="event.line"></stack-trace>
						</div>
						<div class="fired-event-details" v-show="isEventExpanded(event)">
							<div class="fired-event-parameters" v-if="! event.objectEvent">
								<h4>Parameters</h4>
								<pretty-print :data="event.data"></pretty-print>
							</div>
							<div class="fired-event-listeners">
								<h4>Listeners</h4>
								<shortened-text v-for="listener, index in event.listeners" :key="`${$request.id}-${index}`" :full="listener.name">
									{{listener.shortName}}
								</shortened-text>
							</div>
						</div>
					</td>
					<td class="fired-event-actions">
						<a href="#" @click.prevent="toggleEvent(event)">
							<icon :name="isEventExpanded(event) ? 'chevron-up' : 'chevron-down'"></icon>
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

export default {
	name: 'EventsTab',
	components: { DetailsTable, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'time', type: 'date' },
			{ tag: 'file', map: item => item.shortPath }
		]),
		expandedEvents: []
	}),
	methods: {
		toggleEvent(event) {
			if (this.isEventExpanded(event)) {
				this.expandedEvents = this.expandedEvents.filter(item => item != event)
			} else {
				this.expandedEvents.push(event)
			}
		},
		isEventExpanded(event) { return this.expandedEvents.indexOf(event) !== -1 }
	}
}
</script>
