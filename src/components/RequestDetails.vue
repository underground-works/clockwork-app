<template>
	<div class="split-view-pane split-view-details">

		<div class="details-header">
			<div class="icons">
				<a href="#" title="Toggle requests" v-show="! $store.data.requestsListCollapsed" @click="toggleRequestsList">
					<font-awesome-icon icon="outdent"></font-awesome-icon>
				</a>
				<a href="#" title="Toggle requests" v-show="$store.data.requestsListCollapsed" @click="toggleRequestsList">
					<font-awesome-icon icon="indent"></font-awesome-icon>
				</a>
				<a href="#" title="Search requests" @click="$requestsSearch.toggle()">
					<font-awesome-icon icon="search"></font-awesome-icon>
				</a>
			</div>

			<div class="details-header-tabs">
				<tab-handle name="performance" :active="isTabActive('performance')" @tab-selected="showTab">Performance</tab-handle>
				<tab-handle name="log" :active="isTabActive('log')" @tab-selected="showTab" v-show="showLogTab">Log</tab-handle>
				<tab-handle name="events" :active="isTabActive('events')" @tab-selected="showTab" v-show="showEventsTab">Events</tab-handle>
				<tab-handle name="database" :active="isTabActive('database')" @tab-selected="showTab" v-show="showDatabaseTab">Database</tab-handle>
				<tab-handle name="cache" :active="isTabActive('cache')" @tab-selected="showTab" v-show="showCacheTab">Cache</tab-handle>
				<tab-handle name="redis" :active="isTabActive('redis')" @tab-selected="showTab" v-show="showRedisTab">Redis</tab-handle>
				<tab-handle name="queue" :active="isTabActive('queue')" @tab-selected="showTab" v-show="showQueueTab">Queue</tab-handle>
				<tab-handle name="views" :active="isTabActive('views')" @tab-selected="showTab" v-show="showViewsTab">Views</tab-handle>
				<tab-handle name="emails" :active="isTabActive('emails')" @tab-selected="showTab" v-show="showEmailsTab">Emails</tab-handle>
				<tab-handle name="routes" :active="isTabActive('routes')" @tab-selected="showTab" v-show="showRoutesTab">Routes</tab-handle>
				<tab-handle v-for="userTab in $get($request, 'userData')" :key="`${$request.id}-${userTab.key}`" :name="`user-${userTab.key}`" :active="isTabActive(`user-${userTab.key}`)" @tab-selected="showTab">{{ userTab.title }}</tab-handle>
				<tab-handle name="output" :active="isTabActive('output')" @tab-selected="showTab" v-show="showOutputTab">Output</tab-handle>
			</div>

			<div class="icons">
				<a href="#" title="Preserve log" @click="togglePreserveLog" v-show="$store.data.requestSidebarCollapsed">
					<font-awesome-icon :icon="$store.data.preserveLog ? 'circle' : ['far', 'circle']"></font-awesome-icon>
				</a>
				<a href="#" title="Clear" @click="clear" v-show="$store.data.requestSidebarCollapsed">
					<font-awesome-icon icon="ban"></font-awesome-icon>
				</a>
				<a href="#" title="Settings" @click="toggleSettingsModal" :class="{'active': $settings.shown}">
					<font-awesome-icon icon="cog"></font-awesome-icon>
				</a>
				<a href="#" title="Toggle sidebar" @click="toggleRequestSidebar">
					<font-awesome-icon :icon="$store.data.requestSidebarCollapsed ? 'outdent' : 'indent'"></font-awesome-icon>
				</a>
			</div>
		</div>

		<settings-modal></settings-modal>
		<messages-overlay></messages-overlay>

		<div class="details-content" v-if="$request && ! $request.loading && ! $request.error">

			<events-tab v-show="isTabActive('events')"></events-tab>
			<database-tab v-show="isTabActive('database')"></database-tab>
			<cache-tab v-show="isTabActive('cache')"></cache-tab>
			<redis-tab v-show="isTabActive('redis')"></redis-tab>
			<queue-tab v-show="isTabActive('queue')"></queue-tab>
			<log-tab v-show="isTabActive('log')"></log-tab>
			<performance-tab v-show="isTabActive('performance')"></performance-tab>
			<views-tab v-show="isTabActive('views')"></views-tab>
			<emails-tab v-show="isTabActive('emails')"></emails-tab>
			<routes-tab v-show="isTabActive('routes')"></routes-tab>
			<user-tab v-for="userTab, index in $get($request, 'userData')" :key="`${$request.id}-${index}`" :user-tab="userTab" v-show="isTabActive(`user-${userTab.key}`)"></user-tab>
			<output-tab v-show="isTabActive('output')"></output-tab>

		</div>

		<div class="details-loading-overlay" v-show="$get($request, 'loading') && ! $authentication.shown">
			<spinner name="fading-circle"></spinner>
		</div>

		<div class="details-error-overlay" v-show="$get($request, 'error') && $get($request, 'error.error') != 'requires-authentication'">
			<font-awesome-icon icon="exclamation-circle"></font-awesome-icon>
			<p class="title">Error loading request metadata.</p>
			<p class="message">{{$get($request, 'error.error')}}</p>
		</div>

		<div class="details-authentication-overlay" :class="{failed:$authentication.failed}" v-show="$authentication.shown">
			<form @submit.prevent="$authentication.attempt()">
				<font-awesome-icon icon="lock"></font-awesome-icon>
				<p class="title">This site requires authentication.</p>
				<p class="title failed">Authentication failed.</p>
				<p class="message" v-show="$authentication.message">{{ $authentication.message }}</p>
				<p v-show="$authentication.requires.includes('username')">
					<input type="text" v-model="$authentication.username" placeholder="Username">
				</p>
				<p v-show="$authentication.requires.includes('password')">
					<input type="password" v-model="$authentication.password" placeholder="Password">
				</p>
				<p>
					<button type="submit">Submit</button>
				</p>
			</form>
		</div>
	</div>
