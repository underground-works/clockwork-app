<template>
	<div class="split-view-pane split-view-details">

		<div class="details-header">
			<div class="icons">
				<a href="#" title="Toggle requests" v-show="! requestsListCollapsed" @click="toggleRequestsList">
					<font-awesome-icon icon="outdent"></font-awesome-icon>
				</a>
				<a href="#" title="Toggle requests" v-show="requestsListCollapsed" @click="toggleRequestsList">
					<font-awesome-icon icon="indent"></font-awesome-icon>
				</a>
			</div>

			<div class="details-header-tabs">
				<tab-handle name="request" :active="isTabActive('request')" @tab-selected="showTab">Request</tab-handle>
				<tab-handle name="performance" :active="isTabActive('performance')" @tab-selected="showTab">Performance</tab-handle>
				<tab-handle name="log" :active="isTabActive('log')" @tab-selected="showTab">Log</tab-handle>
				<tab-handle name="events" :active="isTabActive('events')" @tab-selected="showTab" v-show="showEventsTab">Events</tab-handle>
				<tab-handle name="database" :active="isTabActive('database')" @tab-selected="showTab" v-show="showDatabaseTab">Database</tab-handle>
				<tab-handle name="cache" :active="isTabActive('cache')" @tab-selected="showTab" v-show="showCacheTab">Cache</tab-handle>
				<tab-handle name="session" :active="isTabActive('session')" @tab-selected="showTab" v-show="showSessionTab">Session</tab-handle>
				<tab-handle name="views" :active="isTabActive('views')" @tab-selected="showTab" v-show="showViewsTab">Views</tab-handle>
				<tab-handle name="emails" :active="isTabActive('emails')" @tab-selected="showTab" v-show="showEmailsTab">Emails</tab-handle>
				<tab-handle name="routes" :active="isTabActive('routes')" @tab-selected="showTab" v-show="showRoutesTab">Routes</tab-handle>
				<tab-handle v-for="userTab in $get($request, 'userData')" :key="userTab.key" :name="`user-${userTab.key}`" :active="isTabActive(`user-${userTab.key}`)" @tab-selected="showTab">{{ userTab.title }}</tab-handle>
			</div>

			<div class="icons">
				<settings-popover></settings-popover>
				<a href="#" title="Preserve log" v-show="! preserveLog" @click="togglePreserveLog">
					<font-awesome-icon :icon="['far', 'circle']"></font-awesome-icon>
				</a>
				<a href="#" title="Preserve log" v-show="preserveLog" @click="togglePreserveLog">
					<font-awesome-icon icon="circle"></font-awesome-icon>
				</a>
				<a href="#" title="Clear" @click="clear">
					<font-awesome-icon icon="ban"></font-awesome-icon>
				</a>
			</div>
		</div>

		<div class="details-content" v-if="$request && ! $request.loading && ! $request.error">

			<request-tab v-show="isTabActive('request')"></request-tab>
			<events-tab v-show="isTabActive('events')"></events-tab>
			<database-tab v-show="isTabActive('database')"></database-tab>
			<cache-tab v-show="isTabActive('cache')"></cache-tab>
			<log-tab v-show="isTabActive('log')"></log-tab>
			<performance-tab v-show="isTabActive('performance')"></performance-tab>
			<session-tab v-show="isTabActive('session')"></session-tab>
			<views-tab v-show="isTabActive('views')"></views-tab>
			<emails-tab v-show="isTabActive('emails')"></emails-tab>
			<routes-tab v-show="isTabActive('routes')"></routes-tab>
			<user-tab v-for="userTab in $get($request, 'userData')" :key="userTab.key" :user-tab="userTab" v-show="isTabActive(`user-${userTab.key}`)"></user-tab>

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
import TabHandle from './Details/TabHandle'

import SettingsPopover from './Settings/SettingsPopover'
import CacheTab from './Tabs/CacheTab'
import DatabaseTab from './Tabs/DatabaseTab'
import EmailsTab from './Tabs/EmailsTab'
import EventsTab from './Tabs/EventsTab'
import LogTab from './Tabs/LogTab'
import PerformanceTab from './Tabs/PerformanceTab'
import RequestTab from './Tabs/RequestTab'
import RoutesTab from './Tabs/RoutesTab'
import SessionTab from './Tabs/SessionTab'
import UserTab from './Tabs/UserTab'
import ViewsTab from './Tabs/ViewsTab'

export default {
	name: 'RequestDetails',
	components: {
		TabHandle, SettingsPopover, CacheTab, DatabaseTab, EmailsTab, EventsTab, LogTab, PerformanceTab, RequestTab,
		RoutesTab, SessionTab, UserTab, ViewsTab
	},
	data: () => ({
		activeTab: 'request'
	}),
	computed: {
		showDatabaseTab: function () { return this.$request?.databaseQueries?.length },
		showCacheTab: function () {
			return [ 'cacheReads', 'cacheHits', 'cacheWrites', 'cacheDeletes', 'cacheTime' ].some(prop => this.$request?.[prop])
				|| this.$request?.cacheQueries.length
		},
		showEventsTab: function () { return this.$request?.events?.length },
		showSessionTab: function () { return this.$request?.sessionData?.length || this.$request?.authenticatedUser },
		showViewsTab: function () { return this.$request?.views?.length },
		showEmailsTab: function () { return this.$request?.emails?.length },
		showRoutesTab: function () { return this.$request?.routes?.length }
	},
	methods: {
		isTabActive: function (tab) { return this.$request && this.activeTab == tab },
		showTab: function (tab) { this.activeTab = tab },
		toggleRequestsList: function () { this.global.requestsListCollapsed = ! this.global.requestsListCollapsed },
		togglePreserveLog: function () { this.$platform.preserveLog = ! this.$platform.preserveLog },
		clear: function () { this.$requests.clear() }
	}
}
</script>

<style scoped lang="scss">
</style>
