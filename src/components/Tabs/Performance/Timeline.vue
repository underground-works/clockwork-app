<template>
	<div class="timeline" :class="{ 'table-view': showDetails }">
		<div class="timeline-controls">
			<span class="timeline-control-group">
				<a v-for="tag in availableTags" href="#" :class="{ 'active': ! hiddenTags.includes(tag.tag) }" :title="tag.title" @click="toggleTag(tag.tag)">
					<font-awesome-icon :icon="tag.icon"></font-awesome-icon>
				</a>
			</span>
			<span class="timeline-control-group">
				<a href="#" class="toggle-filter" @click="filter.toggle()">
					<font-awesome-icon icon="search"></font-awesome-icon>
				</a>
				<a href="#" title="Toggle details" @click.prevent="toggleDetails">
					<font-awesome-icon :icon="showDetails ? 'indent' : 'outdent'"></font-awesome-icon>
				</a>
			</span>
		</div>

		<details-table :columns="columns" :items="filteredEvents" :filter="filter" :no-header="true" filter-example="database query duration:>50" :per-page="100">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="item, index in items">
					<td class="timeline-graph">
						<div class="timeline-event popover-container" :class="item.eventClass" :style="item.eventStyle" @click="showPopover(index)">
							<div class="event-label" :class="item.labelClass" :style="item.labelStyle" :title="`${item.description} (${item.duration} ms)`">
								<span class="label-tags">
									<span v-for="tag in resolveTags(item.tags)">
										<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
									</span>
								</span>
								{{item.name}} {{item.duration}} ms
							</div>

							<div class="event-bar">
								<div class="bar-light" :style="childBar.style" v-for="childBar in item.childrenBars"></div>
							</div>

							<popover class="timeline-popover" ref="popovers">
								<div class="popover-header">
									<h1>{{item.name}}</h1>

									<div class="header-tags">
										<span v-for="tag in resolveTags(item.tags)">
											<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
										</span>
									</div>
								</div>

								<div class="popover-description" v-if="item.description != item.name">
									{{item.description}}
								</div>

								<div class="popover-timings">
									<div class="timings-timing timing-total">
										<div class="timing-value">
											{{item.duration}} ms
										</div>
										<div class="timing-label">
											Total
										</div>
									</div>

									<div class="timings-timing timing-self">
										<div class="timing-value">
											{{ item.durationSelf ? `${item.durationSelf} ms` : '–' }}
										</div>
										<div class="timing-label">
											Self
										</div>
									</div>

									<div class="timings-timing timing-children">
										<div class="timing-value">
											{{ item.durationChildren ? `${item.durationChildren} ms` : '–' }}
										</div>
										<div class="timing-label">
											Children
										</div>
									</div>
								</div>
							</popover>
						</div>
					</td>
					<td class="timeline-description">
						<span class="description-tags">
							<span v-for="tag in resolveTags(item.tags)">
								<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
							</span>
						</span>
						{{item.description}}
					</td>
					<td class="timeline-duration">{{item.duration}} ms</td>
				</tr>

				<tr class="timeline-size-monitor">
					<td class="timeline-graph" ref="timelineChart"></td>
					<td class="timeline-duration"></td>
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

import clone from 'just-clone'
import debounce from 'just-debounce-it'
import intersect from 'just-intersect'

