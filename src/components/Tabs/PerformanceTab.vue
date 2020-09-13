<template>
	<div v-show="active">
		<div class="counters-row performance-metrics">
			<div class="counter" v-if="$request.responseDurationRounded">
				<div class="counter-value">{{$request.responseDurationRounded}} ms</div>
				<div class="counter-title">Response time</div>
			</div>
			<div class="counter" v-if="$request.memoryUsage">
				<div class="counter-value">{{$request.memoryUsageFormatted}}</div>
				<div class="counter-title">Memory</div>
			</div>
			<div class="counters-group right-aligned">
				<div v-for="metric, index in $request.performanceMetrics" class="counter performance-chart-legend" :key="`${$request.id}-${index}`">
					<div class="counter-value">{{metric.value}} ms</div>
					<div class="counter-title has-mark" :class="`mark-${metric.color}`">{{metric.name}}</div>
				</div>
			</div>
		</div>

		<performance-chart :metrics="$request.performanceMetrics"></performance-chart>

		<div tabs="performance">
			<div class="performance-tabs">
				<a class="performance-tab" :class="{ 'active': isTabActive('issues') }" href="#" @click.prevent="showTab('issues')" v-if="databaseSlowQueries.length || performanceIssues.length">
					<icon name="alert-triangle"></icon> Issues
				</a>
				<a class="performance-tab" :class="{ 'active': isTabActive('timeline') }" href="#" @click.prevent="showTab('timeline')">
					<icon name="pie-chart"></icon> Timeline
				</a>
				<a class="performance-tab" :class="{ 'active': isTabActive('client-side') }" href="#" @click.prevent="showTab('client-side')" v-if="isClientSideTabAvailable">
					<icon name="smile"></icon> Client-side
				</a>
				<a class="performance-tab" :class="{ 'active': isTabActive('profiler') }" href="#" @click.prevent="showTab('profiler')">
					<icon name="clock"></icon> Profiler
				</a>
			</div>

			<performance-log :issues="performanceIssues" :slow-queries="databaseSlowQueries" v-show="isTabActive('issues')"></performance-log>
			<timeline name="performance" :timeline="$request.timeline" :tags="timelineTags" v-show="isTabActive('timeline')"></timeline>
			<performance-client-side :metrics="$request.clientMetrics" :vitals="$request.webVitals" v-show="isTabActive('client-side')"></performance-client-side>
			<profiler v-show="isTabActive('profiler')"></profiler>
		</div>
	</div>
</template>

<script>
import PerformanceChart from './Performance/PerformanceChart'
import PerformanceClientSide from './Performance/PerformanceClientSide'
import PerformanceLog from './Performance/PerformanceLog'
import Profiler from './Performance/Profiler'
import Timeline from './Performance/Timeline'

import Filter from '../../features/filter'

export default {
	name: 'PerformanceTab',
	components: { PerformanceChart, PerformanceClientSide, PerformanceLog, Profiler, Timeline },
	props: [ 'active' ],
	data: () => ({
		selectedPerformanceTab: null,
		timelineTags: [
			{ tag: 'events', icon: 'zap', title: 'Events' },
			{ tag: 'databaseQueries', icon: 'database', title: 'Database' },
			{ tag: 'cacheQueries', icon: 'paperclip', title: 'Cache' },
			{ tag: 'redisCommands', icon: 'layers', title: 'Redis' },
			{ tag: 'queueJobs', icon: 'clock', title: 'Queue' },
			{ tag: 'views', icon: 'image', title: 'Views' },
			{ tag: 'notifications', icon: 'mail', title: 'Notifications' }
		]
	}),
	computed: {
		activePerformanceTab() {
			let activeTab = this.selectedPerformanceTab || 'issues'

			if (activeTab == 'issues' && ! this.databaseSlowQueries.length && ! this.performanceIssues.length) return 'timeline'
			if (activeTab == 'client-side' && ! this.isClientSideTabAvailable) return 'timeline'

			return activeTab
		},

		databaseSlowQueries() {
			return this.$request.databaseQueries.filter(query => query.tags.includes('slow'))
		},

		isClientSideTabAvailable() {
			return this.$request.clientMetrics.filter(m => m.value).length
				|| Object.values(this.$request.webVitals).filter(v => v.value).length
		},

		performanceIssues() {
			return this.$request.log.filter(message => message.context?.performance).map(message => {
				return extend({}, message, { context: omit(message.context, [ 'performance', 'trace' ]) })
			})
		}
	},
	methods: {
		isTabActive(tab) { return this.activePerformanceTab == tab },
		showTab(tab) {
			this.selectedPerformanceTab = tab

			if (tab == 'profiler') this.$profiler.loadRequest(this.$request)
		},

		refreshRequest() {
			if (! this.active || ! this.$request) return

			this.$request.loadClientMetrics(this.$requests)

			if (this.activePerformanceTab == 'profiler') this.$profiler.loadRequest(this.$request)
		}
	},
	watch: {
		active() { this.refreshRequest() },
		$request() { this.refreshRequest() }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

$performance-colors-light: (
	blue:   hsl(212, 89%, 55%),
	red:    hsl(359, 57%, 55%),
	green:  hsl(109, 52%, 45%),
	purple: hsl(273, 57%, 55%),
	grey:   hsl(240, 5, 27)
);

$performance-colors-dark: (
	blue:   hsl(212, 76%, 60%),
	red:    hsl(359, 45%, 60%),
	green:  hsl(109, 40%, 50%),
	purple: hsl(273, 45%, 60%),
	grey:   hsl(240, 5, 60)
);

.performance-metrics {
	margin-bottom: 15px !important;
}

.performance-chart-legend {
	@each $color, $value in $performance-colors-light {
		.mark-#{$color}:before {
			background: $value;
		}
	}

	@include dark {
		@each $color, $value in $performance-colors-dark {
			.mark-#{$color}:before {
				background: $value;
			}
		}
	}
}

.performance-tabs {
	display: flex;
	flex: 1;
	justify-content: center;
	margin-bottom: 10px;
	margin-top: 30px;

	.performance-tab {
		align-items: center;
	    border-radius: 12px;
		color: rgb(64, 64, 64);
		cursor: default;
		display: flex;
		font-size: 12px;
		line-height: 26px;
		padding: 0 26px;
		text-align: center;
		text-decoration: none;

		@include dark {
			color: rgb(158, 158, 158);
		}

		&:hover {
			color: #258cdb;

			@include dark { color: #f27e02; }
		}

		&.active {
		    background: rgb(39, 134, 243);
		    color: #f5f5f5;

			@include dark {
				background: #de7402;
				color: #fff;
			}
		}

		.ui-icon {
		    margin-right: 5px;
		}
	}
}
</style>
