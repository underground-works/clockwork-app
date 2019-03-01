<template>
	<div>
		<details-table :columns="['Name', 'Data']" :items="$request.views" :filter="filter" filter-example="&quot;Mike Jones&quot; name:welcome">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="view in items">
					<td>{{view.name}}</td>
					<td><pretty-print :data="view.data"></pretty-print></td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'ViewsTab',
	components: { DetailsTable, PrettyPrint },
	data: () => ({
		filter: new Filter([ { tag: 'name' } ])
	})
}
</script>