</template>

<script>
import MessagesOverlay from './Details/MessagesOverlay'
import SettingsModal from './Settings/SettingsModal'
import TabHandle from './Details/TabHandle'

import CacheTab from './Tabs/CacheTab'
import DatabaseTab from './Tabs/DatabaseTab'
import EmailsTab from './Tabs/EmailsTab'
import EventsTab from './Tabs/EventsTab'
import LogTab from './Tabs/LogTab'
import OutputTab from './Tabs/OutputTab'
import PerformanceTab from './Tabs/PerformanceTab'
import RedisTab from './Tabs/RedisTab'
import QueueTab from './Tabs/QueueTab'
import RoutesTab from './Tabs/RoutesTab'
import UserTab from './Tabs/UserTab'
import ViewsTab from './Tabs/ViewsTab'

export default {
	name: 'RequestDetails',
	components: {
		MessagesOverlay, SettingsModal, TabHandle, CacheTab, DatabaseTab, EmailsTab, EventsTab, LogTab, OutputTab,
		PerformanceTab, RedisTab, QueueTab, RoutesTab, UserTab, ViewsTab
	},
	computed: {
		showLogTab() { return this.$request?.log?.length },
		showDatabaseTab() {
			return this.$request?.databaseQueriesCount || this.$request?.databaseQueries?.length
		},
		showCacheTab() {
			return [ 'cacheReads', 'cacheHits', 'cacheWrites', 'cacheDeletes', 'cacheTime' ].some(prop => this.$request?.[prop])
				|| this.$request?.cacheQueries.length
		},
		showRedisTab() { return this.$request?.redisCommands?.length },
		showQueueTab() { return this.$request?.queueJobs?.length },
		showEventsTab() { return this.$request?.events?.length },
		showViewsTab() { return this.$request?.views?.length },
		showEmailsTab() { return this.$request?.emails?.length },
		showRoutesTab() { return this.$request?.routes?.length },
		showOutputTab() { return this.$request?.commandOutput }
	},
	methods: {
		isTabActive(tab) { return this.$request && this.global.activeTab == tab },
		showTab(tab) {
			this.global.activeTab = tab
			this.global.showIncomingRequests = false
		},
		toggleRequestsList() {
			this.$store.set('requestsListCollapsed', ! this.$store.get('requestsListCollapsed'))
		},
		toggleRequestSidebar() {
			this.$store.set('requestSidebarCollapsed', ! this.$store.get('requestSidebarCollapsed'))
		},
		togglePreserveLog() {
			this.$store.set('preserveLog', ! this.$store.get('preserveLog'))
		},
		toggleSettingsModal() {
			this.$settings.toggle()
		},
		clear() { this.$requests.clear() }
	}
}
</script>

<style lang="scss">
.split-view-details {
	overflow: hidden;
}
</style>
