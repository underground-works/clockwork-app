<template>
	<div v-show="active">
		<details-table title="Routes" icon="map" :columns="columns" :items="$request.routes" :filter="filter" filter-example="OrderController method:post uri:order">
			<template v-slot:body="{ items }">
				<tr v-for="route, index in items" :key="`${$request.id}-${index}`">
					<td>{{route.method}}</td>
					<td>{{route.uri}}</td>
					<td>{{route.action}}</td>
					<td v-if="columns.includes('Name')">{{route.name}}</td>
					<td v-if="columns.includes('Middleware')">
						<span v-for="middleware, index in route.middleware">
							{{middleware}}{{index == route.middleware.length - 1 ? '' : ', '}}
						</span>
					</td>
					<td v-if="columns.includes('Before')">{{route.before}}</td>
					<td v-if="columns.includes('After')">{{route.after}}</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import createFilter from '../../features/filter'

export default {
	name: 'RoutesTab',
	components: { DetailsTable },
	props: [ 'active' ],
	data: () => ({
		filter: createFilter([
			{ tag: 'method', apply: (item, tagValue) => {
				if ([ 'get', 'post', 'put', 'delete', 'head', 'patch' ].includes(tagValue.toLowerCase())) {
					return item.method.toLowerCase() == tagValue.toLowerCase()
				}
			} },
			{ tag: 'uri' }
		])
	}),
	computed: {
		columns() {
			let columns = [ 'Methods', 'URI', 'Action' ]

			if (this.$request.routes.some(route => route.name)) columns.push('Name')
			if (this.$request.routes.some(route => route.middleware)) columns.push('Middleware')
			if (this.$request.routes.some(route => route.before)) columns.push('Before')
			if (this.$request.routes.some(route => route.after)) columns.push('After')

			return columns
		}
	}
}
</script>
