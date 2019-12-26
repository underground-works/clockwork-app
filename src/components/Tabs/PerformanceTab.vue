<template>
	<div>
		<div class="counters-row">
			<div class="performance-chart-container">
				<div class="performance-chart">
					<pie-chart :donut="true" :data="chartValues" :colors="chartColors" :library="chartOptions" height="60px"></pie-chart>
				</div>
			</div>
			<div v-for="metric, index in $request.performanceMetrics" class="counter performance-chart-legend" :class="metric.style" :key="`${$request.id}-${index}`">
				<div class="counter-value">{{metric.value}} ms</div>
				<div class="counter-title">{{metric.name}}</div>
			</div>
			<div class="counter" v-if="$request.responseDurationRounded">
				<div class="counter-value">{{$request.responseDurationRounded}} ms</div>
				<div class="counter-title">total</div>
			</div>
			<div class="counter" v-if="$request.memoryUsage">
				<div class="counter-value">{{$request.memoryUsageFormatted}}</div>
				<div class="counter-title">memory</div>
			</div>
		</div>

		<performance-log></performance-log>

		<div tabs="performance">
			<div class="performance-tabs">
				<a class="performance-tab" :class="{ 'active': isTabActive('timeline') }" href="#" @click.prevent="showTab('timeline')">Timeline</a>
				<a class="performance-tab" :class="{ 'active': isTabActive('profiler') }" href="#" @click.prevent="showTab('profiler')">Profiler</a>
			</div>

			<timeline :items="$request.timeline" :tags="timelineTags" v-show="isTabActive('timeline')"></timeline>
			<profiler v-show="isTabActive('profiler')"></profiler>
		</div>
	</div>
</template>

<script>
import PerformanceLog from './Performance/PerformanceLog'
import Profiler from './Performance/Profiler'
import Timeline from './Performance/Timeline'

import Filter from '../../features/filter'

export default {
	name: 'PerformanceTab',
	components: { PerformanceLog, Profiler, Timeline },
	data: () => ({
		activePerformanceTab: 'timeline',
		timelineTags: [
			{ tag: 'events', icon: [ 'fas', 'bullhorn' ], title: 'Events' },
			{ tag: 'databaseQueries', icon: [ 'fas', 'database' ], title: 'Database' }
		]
	}),
	computed: {
		chartValues() {
			return this.$request?.performanceMetrics.map(metric => [ metric.name, metric.value ])
		},
		chartColors() {
			let colors = {
				style1: { light: '#78b1de', dark: '#649dca' },
				style2: { light: '#e79697', dark: '#d38283' },
				style3: { light: '#b1ca6d', dark: '#9db659' },
				style4: { light: '#ba94e6', dark: '#a680d2' }
			}

			let appearance = this.$settings.global.appearance != 'auto' ? this.$settings.global.appearance : this.defaultAppearance

			return this.$request?.performanceMetrics.map(metric => colors[metric.style][appearance])
		},
		chartOptions() {
			let appearance = this.$settings.global.appearance != 'auto' ? this.$settings.global.appearance : this.defaultAppearance

			return {
				legend: { display: false },
				tooltips: { enabled: false },
				hover: { mode: null },
				elements: { arc: { borderColor: appearance == 'dark' ? '#1f1f1f' : '#fff' } }
			}
		}
	},
	methods: {
		isTabActive(tab) { return this.activePerformanceTab == tab },
		showTab(tab) {
			this.activePerformanceTab = tab

			if (tab == 'profiler') this.$profiler.loadRequest(this.$request)
		}
	}
}
</script>
