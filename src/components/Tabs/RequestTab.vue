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

		<sidebar-section title="Headers" :items="$request.headers" filter-example="text/html name:Accept" v-show="$request.headers.length">
		</sidebar-section>

		<sidebar-section title="Data" :items="$request.requestData" filter-example="420 name:price" v-show="$request.requestData">
			<template slot="content" v-if="! ($request.requestData instanceof Object)">
				{{$request.requestData}}
			</template>
		</sidebar-section>

		<sidebar-section title="GET data" :items="$request.getData" filter-example="created_at name:orderBy" v-show="$request.getData.length">
		</sidebar-section>

		<sidebar-section title="POST data" :items="$request.postData" filter-example="&quot;Mike Jones&quot; name:name" v-show="$request.postData.length">
		</sidebar-section>

		<sidebar-section title="Cookies" :items="$request.cookies" filter-example="&quot;Mike Jones&quot; name:name" v-show="$request.cookies.length">
		</sidebar-section>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import DetailsTableFilterToggle from '../UI/DetailsTableFilterToggle'
import PrettyPrint from '../UI/PrettyPrint'
import SidebarSection from '../UI/SidebarSection'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'RequestTab',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint, SidebarSection, StackTrace },
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
