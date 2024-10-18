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
	"blue":   ( normal: hsl(212deg 89% 55%), alternative: hsl(212deg 88% 70%) ),
	"red":    ( normal: hsl(359deg 57% 55%), alternative: hsl(359deg 57% 70%) ),
	"green":  ( normal: hsl(109deg 52% 45%), alternative: hsl(109deg 52% 60%) ),
	"purple": ( normal: hsl(273deg 57% 55%), alternative: hsl(273deg 57% 70%) ),
	"grey":   ( normal: hsl(240deg 5% 27%),  alternative: hsl(240deg 5% 62%) )
);

$performance-chart-colors-dark: (
	"blue":   ( normal: hsl(212deg 76% 60%), alternative: hsl(212deg 77% 50%) ),
	"red":    ( normal: hsl(359deg 45% 60%), alternative: hsl(359deg 45% 50%) ),
	"green":  ( normal: hsl(109deg 40% 50%), alternative: hsl(109deg 40% 40%) ),
	"purple": ( normal: hsl(273deg 45% 60%), alternative: hsl(273deg 45% 50%) ),
	"grey":   ( normal: hsl(240deg 5% 60%),  alternative: hsl(240deg 5% 40%) )
);

.performance-chart {
	background: hsl(240deg 5% 27%);
	border-radius: 3px;
	box-shadow: 0 2px 5px rgba(162, 172, 180, 0.25), 0 0 2px rgba(162, 172, 180, 0.5);
	display: flex;
	height: 6px;
	margin: 0 auto 20px;
	overflow: hidden;
	width: calc(100% - 2px);

	@include dark {
		background: hsl(240deg 5% 52%);
		box-shadow: 0 0 1px 1px hsl(240deg 5% 8%), 0 2px 4px 0 hsl(240deg 5% 8%);
	}

	.chart-section {
		height: 100%;

		&:first-child {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}

		&:last-child {
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
		}

		@each $color, $value in $performance-chart-colors-light {
			&.section-#{$color} {
				background: linear-gradient(to bottom, map-get($value, 'alternative'), map-get($value, 'normal'));
			}
		}

		@include dark {
			@each $color, $value in $performance-chart-colors-dark {
				&.section-#{$color} {
					background: linear-gradient(to bottom, map-get($value, 'normal'), map-get($value, 'alternative'));
				}
			}
		}
	}
}
</style>
