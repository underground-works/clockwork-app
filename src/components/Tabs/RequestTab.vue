<template>
	<div class="request-tab">
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

		<sidebar-section title="Headers" :items="headers" filter-example="text/html name:Accept" v-show="headers.length">
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

		<sidebar-section title="Session" :items="$request.sessionData" filter-example="registration successful name:_token" v-show="$request.sessionData.length || $request.authenticatedUser">
			<template slot="above-table">
				<div class="session-user" v-if="$request.authenticatedUser">
					<font-awesome-icon icon="user"></font-awesome-icon>
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
import SidebarSection from '../UI/SidebarSection'
import StackTrace from '../UI/StackTrace'

export default {
	name: 'RequestTab',
	components: { SidebarSection, StackTrace },
	computed: {
		headers() {
			return ! this.$request.cookies.length
				? this.$request.headers : this.$request.headers.filter(header => header.name != 'Cookie')
		},
		updateNotification() { return this.$updateNotification.show(this.$requests.remoteUrl) }
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

<style lang="scss">
.request-tab {
	background: #fff;

	.session-user {
		align-items: center;
		border-bottom: 1px solid rgb(209, 209, 209);
		display: flex;
		font-size: 110%;
		padding: 8px 10px;

		body.dark & { border-bottom: 1px solid rgb(54, 54, 54); }

		.fa-user {
			color: rgb(128, 128, 128);
			font-size: 110%;
			margin-right: 8px;
		}

		.name {
			margin-right: 6px;
		}

		.dimmed {
			color: rgb(128, 128, 128);
			font-size: 90%;

			body.dark & { color: rgb(118, 118, 118); }
		}

		.session-user-details {
			margin-left: auto;
		}
	}
}
</style>