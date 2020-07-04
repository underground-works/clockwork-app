<template>
	<div class="timeline" :class="{ 'show-details': showDetails }">
		<details-table title="Timeline" :columns="columns" :items="presentedEvents" :filter="filter" :no-table-head="! showDetails" filter-example="database query duration:>50" :per-page="100">
			<template slot="toolbar" slot-scope="{ filter }">
				<div class="header-group">
					<a v-for="tag in availableTags" href="#" class="header-item" :class="{ 'active': ! hiddenTags.includes(tag.tag) }" :title="tag.title" @click="toggleTag(tag.tag)">
						<font-awesome-icon :icon="tag.icon"></font-awesome-icon>
					</a>
				</div>

				<div class="header-group">
					<label class="header-toggle">
						<input type="checkbox" v-model="condense">
						Condense
					</label>
				</div>

				<div class="header-group">
					<div class="header-search">
						<input type="search" v-model="filter.input" placeholder="Search...">
						<font-awesome-icon icon="search"></font-awesome-icon>
					</div>
				</div>

				<div class="header-group">
					<a href="#" title="Toggle details" class="header-item" @click.prevent="toggleDetails">
						<font-awesome-icon :icon="showDetails ? 'indent' : 'outdent'"></font-awesome-icon>
					</a>
				</div>
			</template>
			<template slot="body" slot-scope="{ items }">
				<tr v-for="group, index in items">
					<td class="timeline-chart">
						<div class="chart-event-group popover-container" :style="group.groupStyle" @click="showPopover(index)">
							<div class="group-label" :class="group.labelClass" :style="group.labelStyle">
								<span class="label-tags" v-if="group.tags">
									<span v-for="tag in resolveTags(group.tags)">
										<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
									</span>
								</span>
								{{group.name}}
								<span v-if="! group.condensed">{{group.duration|formatTiming}}</span>
							</div>

							<div class="group-event" :class="event.eventClass" :style="event.eventStyle" v-for='event, index in group.events'>
								<div class="event-bar">
									<div class="bar-light" :style="section.style" v-for="section in event.childrenSections"></div>
								</div>
							</div>

							<popover class="timeline-popover" ref="popovers">
								<div class="popover-event" :class="event.eventClass" v-for="event in group.events">
									<div class="event-header">
										<h1>{{event.name}}</h1>

										<div class="header-tags">
											<span v-for="tag in resolveTags(event.tags)">
												<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
											</span>
										</div>
									</div>

									<div class="event-description" v-if="event.description != event.name">
										{{event.description}}
									</div>

									<div class="event-timings">
										<div class="timings-timing timing-total">
											<div class="timing-value">
												{{event.duration|formatTiming}}
											</div>
											<div class="timing-label">
												Total
											</div>
										</div>

										<div class="timings-timing timing-self">
											<div class="timing-value">
												{{event.durationSelf|formatTiming}}
											</div>
											<div class="timing-label">
												Self
											</div>
										</div>

										<div class="timings-timing timing-children">
											<div class="timing-value">
												{{event.durationChildren|formatTiming('ms', '–')}}
											</div>
											<div class="timing-label">
												Children
											</div>
										</div>
									</div>
								</div>
							</popover>
						</div>
					</td>
					<td class="timeline-description">
						<slot name="table-description" :item="group">
							<span class="description-tags" v-if="group.tags">
								<span v-for="tag in resolveTags(group.tags)">
									<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
								</span>
							</span>
							{{group.description}}
						</slot>
					</td>
					<td class="timeline-timing timing-total">{{group.duration|formatTiming}}</td>
					<td class="timeline-timing">{{group.durationSelf|formatTiming}}</td>
					<td class="timeline-timing">{{group.durationChildren|formatTiming('ms', group.condensed ? '' : '–')}}</td>
				</tr>

				<tr class="timeline-size-monitor">
					<td class="timeline-graph" ref="timelineChart"></td>
					<td class="timeline-timing"></td>
					<td class="timeline-description"></td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'
import Popover from '../../UI/Popover'

import Filter from '../../../features/filter'

import debounce from 'just-debounce-it'

