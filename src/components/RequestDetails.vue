<template>
	<div class="split-view-pane split-view-details popover-viewport">

		<div class="details-header">
			<div class="icons">
				<a href="#" title="Toggle requests" @click="toggleRequestsList">
					<icon :name="$settings.global.requestsListCollapsed ? 'chevron-right' : 'chevron-left'"></icon>
				</a>
			</div>

			<tab-bar :tabs="tabs" :active-tab="activeTab" @tab-selected="showTab"></tab-bar>

			<div class="icons">
				<a href="#" title="Settings" @click="toggleSettingsModal" :class="{'active': $settings.shown}">
					<icon name="settings"></icon>
				</a>
				<a href="#" title="Toggle sidebar" @click="toggleRequestSidebar">
					<icon :name="$settings.global.requestSidebarCollapsed ? 'chevron-left' : 'chevron-right'"></icon>
				</a>
			</div>
		</div>

		<settings-modal></settings-modal>
		<messages-overlay></messages-overlay>

		<div class="details-content" v-if="$request && ! $request.loading && ! $request.error">

			<div class="content-header"></div>

			<div class="content-content">
				<events-tab :active="activeTab == 'events'"></events-tab>
				<database-tab :active="activeTab == 'database'"></database-tab>
				<cache-tab :active="activeTab == 'cache'"></cache-tab>
				<redis-tab :active="activeTab == 'redis'"></redis-tab>
				<queue-tab :active="activeTab == 'queue'"></queue-tab>
				<log-tab :active="activeTab == 'log'"></log-tab>
				<performance-tab :active="activeTab == 'performance'"></performance-tab>
				<views-tab :active="activeTab == 'views'"></views-tab>
				<emails-tab :active="activeTab == 'emails'"></emails-tab>
				<routes-tab :active="activeTab == 'routes'"></routes-tab>
				<user-tab v-for="userTab, index in $get($request, 'userData')" :key="`${$request.id}-${index}`" :user-tab="userTab" :active="activeTab == `user-${userTab.key}`"></user-tab>
				<output-tab :active="activeTab == 'output'"></output-tab>
			</div>

		</div>

		<div class="details-loading-overlay" v-show="$get($request, 'loading') && ! $authentication.shown">
			<spinner name="fading-circle"></spinner>
		</div>

		<div class="details-error-overlay" v-show="$get($request, 'error') && $get($request, 'error.error') != 'requires-authentication'">
			<icon name="alert-circle"></icon>
			<p class="title">Error loading request metadata.</p>
			<p class="message">{{$get($request, 'error.error')}}</p>
		</div>

		<div class="details-authentication-overlay" :class="{failed:$authentication.failed}" v-show="$authentication.shown">
			<form @submit.prevent="$authentication.attempt()">
				<icon name="lock"></icon>
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
import TabBar from './Details/TabBar'

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
		MessagesOverlay, SettingsModal, TabBar, CacheTab, DatabaseTab, EmailsTab, EventsTab, LogTab, OutputTab,
		PerformanceTab, RedisTab, QueueTab, RoutesTab, UserTab, ViewsTab
	},
	computed: {
		tabs() {
			return [
				{ text: 'Performance', name: 'performance', icon: 'activity', shown: true },
				{ text: 'Log', name: 'log', icon: 'edit-2', shown: this.shownTabs.log },
				{ text: 'Events', name: 'events', icon: 'zap', shown: this.shownTabs.events },
				{ text: 'Database', name: 'database', icon: 'database', shown: this.shownTabs.database },
				{ text: 'Cache', name: 'cache', icon: 'paperclip', shown: this.shownTabs.cache },
				{ text: 'Redis', name: 'redis', icon: 'layers', shown: this.shownTabs.redis },
				{ text: 'Queue', name: 'queue', icon: 'clock', shown: this.shownTabs.queue },
				{ text: 'Views', name: 'views', icon: 'image', shown: this.shownTabs.views },
				{ text: 'Emails', name: 'emails', icon: 'mail', shown: this.shownTabs.emails },
				{ text: 'Routes', name: 'routes', icon: 'map', shown: this.shownTabs.routes }
			].concat(
				this.$request?.userData?.map(userTab => ({ text: userTab.title, name: `user-${userTab.key}`, icon: 'menu' }))
			).concat([
				{ text: 'Output', name: 'output', icon: 'terminal', shown: this.shownTabs.output }
			]).filter(Boolean)
		},

		activeTab() {
			if (! this.$request) return
			if (this.shownTabs[this.global.activeDetailsTab] === false) return 'performance'

			return this.global.activeDetailsTab
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
				views: this.$request?.viewsData?.events.length > 0,
				emails: this.$request?.emails?.length > 0,
				routes: this.$request?.routes?.length > 0,
				output: this.$request?.commandOutput?.length > 0
			}
		}
	},
	methods: {
		showTab(tab) {
			this.global.activeDetailsTab = tab
			this.global.showIncomingRequests = false
		},
		toggleRequestsList() {
			this.$settings.global.requestsListCollapsed = ! this.$settings.global.requestsListCollapsed
			this.$settings.save()
		},
		toggleRequestSidebar() {
			this.$settings.global.requestSidebarCollapsed = ! this.$settings.global.requestSidebarCollapsed
			this.$settings.save()
		},
		toggleSettingsModal() {
			this.$settings.toggle()
		}
	}
}
</script>

<style lang="scss">
.split-view-details {
	overflow: hidden;
}
</style>
