<template>
	<div>
		<div class="update-notification" v-if="updateNotification">
			<span>
				A new Clockwork server-side version is available, {{updateNotification.version}}, you are using {{updateNotification.currentVersion}}.
				<a v-if="updateNotification.url" :href="updateNotification.url" target="_blank">Read more</a>
			</span>
			<span class="updateNotification-close">
				<a @click="closeUpdateNotification" href="#">Close</a>
			</span>
		</div>

		<div class="parent-request" v-if="$request.parent">
			<span>
				Subrequest of <code>{{$request.parent.method}} {{$request.parent.uri}}</code>.
			</span>
			<span class="parentRequest-close">
				<a @click="showRequestById($request.parent.id)" href="#">Show</a>
			</span>
		</div>

		<div class="request-tab-info">
			<div class="field">
				<div class="field-title">Method</div>
				<div class="field-value">
					<div>{{$request.method}}</div>
				</div>
			</div>
			<div class="field action">
				<div class="field-title">Action</div>
				<div class="field-value">
					<div>{{$request.uri}}</div>
					<div class="small">{{$request.controller}}</div>
				</div>
			</div>
			<div class="field link">
				<div class="field-title">&nbsp;</div>
				<div class="field-value">
					<a href="#" v-show="$request.url" v-clipboard:copy="$request.url" title="Copy url">
						<font-awesome-icon icon="link"></font-awesome-icon>
					</a>
				</div>
			</div>
			<div class="field">
				<div class="field-title">Status</div>
				<div class="field-value">
					<div>{{$request.responseStatus}}</div>
				</div>
			</div>
		</div>

		<div class="request-tab-exception" v-if="$request.exceptions.length">
			<div class="exception-info" v-for="exception, index in $request.exceptions" :key="`${$request.id}-${index}`">
				<div class="exception-message">
					<h3>{{exception.type}} <small v-if="exception.code">#{{exception.code}}</small></h3>
					{{exception.message}}
				</div>
				<div>
					<a href="#" class="exception-previous" @click.prevent="showPreviousException(exception)" v-if="exception.previous">Previous</a>
					<stack-trace class="exception-trace" :trace="exception.trace"></stack-trace>
				</div>
			</div>
		</div>

		<details-table :items="$request.headers" :filter="headersFilter" filter-example="text/html name:Accept" v-show="$request.headers.length">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					Request headers
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
					<td class="key">{{item.name}}</td>
					<td class="value"><pretty-print :data="item.value"></pretty-print></td>
				</tr>
			</template>
		</details-table>

		<details-table v-if="$request.requestData instanceof Object" :items="$request.requestData" :filter="requestDataFilter" filter-example="420 name:price" v-show="$request.requestData.length">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					Request data
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
					<td class="key">{{item.name}}</td>
					<td class="value"><pretty-print :data="item.value"></pretty-print></td>
				</tr>
			</template>
		</details-table>

		<table v-else-if="$request.requestData" class="request-tab-data-raw">
			<thead>
				<tr>
					<th>
						Request data
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{{$request.requestData}}</td>
				</tr>
			</tbody>
		</table>

		<details-table :items="$request.getData" :filter="getDataFilter" filter-example="created_at name:orderBy" v-show="$request.getData.length">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					GET parameters
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
					<td class="key">{{item.name}}</td>
					<td class="value"><pretty-print :data="item.value"></pretty-print></td>
				</tr>
			</template>
		</details-table>

		<details-table :items="$request.postData" :filter="postDataFilter" filter-example="&quot;Mike Jones&quot; name:name" v-show="$request.postData.length">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					POST parameters
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
					<td class="key">{{item.name}}</td>
					<td class="value"><pretty-print :data="item.value"></pretty-print></td>
				</tr>
			</template>
		</details-table>

		<details-table :items="$request.cookies" :filter="cookiesFilter" filter-example="&quot;Mike Jones&quot; name:name" v-show="$request.cookies.length">
			<template slot="header" slot-scope="{ filter }">
				<th colspan="2">
					Cookies
					<details-table-filter-toggle :filter="filter"></details-table-filter-toggle>
				</th>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
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
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'RequestTab',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint, StackTrace },
	data: () => ({
		headersFilter: new Filter([ { tag: 'name' } ]),
		requestDataFilter: new Filter([ { tag: 'name' } ]),
		getDataFilter: new Filter([ { tag: 'name' } ]),
		postDataFilter: new Filter([ { tag: 'name' } ]),
		cookiesFilter: new Filter([ { tag: 'name' } ])
	}),
	computed: {
		updateNotification() { this.$updateNotification.show(this.$requests.remoteUrl) }
	},
	methods: {
		closeUpdateNotification: function () {
			this.$updateNotification.ignoreUpdate(this.$requests.remoteUrl)
			this.updateNotification = false
		},
		showPreviousException: function (exception) {
			this.$request.exceptions.push(exception.previous)
			exception.previous = undefined
		},
		showRequestById: function (requestId) {
			this.global.$request = this.$requests.find(requestId)
		}
	}
}
</script>
