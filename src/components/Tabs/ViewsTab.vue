<template>
	<div>
		<timeline :items="$request.viewsData"></timeline>
	</div>
</template>

<script>
import Timeline from './Performance/Timeline'
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'ViewsTab',
	components: { DetailsTable, PrettyPrint, Timeline },
	data: () => ({
		filter: new Filter([ { tag: 'name' } ])
	})
}
</script>
