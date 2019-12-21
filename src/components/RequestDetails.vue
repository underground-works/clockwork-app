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
				<tab-handle name="performance" :active="activeDetailsTab == 'performance'" @tab-selected="showTab">Performance</tab-handle>
				<tab-handle name="log" :active="activeDetailsTab == 'log'" @tab-selected="showTab" v-show="shownTabs.log">Log</tab-handle>
				<tab-handle name="events" :active="activeDetailsTab == 'events'" @tab-selected="showTab" v-show="shownTabs.events">Events</tab-handle>
				<tab-handle name="database" :active="activeDetailsTab == 'database'" @tab-selected="showTab" v-show="shownTabs.database">Database</tab-handle>
				<tab-handle name="cache" :active="activeDetailsTab == 'cache'" @tab-selected="showTab" v-show="shownTabs.cache">Cache</tab-handle>
				<tab-handle name="redis" :active="activeDetailsTab == 'redis'" @tab-selected="showTab" v-show="shownTabs.redis">Redis</tab-handle>
				<tab-handle name="queue" :active="activeDetailsTab == 'queue'" @tab-selected="showTab" v-show="shownTabs.queue">Queue</tab-handle>
				<tab-handle name="views" :active="activeDetailsTab == 'views'" @tab-selected="showTab" v-show="shownTabs.views">Views</tab-handle>
				<tab-handle name="emails" :active="activeDetailsTab == 'emails'" @tab-selected="showTab" v-show="shownTabs.emails">Emails</tab-handle>
				<tab-handle name="routes" :active="activeDetailsTab == 'routes'" @tab-selected="showTab" v-show="shownTabs.routes">Routes</tab-handle>
				<tab-handle v-for="userTab in $get($request, 'userData')" :key="`${$request.id}-${userTab.key}`" :name="`user-${userTab.key}`" :active="activeDetailsTab == `user-${userTab.key}`" @tab-selected="showTab">{{ userTab.title }}</tab-handle>
				<tab-handle name="output" :active="activeDetailsTab == 'output'" @tab-selected="showTab" v-show="shownTabs.output">Output</tab-handle>
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

			<events-tab v-show="activeDetailsTab == 'events'"></events-tab>
			<database-tab v-show="activeDetailsTab == 'database'"></database-tab>
			<cache-tab v-show="activeDetailsTab == 'cache'"></cache-tab>
			<redis-tab v-show="activeDetailsTab == 'redis'"></redis-tab>
			<queue-tab v-show="activeDetailsTab == 'queue'"></queue-tab>
			<log-tab v-show="activeDetailsTab == 'log'"></log-tab>
			<performance-tab v-show="activeDetailsTab == 'performance'"></performance-tab>
			<views-tab v-show="activeDetailsTab == 'views'"></views-tab>
			<emails-tab v-show="activeDetailsTab == 'emails'"></emails-tab>
			<routes-tab v-show="activeDetailsTab == 'routes'"></routes-tab>
			<user-tab v-for="userTab, index in $get($request, 'userData')" :key="`${$request.id}-${index}`" :user-tab="userTab" v-show="activeDetailsTab == `user-${userTab.key}`"></user-tab>
			<output-tab v-show="activeDetailsTab == 'output'"></output-tab>

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
		activeDetailsTab() {
			if (! this.$request) return
			if (this.shownTabs[this.global.activeTab] === false) return 'performance'

			return this.global.activeTab
		},

		shownTabs() {
			return {
				log: this.$request?.log?.length > 0,
				database: this.$request?.databaseQueriesCount > 0 || this.$request?.databaseQueries?.length > 0,
				cache: [ 'cacheReads', 'cacheHits', 'cacheWrites', 'cacheDeletes', 'cacheTime' ].some(prop => this.$request?.[prop])
					|| this.$request?.cacheQueries.length > 0,
				redis: this.$request?.redisCommands?.length > 0,
				queue: this.$request?.queueJobs?.length > 0,
				events: this.$request?.events?.length > 0,
				views: this.$request?.views?.length > 0,
				emails: this.$request?.emails?.length > 0,
				routes: this.$request?.routes?.length > 0,
				output: this.$request?.commandOutput?.length > 0
			}
		}
	},
	methods: {
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
