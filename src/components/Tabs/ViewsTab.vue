<template>
	<div>
		<timeline :items="$request.viewsData">
			<template slot="table-description" slot-scope="{ item }">
				<div class="views-view-name">{{ item.description }}</div>
				<pretty-print :data="item.data.data" v-if="item.data.data"></pretty-print>
			</template>
		</timeline>
	</div>
</template>

<script>
import Timeline from './Performance/Timeline'
import PrettyPrint from '../UI/PrettyPrint'

export default {
	name: 'ViewsTab',
	components: { PrettyPrint, Timeline }
}
</script>

<style lang="scss">
.views-view-name {
	margin-bottom: 3px;
}
</style>