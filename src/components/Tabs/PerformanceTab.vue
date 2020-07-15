<template>
	<div v-show="active">
		<div class="counters-row">
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
				<a class="performance-tab" :class="{ 'active': isTabActive('profiler') }" href="#" @click.prevent="showTab('profiler')">
					<icon name="clock"></icon> Profiler
				</a>
			</div>

			<performance-log :issues="performanceIssues" :slow-queries="databaseSlowQueries" v-show="isTabActive('issues')"></performance-log>
			<timeline name="performance" :timeline="$request.timeline" :tags="timelineTags" v-show="isTabActive('timeline')"></timeline>
			<profiler v-show="isTabActive('profiler')"></profiler>
		</div>
	</div>
</template>

<script>
import PerformanceChart from './Performance/PerformanceChart'
import PerformanceLog from './Performance/PerformanceLog'
import Profiler from './Performance/Profiler'
import Timeline from './Performance/Timeline'

import Filter from '../../features/filter'

export default {
	name: 'PerformanceTab',
	components: { PerformanceChart, PerformanceLog, Profiler, Timeline },
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
			{ tag: 'emails', icon: 'mail', title: 'Emails' }
		]
	}),
	computed: {
		activePerformanceTab() {
			let activeTab = this.selectedPerformanceTab || 'issues'

			if (activeTab == 'issues' && ! this.databaseSlowQueries.length && ! this.performanceIssues.length) return 'timeline'

			return activeTab
		},

		databaseSlowQueries() {
			return this.$request.databaseQueries.filter(query => query.tags.includes('slow'))
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
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

$performance-colors-light: (
	blue:   rgb(66, 149, 197),
	red:    rgb(209, 107, 108),
	green:  rgb(152, 186, 81),
	purple: rgb(151, 114, 181),
	grey:   hsl(240, 5, 27)
);

$performance-colors-dark: (
	blue:   rgb(100, 157, 202),
	red:    rgb(211, 130, 131),
	green:  rgb(157, 182, 89),
	purple: rgb(166, 128, 210),
	grey:   hsl(240, 5, 52)
);

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
	margin-bottom: 15px;
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
		}

		&.active {
		    background: #258cdb;
		    color: #f5f5f5;

			@include dark {
				color: hsl(31, 98%, 48%);
			}
		}

		.ui-icon {
		    margin-right: 5px;
		}
	}
}
</style>
