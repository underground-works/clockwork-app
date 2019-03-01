<template>
	<div class="timeline" :class="{ 'table-view': view == 'table' }">
		<div class="timeline-controls">
			<span class="timeline-control-group">
				<a href="#" class="toggle-filter" @click="filter.toggle()">
					<font-awesome-icon icon="search"></font-awesome-icon>
				</a>
			</span>
			<span class="timeline-control-group">
				<a href="#" @click="view = 'chart'" :class="{ 'active': view == 'chart' }" title="Timeline view">
					<font-awesome-icon icon="chart-bar"></font-awesome-icon>
				</a>
				<a href="#" @click="view = 'table'" :class="{ 'active': view == 'table' }" title="Table view">
					<font-awesome-icon icon="bars"></font-awesome-icon>
				</a>
			</span>
		</div>

		<details-table :items="$request.timeline" :filter="filter" filter-example="database query duration:>50">
			<template slot="header" slot-scope="{ filter }">
				<th>Timeline</th>
				<th class="timeline-duration">Duration</th>
				<th class="timeline-description">Description</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items">
					<td class="timeline-graph">
						<div v-if="index == 0" class="timeline-legend">
							<span v-for="item in legend" class="timeline-legend-time" :style="{ left: `${item.left}%` }">{{item.time}} ms</span>
						</div>
						<div class="timeline-bar" :class="item.style">
							<div class="label" :style="{ 'text-align': item.labelAlign, 'margin-left': item.labelLeft, 'margin-right': item.labelRight }">
								{{item.description}} ({{item.durationRounded}} ms)
							</div>
							<div class="bar" :style="{ width: item.barWidth, 'margin-left': item.barLeft }"></div>
						</div>
					</td>
					<td class="timeline-duration">{{item.durationRounded}} ms</td>
					<td class="timeline-description">{{item.description}}</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'

import Filter from '../../../features/filter'

export default {
	name: 'Timeline',
	components: { DetailsTable },
	data: () => ({
		view: 'chart',

		filter: new Filter([
			{ tag: 'duration', type: 'number' }
		], item => item.description)
	}),
	computed: {
		legend: function () {
			if (! this.$request) return []

			let items = []
			let contentEl = document.querySelector('.details-content')
			let maxWidth = contentEl ? contentEl.offsetWidth - 28 : 0

			let labelCount = Math.floor(maxWidth / 80)
			let step = this.$request.responseDuration / maxWidth
			let j

			for (j = 1; j < labelCount + 1; j++) {
				items.push({
					left: ((j * 80 - 44) / maxWidth * 100).toString(),
					time: Math.round(j * 80 * step).toString()
				})
			}

			if (maxWidth - ((j - 1) * 80) > 45) {
				items.push({
					left: ((maxWidth - 38) / maxWidth * 100).toString(),
					time: Math.round(maxWidth * step).toString()
				});
			}

			return items
		}
	}
}
</script>
