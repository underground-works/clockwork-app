<template>
	<div v-if="active">
		<div v-for="section, sectionIndex in userTab.sections" :key="`${$request.id}-${sectionIndex}`">
			<div v-if="section.showAs == 'counters'" class="counters-row">
				<div v-for="item, index in section.data" class="counter" :key="`${$request.id}-${index}`">
					<div class="counter-value">{{item.value}}</div>
					<div class="counter-title">{{item.key}}</div>
				</div>
			</div>

			<details-table :title="section.title" :columns="section.data[0].map(item => item.key)" :items="section.data" :filter="filters[sectionIndex]" v-if="section.showAs == 'table'">
				<template slot="body" slot-scope="{ items }">
					<tr v-for="item in items">
						<td v-for="item in item">
							<pretty-print :data="item.value"></pretty-print>
						</td>
					</tr>
				</template>
			</details-table>
		</div>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'UserTab',
	components: { DetailsTable, PrettyPrint },
	props: [ 'active', 'userTab' ],
	data: () => ({
		filters: []
	}),
	watch: {
		userTab: {
			handler(val) {
				this.filters = val.sections.map(section => {
					if (section.showAs == 'table') {
						return new Filter(section.data[0].map(item => ({ tag: item.key })))
					}
				})
			},
			immediate: true
		}
	}
}
</script>
