<template>
	<div class="request-tab">
		<sidebar-section title="Headers" name="headers" :items="headers" filter-example="text/html name:Accept" v-if="headers.length">
		</sidebar-section>

		<sidebar-section title="Data" name="data" :items="$request.requestData" filter-example="420 name:price" v-if="$request.requestData">
			<template v-slot:content="{ expanded }" v-if="! ($request.requestData instanceof Object)">
				<div class="data-raw" v-if="expanded">
					{{$request.requestData}}
				</div>
			</template>
		</sidebar-section>

		<sidebar-section title="GET data" name="getData" :items="$request.getData" filter-example="created_at name:orderBy" v-if="$request.getData.length">
		</sidebar-section>

		<sidebar-section title="POST data" name="postData" :items="$request.postData" filter-example="&quot;Mike Jones&quot; name:name" v-if="$request.postData.length">
		</sidebar-section>

		<sidebar-section title="Cookies" name="cookies" :items="$request.cookies" filter-example="&quot;Mike Jones&quot; name:name" v-if="$request.cookies.length">
		</sidebar-section>

		<sidebar-section title="Middleware" name="middleware" :items="$request.middleware" filter-example="auth:admin" v-if="$request.middleware.length">
			<template slot="table" slot-scope="{ items, filter, filterExample, expanded }">
				<details-table :columns="['Value']" :items="items" :filter="filter" :filter-example="filterExample" :no-header="true" :no-table-head="true" v-if="expanded">
					<template slot="header" slot-scope="{ filter }">
					</template>
					<template slot="body" slot-scope="{ items }">
						<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
							<td class="value">{{item}}</td>
						</tr>
					</template>
				</details-table>
			</template>
		</sidebar-section>

		<sidebar-section title="Session" name="session" :items="$request.sessionData" filter-example="registration successful name:_token" v-if="$request.sessionData.length || $request.authenticatedUser">
			<template slot="above-table">
				<div class="session-user" v-if="$request.authenticatedUser">
					<icon name="user"></icon>
					<div>
						<span class="name" v-if="$request.authenticatedUser.name && $request.authenticatedUser.name.trim()">{{$request.authenticatedUser.name}}</span>
						<span :class="$request.authenticatedUser.name && $request.authenticatedUser.name.trim() ? 'dimmed' : ''">{{$request.authenticatedUser.username}}</span>
					</div>
					<span class="session-user-details" v-if="$request.authenticatedUser.email || $request.authenticatedUser.id">
						<span class="dimmed" v-if="$request.authenticatedUser.id">#{{$request.authenticatedUser.id}}</span>
					</span>
				</div>
			</template>
		</sidebar-section>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import SidebarSection from '../UI/SidebarSection'

export default {
	name: 'RequestTab',
	components: { DetailsTable, SidebarSection },
	computed: {
		headers() {
			return ! this.$request.cookies.length
				? this.$request.headers : this.$request.headers.filter(header => header.name != 'Cookie')
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.request-tab {
	background: #fff;

	@include dark { background: #1f1f1f; }

	.data-raw {
		overflow: auto;
		padding: 8px 12px;
		white-space: pre;
	}

	.session-user {
		align-items: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		display: flex;
		font-size: 110%;
		padding: 8px 10px;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

		.ui-icon {
			color: #666;
			font-size: 120%;
			margin-right: 5px;
		}

		.name {
			margin-right: 6px;
		}

		.dimmed {
			color: rgb(128, 128, 128);
			font-size: 90%;

			@include dark { color: rgb(118, 118, 118); }
		}

		.session-user-details {
			margin-left: auto;
		}
	}
}
</style>