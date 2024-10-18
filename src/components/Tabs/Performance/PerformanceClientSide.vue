<template>
	<div class="performance-client-side">
		<div class="counters-row performance-metrics" v-if="metrics.filter(m => m.value).length">
			<div class="counter performance-chart-legend" v-if="metric.value" v-for="metric in metrics.filter(m => ! m.dom)">
				<div class="counter-value">{{metric.value}} ms</div>
				<div class="counter-title" :class="metric.color ? `has-mark mark-${metric.color}` : ''">{{metric.name}}</div>
			</div>
			<div class="counters-group right-aligned">
				<div class="counter performance-chart-legend" v-if="metric.value" v-for="metric in metrics.filter(m => m.dom)">
					<div class="counter-value">{{metric.value}} ms</div>
					<div class="counter-title" :class="metric.color ? `has-mark mark-${metric.color}` : ''">{{metric.name}}</div>
				</div>
			</div>
		</div>

		<performance-chart :metrics="metrics.filter(m => m.onChart)" v-if="metrics.filter(m => m.value && m.onChart).length"></performance-chart>

		<details-table title="Vitals" icon="activity" :items="[]" class="performance-vitals" v-if="Object.values(vitals).filter(v => v.value).length">
			<template v-slot:toolbar>
				<div class="header-group">
					<a href="#" title="Show info" class="header-item" :class="{'active':showVitalsInfo}" @click.prevent="toggleVitalsInfo">
						<icon name="help-circle"></icon>
					</a>
				</div>
			</template>
			<template v-slot:body>
				<tr>
					<td>
						<div class="vitals-row">
							<div class="vitals-metric">
								<div class="metric-name">Time To First Byte</div>
								<div class="metric-value" :class="`value-${vitals.ttfb.score}`" v-if="vitals.ttfb.available">
									{{ $round(vitals.ttfb.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									Time at which your server sends a response.
									<a href="https://web.dev/time-to-first-byte/" target="_blank">Learn more</a>
								</div>
							</div>
							<div class="vitals-metric">
								<div class="metric-name">First Input Delay</div>
								<div class="metric-value" :class="`value-${vitals.fid.score}`" v-if="vitals.fid.available">
									{{ $round(vitals.fid.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									Time from when a user first interacts with a page to the time when the browser is actually able to respond to that interaction.
									<a href="https://web.dev/fid/" target="_blank">Learn more</a>
								</div>
							</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<div class="vitals-row">
							<div class="vitals-metric">
								<div class="metric-name">First Contentful Paint</div>
								<div class="metric-value" :class="`value-${vitals.fcp.score}`" v-if="vitals.fcp.available">
									{{ $round(vitals.fcp.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									First Contentful Paint marks the time at which the first text or image is painted.
									<a href="https://web.dev/first-contentful-paint/" target="_blank">Learn more</a>
								</div>
							</div>
							<div class="vitals-metric">
								<div class="metric-name">Largest Contentful Paint</div>
								<div class="metric-value" :class="`value-${vitals.lcp.score}`" v-if="vitals.lcp.available">
									{{ $round(vitals.lcp.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									Largest Contentful Paint marks the time at which the largest text or image is painted.
									<a href="https://web.dev/lighthouse-largest-contentful-paint/" target="_blank">Learn more</a>
								</div>
							</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<div class="vitals-row">
							<div class="vitals-metric">
								<div class="metric-name">Cumulative Layout Shift</div>
								<div class="metric-value" :class="`value-${vitals.cls.score}`" v-if="vitals.cls.available">
									{{ $round(vitals.cls.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									Cumulative Layout Shift measures the movement of visible elements within the viewport.
									<a href="https://web.dev/cls/" target="_blank">Learn more</a>
								</div>
							</div>
							<div class="vitals-metric">
								<div class="metric-name">Speed Index</div>
								<div class="metric-value" :class="`value-${vitals.si.score}`" v-if="vitals.si.available">
									{{ $round(vitals.si.value) }} ms
								</div>
								<div class="metric-value value-unavailable" v-else>—</div>
								<div class="metric-info" v-show="showVitalsInfo">
									Speed Index shows how quickly the contents of a page are visibly populated.
									<a href="https://web.dev/speed-index/" target="_blank">Learn more</a>
								</div>
							</div>
						</div>
					</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'
import PerformanceChart from './PerformanceChart'

export default {
	name: 'PerformanceClientSide',
	components: { DetailsTable, PerformanceChart },
	props: [ 'metrics', 'vitals' ],
	computed: {
		showVitalsInfo() { return this.$settings.global.performanceVitalsInfoShown }
	},
	methods: {
		toggleVitalsInfo() {
			this.$settings.global.performanceVitalsInfoShown = ! this.$settings.global.performanceVitalsInfoShown
			this.$settings.save()
		}
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

.performance-vitals {
	tbody tr:first-child .vitals-row {
		margin-top: 10px;
	}

	.vitals-row {
		display: flex;
		flex-wrap: wrap;
		margin: 0 auto;
		max-width: 600px;
	}

	.vitals-metric {
		align-items: center;
		display: flex;
		font-weight: 500;
		flex-wrap: wrap;
		padding: 12px 24px;
		width: 50%;

		&:first-child {
			border-right: 1px solid hsl(240deg 20% 92%);

			@include dark {
				border-right: 1px solid rgb(52, 52, 54);
			}
		}

		.metric-value {
			border-radius: 8px;
			font-size: 95%;
			margin-left: auto;
			padding: 2px 6px;

			&.value-fast {
				background: #e3eccb;
				color: #586336;

				@include dark {
					background: hsl(76deg 100% 11%);
				    color: hsl(75deg 90% 80%);
				}
			}

			&.value-moderate {
				background: #fff6cc;
				color: #a85919;

				@include dark {
				    background: #382f00;
				    color: #fad89f;
				}
			}

			&.value-slow {
				background: #ffebeb;
				color: #c51f24;

				@include dark {
					background: #380000;
					color: #ed797a;
				}
			}
		}

		.metric-info {
			color: gray;
			font-weight: normal;
			margin-top: 10px;
			width: 100%;

			a {
				color: gray;
				display: block;
				margin-top: 5px;
			}
		}
	}
}
</style>