export default {
	name: 'Timeline',
	components: { DetailsTable, Popover },
	props: { name: {}, events: {}, startTime: {}, endTime: {}, tags: { default: () => [] } },
	data: () => ({
		showDetails: false,
		hiddenTags: [],

		presentedEvents: [],

		filter: new Filter([
			{ tag: 'duration', type: 'number' }
		], item => item.description)
	}),
	computed: {
		availableTags() {
			return this.tags.filter(tag => this.presentedEvents.find(item => item.tags.includes(tag.tag)))
		},

		columns() {
			return this.showDetails ? [ 'Timeline', 'Duration', 'Description' ] : [ 'Timeline' ]
		},

		filteredEvents() {
			return this.presentedEvents.filter(item => ! intersect(item.tags, this.hiddenTags).length)
		}
	},
	methods: {
		toggleTag(tag) {
			if (this.hiddenTags.includes(tag)) {
				this.hiddenTags = this.hiddenTags.filter(t => t != tag)
			} else {
				this.hiddenTags.push(tag)
			}

			this.$settings.global.timelineHiddenTags[this.name] = this.hiddenTags
			this.$settings.save()
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
			if (! this.events || ! this.$refs.timelineChart) return this.presentedEvents = []

			let events = clone(Object.values(this.events))

			events = this.structureEvents(events)
			events = this.presentEvents(events)
			events = this.flattenEvents(events)

			this.presentedEvents = events
		},

		structureEvents(events) {
			events = [ ...events ].reverse()

			events = events.reduce((events, event) => {
				let parent = events.find(item => item != event && item.start <= event.start && event.end <= item.end)

				if (! parent) return events

				parent.children = [ ...(parent.children || []), event ]
				event.parent = parent

				return events.filter(e => e !== event)
			}, events)

			return events.reverse()
		},

		presentEvents(events) {
			let timelineWidth = this.$refs.timelineChart.offsetWidth - 16

			return events.map((event, i) => {
				let name = event.name || event.description
				let description = event.description

				let start = event.start || this.startTime
				let startRelative = (event.start - this.startTime) * 1000 / (this.endTime - this.startTime)

				let duration = event.duration || 0
				let durationRelative = duration / (this.endTime - this.startTime)
				let durationRaw = duration

				let end = event.end || start + duration / 1000

				duration = duration > 1 ? Math.round(duration) : '<1'

				let offset = startRelative * timelineWidth
				let width = durationRelative * timelineWidth

				if (width < 3) width = 3
				if (width > timelineWidth) width = timelineWidth
				if (offset + width > timelineWidth) offset = timelineWidth - width

				let eventClass = event.color || 'blue'
				let eventStyle = { 'margin-left': `${offset}px`, width: `${width}px` }

				let labelWidth = startRelative > 0.5 ? offset : timelineWidth - width - offset

				let labelClass = startRelative > 0.5 ? 'before' : 'after'
				let labelStyle = { width: `${labelWidth}px` }

				if (width > 200) labelClass = 'inside'

				let tags = event.tags || []

				let children = this.presentEvents(event.children || [])

				let childrenBars = children.map(item => ({
					style: { 'left': `${item.offset - offset}px`, width: `${item.width}px` }
				}))

				let durationChildren = children.reduce((total, event) => total + event.durationRaw, 0)
				let durationSelf = event.duration - durationChildren

				durationChildren = (durationChildren <= 0 || durationChildren > 1) ? Math.round(durationChildren) : '<1'
				durationSelf = durationSelf > 1 ? Math.round(durationSelf) : '<1'

				return {
					name, description, duration, eventClass, eventStyle, labelClass, labelStyle, tags, children,
					start, duration, durationSelf, durationChildren, durationRaw, end, offset, width, childrenBars
				}
			})
		},

		flattenEvents(events) {
			return events
				.reduce((events, event) => [ ...events, event, ...this.flattenEvents(event.children || []) ], [])
				.sort((a, b) => a.start - b.start)
		}
	},
	watch: {
		events() { this.refreshEvents() }
	},
	mounted() {
		this.hiddenTags = this.$settings.global.timelineHiddenTags[this.name] || []

		this.refreshEvents()

		this.resizeObserver = new ResizeObserver(debounce(entries => this.refreshEvents(), 10))
		this.resizeObserver.observe(this.$refs.timelineChart)
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

.timeline {
	position: relative;

	table {
		table-layout: fixed;

		tbody {
			tr:nth-child(even) {
				background: hsl(240, 20, 97) !important;

				@include dark { background: hsl(240, 2, 15) !important; }
			}

			tr:first-child td {
				border-top: 0 !important;
			}
		}
	}

	.timeline-duration, .timeline-description {
		display: none;
	}

	.timeline-description {
		.description-tags {
			font-size: 95%;
			opacity: 0.7;
		}
	}

	&.table-view {
		.timeline-duration, .timeline-description {
			display: table-cell;
		}

		.timeline-graph {
			width: 20%;
		}

		.timeline-event {
			.event-label {
				display: none;
			}
		}
	}

	.timeline-controls {
		display: flex;
		font-size: 14px;
		justify-content: space-between;
		margin-bottom: 5px;

		.timeline-control-group {
			margin: 0 4px;
		}

		.toggle-filter {
			position: static;
			visibility: visible;
		}

		a {
			margin: 0 5px;
			text-decoration: none;

			&.active {
				color: rgb(37, 140, 219);

				@include dark {
					color: hsl(31, 98%, 48%);
				}
			}

			@include dark {
				color: rgb(158, 158, 158);
			}
		}
	}

	.timeline-graph {
		padding: 8px;
	}

	.timeline-event {
		cursor: pointer;
		height: 18px;
		position: relative;

		.event-label {
			font-size: 12px;
			line-height: 18px;
			margin: 0 6px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			z-index: 100;

			.label-tags {
				font-size: 95%;
				opacity: 0.8;
			}

			&.inside {
				color: #fff !important;
				position: relative;
				width: 100% !important;
			}

			&.before, &.after {
				color: hsl(206, 30%, 30%);
				position: absolute;
			}

			&.before {
				right: 100%;
				text-align: right;
			}

			&.after {
				left: 100%;
			}
		}

		.event-bar {
			background: rgb(66, 149, 197);
			border-radius: 2px;
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

		&.blue {
			.event-bar {
				background: rgb(66, 149, 197);
				@include dark { background: rgb(100, 157, 202); }

				.bar-light {
					background: rgb(120, 177, 222);
					@include dark { background: rgb(46, 129, 177); }
				}
			}

			.event-label {
				color: rgb(66, 149, 197);
				@include dark { color: rgb(120, 177, 222); }
			}

			.timeline-popover {
				.timings-timing {
					.timing-label:before {
						background: rgb(66, 149, 197);
						@include dark { background: rgb(100, 157, 202); }
					}

					&.timing-total {
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
		}

		&.red {
			.event-bar {
				background: rgb(209, 107, 108);
				@include dark { background: rgb(211, 130, 131); }

				.bar-light {
					background: rgb(231, 150, 151);
					@include dark { background: rgb(189, 87, 88); }
				}
			}

			.event-label {
				color: rgb(209, 107, 108);
				@include dark { color: rgb(211, 130, 131); }
			}

			.timeline-popover {
				.timings-timing {
					.timing-label:before {
						background: rgb(209, 107, 108);
						@include dark { background: rgb(211, 130, 131); }
					}

					&.timing-total {
						.timing-label:before {
							background: linear-gradient(to right, rgb(209, 107, 108) 50%, rgb(231, 150, 151) 50%);
							@include dark { background: linear-gradient(to right, rgb(211, 130, 131) 50%, rgb(189, 87, 88) 50%); }
						}
					}

					&.timing-children {
						.timing-label:before {
							background: rgb(231, 150, 151);
							@include dark { background: rgb(189, 87, 88); }
						}
					}
				}
			}
		}

		&.green {
			.event-bar {
				background: rgb(152, 186, 81);
				@include dark { background: rgb(157, 182, 89); }

				.bar-light {
					background: rgb(177, 202, 109);
					@include dark { background: rgb(132, 166, 61); }
				}
			}

			.event-label {
				color: rgb(152, 186, 81);
				@include dark { color: rgb(157, 182, 89); }
			}

			.timeline-popover {
				.timings-timing {
					.timing-label:before {
						background: rgb(152, 186, 81);
						@include dark { background: rgb(157, 182, 89); }
					}

					&.timing-total {
						.timing-label:before {
							background: linear-gradient(to right, rgb(152, 186, 81) 50%, rgb(177, 202, 109) 50%);
							@include dark { background: linear-gradient(to right, rgb(157, 182, 89) 50%, rgb(132, 166, 61) 50%); }
						}
					}

					&.timing-children {
						.timing-label:before {
							background: rgb(177, 202, 109);
							@include dark { background: rgb(132, 166, 61); }
						}
					}
				}
			}
		}

		&.purple {
			.event-bar {
				background: rgb(151, 114, 181);
				@include dark { background: rgb(166, 128, 210); }

				.bar-light {
					background: rgb(186, 148, 230);
					@include dark { background: rgb(131, 94, 161); }
				}
			}

			.event-label {
				color: rgb(151, 114, 181);
				@include dark { color: rgb(166, 128, 210); }
			}

			.timeline-popover {
				.timings-timing {
					.timing-label:before {
						background: rgb(151, 114, 181);
						@include dark { background: rgb(166, 128, 210); }
					}

					&.timing-total {
						.timing-label:before {
							background: linear-gradient(to right, rgb(151, 114, 181) 50%, rgb(186, 148, 230) 50%);
							@include dark { background: linear-gradient(to right, rgb(166, 128, 210) 50%, rgb(131, 94, 161) 50%); }
						}
					}

					&.timing-children {
						.timing-label:before {
							background: rgb(186, 148, 230);
							@include dark { background: rgb(131, 94, 161); }
						}
					}
				}
			}
		}

		&.grey {
			.event-bar {
				background: hsl(240, 5, 27);
				@include dark { background: hsl(240, 5, 52); }

				.bar-light {
					background: hsl(240, 5, 62);
					@include dark { background: hsl(240, 5, 37); }
				}
			}

			.event-label {
				color: hsl(240, 5, 27);
				@include dark { color: hsl(240, 5, 52); }
			}

			.timeline-popover {
				.timings-timing {
					.timing-label:before {
						background: hsl(240, 5, 27);
						@include dark { background: hsl(240, 5, 52); }
					}

					&.timing-total {
						.timing-label:before {
							background: linear-gradient(to right, hsl(240, 5, 27) 50%, hsl(240, 5, 62) 50%);
							@include dark { background: linear-gradient(to right, hsl(240, 5, 52) 50%, hsl(240, 5, 37) 50%); }
						}
					}

					&.timing-children {
						.timing-label:before {
							background: hsl(240, 5, 62);
							@include dark { background: hsl(240, 5, 37); }
						}
					}
				}
			}
		}
	}

	.timeline-duration {
		text-align: right;
		width: 100px;
	}

	.timeline-size-monitor {
		visibility: hidden;
	}

	.timeline-popover {
		.popover-content {
			padding-bottom: 0;
		}

		.popover-header {
			display: flex;
			padding: 12px;

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

		.popover-description {
			background: rgba(#333, 0.03);
			border-top: 1px solid rgba(#333, 0.1);
			padding: 12px;
			text-align: left;

			@include dark {
				background: rgba(#ddd, 0.03);
				border-color: rgba(#eee, 0.1);
			}
		}

		.popover-timings {
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
	}
}
</style>
