<template>
	<div>
		<div class="session-user" v-if="$request.authenticatedUser">
			<font-awesome-icon icon="user"></font-awesome-icon>
			<div>
				<span class="name" v-if="$request.authenticatedUser.name && $request.authenticatedUser.name.trim()">{{$request.authenticatedUser.name}}</span>
				<span :class="$request.authenticatedUser.name && $request.authenticatedUser.name.trim() ? 'dimmed' : ''">{{$request.authenticatedUser.username}}</span>
				<br>
				<span class="title">authenticated user</span>
			</div>
			<span class="session-user-details" v-if="$request.authenticatedUser.email || $request.authenticatedUser.id">
				<span class="dimmed" v-if="$request.authenticatedUser.id">#{{$request.authenticatedUser.id}}</span>
			</span>
		</div>

		<details-table :items="$request.sessionData" :filter="filter" filter-example="registration successful name:_token">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					Session
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item in items">
					<td class="key">{{item.name}}</td>
					<td class="value"><pretty-print :data="item.value"></pretty-print></td>
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
	name: 'SessionTab',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint },
	data: () => ({
		filter: new Filter([ { tag: 'name' } ])
	})
}
</script>
