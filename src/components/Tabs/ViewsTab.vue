<template>
	<div v-show="active">
		<timeline name="views" icon="image" :timeline="$request.viewsData">
			<template v-slot:table-description="{ item }">
				<div class="views-view-name">{{ item.description }}</div>
				<pretty-print :data="item.data" v-if="item.data"></pretty-print>
			</template>
		</timeline>
	</div>
</template>

<script>
import Timeline from './Performance/Timeline'
import PrettyPrint from '../UI/PrettyPrint'

export default {
	name: 'ViewsTab',
	components: { PrettyPrint, Timeline },
	props: [ 'active' ]
}
</script>

<style lang="scss">
.views-view-name {
	margin-bottom: 3px;
}
</style>