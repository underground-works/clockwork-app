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
	blue:   rgb(66, 149, 197),
	red:    rgb(209, 107, 108),
	green:  rgb(152, 186, 81),
	purple: rgb(151, 114, 181),
	grey:   hsl(240, 5, 27)
);

$performance-chart-colors-dark: (
	blue:   rgb(100, 157, 202),
	red:    rgb(211, 130, 131),
	green:  rgb(157, 182, 89),
	purple: rgb(166, 128, 210),
	grey:   hsl(240, 5, 52)
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
				background: $value;
			}
		}

		@include dark {
			@each $color, $value in $performance-chart-colors-dark {
				&.section-#{$color} {
					background: $value;
				}
			}
		}
	}
}
</style>
