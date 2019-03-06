<template>
	<div>
		<details-table :columns="['To', 'Subject', 'Headers']" :items="$request.emails" :filter="filter" filter-example="&quot;User Registration&quot; to:its@underground.works">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="email, index in items" :key="`${$request.id}-${index}`">
					<td>{{email.to}}</td>
					<td>{{email.subject}}</td>
					<td colspan="2"><pretty-print :data="email.headers"></pretty-print></td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import DetailsTableFilterToggle from '../UI/DetailsTableFilterToggle'
import PrettyPrint from '../UI/PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'EmailsTab',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint },
	data: () => ({
		filter: new Filter([
			{ tag: 'to' }
		])
	})
}
</script>
