<template>
	<div class="performance-chart">
		<div class="chart-section" :class="section.class" :style="section.style" v-for="section in sections"></div>
	</div>
</template>

<script>
import debounce from 'just-debounce-it'

export default {
	name: 'PerformanceChart',
	props: { metrics: { default: () => ([]) } },
	data: () => ({
		sections: []
	}),
	methods: {
		refreshSections() {
			let width = this.$el.offsetWidth
			let total = this.metrics.reduce((sum, metric) => sum + metric.value, 0)

			this.sections = this.metrics.map(metric => {
				return {
					class: `section-${metric.color}`,
					style: `width: ${width * metric.value / total}px`
				}
			})
		}
	},
	mounted() {
		this.refreshSections()

		this.resizeObserver = new ResizeObserver(debounce(entries => this.refreshSections(), 10))
		this.resizeObserver.observe(this.$el)
	},
	watch: {
		metrics() { this.refreshSections() }
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

$performance-chart-colors-light: (
	blue:   ( normal: rgb(66, 149, 197),  alternative: rgb(120, 177, 222) ),
	red:    ( normal: rgb(209, 107, 108), alternative: rgb(231, 150, 151) ),
	green:  ( normal: rgb(152, 186, 81),  alternative: rgb(177, 202, 109) ),
	purple: ( normal: rgb(151, 114, 181), alternative: rgb(186, 148, 230) ),
	grey:   ( normal: hsl(240, 5, 27),    alternative: hsl(240, 5, 62) )
);

$performance-chart-colors-dark: (
	blue:   ( normal: rgb(100, 157, 202), alternative: rgb(46, 129, 177) ),
	red:    ( normal: rgb(211, 130, 131), alternative: rgb(189, 87, 88) ),
	green:  ( normal: rgb(157, 182, 89),  alternative: rgb(132, 166, 61) ),
	purple: ( normal: rgb(166, 128, 210), alternative: rgb(131, 94, 161) ),
	grey:   ( normal: hsl(240, 5, 52),    alternative: hsl(240, 5, 37) )
);

.performance-chart {
	background: hsl(240, 5, 27);
	border-radius: 4px;
	box-shadow: 0 2px 5px rgba(162, 172, 180, 0.25), 0 0 2px rgba(162, 172, 180, 0.5);
	display: flex;
	height: 8px;
	margin: 0 auto 20px;
	width: calc(100% - 2px);

	@include dark { background: hsl(240, 5, 52); }

	.chart-section {
		height: 100%;

		&:first-child { border-radius: 4px 0 0 4px; }
		&:last-child { border-radius: 0 4px 4px 0; }

		@each $color, $value in $performance-chart-colors-light {
			&.section-#{$color} {
				background: linear-gradient(to bottom, map-get($value, 'alternative'), map-get($value, 'normal'));
			}
		}

		@include dark {
			@each $color, $value in $performance-chart-colors-dark {
				&.section-#{$color} {
					background: linear-gradient(to bottom, map-get($value, 'alternative'), map-get($value, 'normal'));
				}
			}
		}
	}
}
</style>