export default {
	name: 'Timeline',
	components: { DetailsTable, Popover },
	props: { name: {}, timeline: {}, tags: { default: () => [] } },
	data: () => ({
		condense: true,
		showDetails: false,

		hiddenTags: [],
		presentedEvents: [],

		filter: new Filter([
			{ tag: 'duration', type: 'number' }
		], item => item.description)
	}),
	computed: {
		availableTags() {
			return this.tags.filter(tag => this.timeline.events.find(item => item.tags && item.tags.includes(tag.tag)))
		},

		columns() {
			return [
				{ name: ' ', sortBy: 'start', class: 'timeline-chart' },
				{ name: 'Event', sortBy: 'name', class: 'timeline-description' },
				{ name: 'Total', sortBy: 'duration', class: 'timeline-timing' },
				{ name: 'Self', sortBy: 'durationSelf', class: 'timeline-timing' },
				{ name: 'Child', sortBy: 'durationChild', class: 'timeline-timing' }
			]
		}
	},
	methods: {
		toggleTag(tag) {
			if (this.hiddenTags.includes(tag)) {
				this.hiddenTags = this.hiddenTags.filter(t => t != tag)
			} else {
				this.hiddenTags.push(tag)
			}
		},

		resolveTags(tags) {
			return tags.map(tag => this.tags.find(t => t.tag == tag)).filter(tag => tag)
		},

		toggleDetails() {
			this.showDetails = ! this.showDetails
		},

		showPopover(index) {
			this.$refs.popovers[index].toggle()
		},

		refreshEvents() {
			if (! this.timeline || ! this.$refs.timelineChart) return []

			let timelineWidth = this.$refs.timelineChart.offsetWidth - 16
			let timeline = this.timeline.filter(this.filter, this.hiddenTags)

			if (this.condense) timeline = timeline.condense()

			this.presentedEvents = timeline.present(timelineWidth)
		}
	},
	filters: {
		formatTiming(value, unit = 'ms', placeholder = '') {
			if (value === null || value === undefined) return placeholder

			return (value <= 0 || value > 1) ? `${Math.round(value)} ${unit}` : `<1 ${unit}`
		}
	},
	watch: {
		condense() {
			this.refreshEvents()

			this.$settings.global.timelineCondensed[this.name] = this.condense
			this.$settings.save()
		},

		hiddenTags() {
			this.refreshEvents()

			this.$settings.global.timelineHiddenTags[this.name] = this.hiddenTags
			this.$settings.save()
		},

		timeline() {
			this.refreshEvents()
		}
	},
	mounted() {
		this.condense = this.$settings.global.timelineCondensed[this.name] || false
		this.hiddenTags = this.$settings.global.timelineHiddenTags[this.name] || []

		this.refreshEvents()

		this.resizeObserver = new ResizeObserver(debounce(entries => this.refreshEvents(), 10))
		this.resizeObserver.observe(this.$refs.timelineChart)
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

$timeline-colors-light: (
	blue:   ( normal: rgb(66, 149, 197),  alternative: rgb(120, 177, 222) ),
	red:    ( normal: rgb(209, 107, 108), alternative: rgb(231, 150, 151) ),
	green:  ( normal: rgb(152, 186, 81),  alternative: rgb(177, 202, 109) ),
	purple: ( normal: rgb(151, 114, 181), alternative: rgb(186, 148, 230) ),
	grey:   ( normal: hsl(240, 5, 27),    alternative: hsl(240, 5, 62) )
);

$timeline-colors-dark: (
	blue:   ( normal: rgb(100, 157, 202), alternative: rgb(46, 129, 177) ),
	red:    ( normal: rgb(211, 130, 131), alternative: rgb(189, 87, 88) ),
	green:  ( normal: rgb(157, 182, 89),  alternative: rgb(132, 166, 61) ),
	purple: ( normal: rgb(166, 128, 210), alternative: rgb(131, 94, 161) ),
	grey:   ( normal: hsl(240, 5, 52),    alternative: hsl(240, 5, 37) )
);

.timeline {
	.timeline-timing, .timeline-description {
		display: none;
	}

	.timeline-description {
		.description-tags {
			font-size: 95%;
			opacity: 0.7;
		}
	}

	.timeline-timing {
		padding-right: 10px !important;
		text-align: right;
		width: 80px;

		&.timing-total {
			font-weight: 600;
		}
	}

	.timeline-size-monitor {
		td {
			padding-bottom: 0;
			padding-top: 0;
		}
	}

	.timeline-chart {
		padding: 8px !important;

		.chart-event-group {
			cursor: pointer;
			height: 18px;
			position: relative;

			.group-label {
				color: hsl(206, 30%, 30%);
				font-size: 12px;
				line-height: 18px;
				overflow: hidden;
				padding: 0 6px;
				position: absolute;
				text-overflow: ellipsis;
				white-space: nowrap;
				z-index: 100;

				.label-tags {
					font-size: 95%;
					opacity: 0.8;
				}

				&.inside {
					color: #fff !important;
					text-align: center;
					width: 100% !important;
				}

				&.before {
					right: 100%;
					text-align: right;
				}

				&.after {
					left: 100%;
				}

				@each $color, $values in $timeline-colors-light {
					&.#{$color} { color: map-get($values, 'normal'); }
				}

				@include dark {
					@each $color, $values in $timeline-colors-dark {
						&.#{$color} { color: map-get($values, 'normal'); }
					}
				}
			}
		}

		.group-event {
			height: 100%;
			position: absolute;

			.event-bar {
				background: rgb(66, 149, 197);
				border-radius: 3px;
				height: 100%;
				left: 0;
				overflow: hidden;
				position: absolute;
				top: 0;
				width: 100%;

				@include dark {
					background: rgb(100, 157, 202);
				}

				.bar-light {
					height: 100%;
					position: absolute;
				}
			}

			@each $color, $values in $timeline-colors-light {
				&.#{$color} {
					.event-bar { background: map-get($values, 'normal'); }
					.event-bar .bar-light { background: map-get($values, 'alternative'); }
				}
			}

			@include dark {
				@each $color, $values in $timeline-colors-dark {
					&.#{$color} {
						.event-bar { background: map-get($values, 'normal'); }
						.event-bar .bar-light { background: map-get($values, 'alternative'); }
					}
				}
			}
		}
	}

	.timeline-popover {
		.popover-content {
			padding-bottom: 0;
		}

		.popover-event {
			border-bottom: 1px solid rgba(#333, 0.1);
			margin-bottom: 5px;

			@include dark { border-color: rgba(#eee, 0.1); }

			&:last-child { border-bottom: 0; }

			.event-header {
				display: flex;
				padding: 12px 12px 14px;

				h1 {
					flex: 1;
					font-size: 110%;
					margin: 0;
					text-align: left;
				}

				.header-tags {
					color: #777;
				}
			}

			.event-description {
				background: rgba(#333, 0.03);
				border-top: 1px solid rgba(#333, 0.1);
				padding: 12px;
				text-align: left;

				@include dark {
					background: rgba(#ddd, 0.03);
					border-color: rgba(#eee, 0.1);
				}
			}

			.event-timings {
				border-top: 1px solid rgba(#333, 0.1);
				display: flex;

				@include dark { border-color: rgba(#eee, 0.1); }

				.timings-timing {
					border-right: 1px solid rgba(#333, 0.1);
					flex: 1;
					padding: 10px 0;

					@include dark { border-color: rgba(#eee, 0.1); }

					&:last-child { border-right: 0; }

					.timing-value {
						font-size: 110%;
					}

					.timing-label {
						color: #777;
						margin-top: 5px;
						font-size: 95%;

						&:before {
							content: '';
							display: inline-block;
							border-radius: 5px;
							background: rgb(66, 149, 197);
							width: 14px;
							height: 8px;
							vertical-align: 0px;

							@include dark { background: rgb(100, 157, 202); }
						}
					}

					&.timing-total {
						.timing-value {
							font-weight: 600;
						}

						.timing-label:before {
							background: linear-gradient(to right, rgb(66, 149, 197) 50%, rgb(120, 177, 222) 50%);

							@include dark { background: linear-gradient(to right, rgb(100, 157, 202) 50%, rgb(46, 129, 177) 50%); }
						}
					}

					&.timing-children {
						.timing-label:before {
							background: rgb(120, 177, 222);

							@include dark { background: rgb(46, 129, 177); }
						}
					}
				}
			}

			@each $color, $values in $timeline-colors-light {
				&.#{$color} {
					.timings-timing {
						.timing-label:before { background: map-get($values, 'normal'); }
						&.timing-total .timing-label:before { background: linear-gradient(to right, map-get($values, 'normal') 50%, map-get($values, 'alternative') 50%); }
						&.timing-children .timing-label:before { background: map-get($values, 'alternative'); }
					}
				}
			}

			@include dark {
				@each $color, $values in $timeline-colors-dark {
					&.#{$color} {
						.timings-timing {
							.timing-label:before { background: map-get($values, 'normal'); }
							&.timing-total .timing-label:before { background: linear-gradient(to right, map-get($values, 'normal') 50%, map-get($values, 'alternative') 50%); }
							&.timing-children .timing-label:before { background: map-get($values, 'alternative'); }
						}
					}
				}
			}
		}
	}

	&.show-details {
		.timeline-timing, .timeline-description {
			display: table-cell;
		}

		.timeline-chart {
			width: 20%;

			.chart-event-group {
				.group-label {
					display: none;
				}
			}
		}
	}
}
</style>
