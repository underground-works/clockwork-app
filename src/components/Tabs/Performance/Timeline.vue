<template>
	<div class="timeline" :class="{ 'table-view': showDetails }">
		<div class="timeline-header">
			<div class="header-title">
				Timeline
			</div>

			<div class="header-group">
				<a v-for="tag in availableTags" href="#" :class="{ 'active': ! hiddenTags.includes(tag.tag) }" :title="tag.title" @click="toggleTag(tag.tag)">
					<font-awesome-icon :icon="tag.icon"></font-awesome-icon>
				</a>
			</div>

			<div class="header-group">
				<label class="timeline-condense">
					<input type="checkbox" v-model="condense">
					Condense
				</label>
			</div>

			<div class="header-group">
				<div class="timeline-search">
					<input type="search" v-model="filter.input" placeholder="Search...">
					<font-awesome-icon icon="search"></font-awesome-icon>
				</div>
			</div>

			<div class="header-group">
				<a href="#" title="Toggle details" @click.prevent="toggleDetails">
					<font-awesome-icon :icon="showDetails ? 'indent' : 'outdent'"></font-awesome-icon>
				</a>
			</div>
		</div>

		<details-table :columns="columns" :items="presentedEvents" :filter="filter" :no-header="! showDetails" filter-example="database query duration:>50" :per-page="100">
			<template slot="body" slot-scope="{ items }">
				<tr v-for="group, index in items">
					<td class="timeline-graph">
						<div class="timeline-event-group popover-container" :style="group.groupStyle" @click="showPopover(index)">
							<div class="event-label" :class="group.labelClass" :style="group.labelStyle">
								<span class="label-tags" v-if="group.tags">
									<span v-for="tag in resolveTags(group.tags)">
										<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
									</span>
								</span>
								{{group.label}}
								<span v-if="! group.condensed">{{group.duration|formatTiming}}</span>
							</div>

							<div class="timeline-event" :class="event.eventClass" :style="event.eventStyle" v-for='event, index in group.events'>
								<div class="event-bar">
									<div class="bar-light" :style="section.style" v-for="section in event.childrenSections"></div>
								</div>
							</div>

							<popover class="timeline-popover" ref="popovers">
								<div class="popover-event" :class="event.eventClass" v-for="event in group.events">
									<div class="popover-header">
										<h1>{{event.name}}</h1>

										<div class="header-tags">
											<span v-for="tag in resolveTags(event.tags)">
												<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
											</span>
										</div>
									</div>

									<div class="popover-description" v-if="event.description != event.name">
										{{event.description}}
									</div>

									<div class="popover-timings">
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
						<span class="description-tags" v-if="group.tags">
							<span v-for="tag in resolveTags(group.tags)">
								<font-awesome-icon :icon="tag.icon" :title="tag.title"></font-awesome-icon>
							</span>
						</span>
						{{group.description}}
					</td>
					<td class="timeline-timing timing-total">{{group.duration|formatTiming}}</td>
					<td class="timeline-timing">{{group.durationSelf}}</td>
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

import clone from 'just-clone'
import debounce from 'just-debounce-it'
import intersect from 'just-intersect'
import unique from 'just-unique'

export default {
	name: 'Timeline',
	components: { DetailsTable, Popover },
	props: { name: {}, timeline: {}, startTime: {}, endTime: {}, tags: { default: () => [] } },
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
				{ name: ' ', sortBy: 'start', class: 'timeline-graph' },
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
			if (! this.timeline) return []

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
		condense() { this.refreshEvents() },
		timeline() { this.refreshEvents() },
		hiddenTags() { this.refreshEvents() }
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

		.toggle-filter {
			display: none !important;
		}

		th {
			font-size: 95% !important;
		}

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

	.timeline-timing, .timeline-description {
		display: none;
	}

	.timeline-description {
		.description-tags {
			font-size: 95%;
			opacity: 0.7;
		}
	}

	&.table-view {
		.timeline-timing, .timeline-description {
			display: table-cell;
		}

		.timeline-graph {
			width: 20%;
		}

		.timeline-event-group {
			.event-label {
				display: none;
			}
		}
	}

	.timeline-header {
		align-items: center;
		display: flex;
		font-size: 14px;
		height: 24px;
		justify-content: space-between;
		margin-bottom: 10px;

		.header-title {
			flex: 1;
			font-size: 105%;
			font-weight: 600;
			margin: 0 10px;
		}

		.header-group {
			align-items: center;
			display: flex;
			height: 100%;
			margin: 0 4px;
		}

		.timeline-condense {
			align-items: center;
			background: hsl(30, 1, 16);
			border-radius: 4px;
			display: flex;
			font-size: 95%;
			height: 100%;
			padding: 0 8px;

			input {
				margin: 0 5px 0 0;
			}
		}

		.timeline-search {
			margin: 0 4px;
			position: relative;

			input {
				background: #eee;
				border: 0;
				border-radius: 4px;
				font-size: 13px;
				height: 24px;
				padding-left: 30px;
				width: 180px;

				@include dark {
					background: rgb(93, 92, 91);
					color: rgb(233, 233, 233);

					&::placeholder {
						color: rgb(167, 166, 165);
						opacity: 1;
					}
				}
			}

			.fa-search {
				left: 7px;
				position: absolute;
				top: 5px;
			}
		}

		a {
			align-items: center;
			border-radius: 4px;
			display: flex;
			height: 100%;
			justify-content: center;
			margin: 0 2px;
			text-decoration: none;
			width: 24px;

			&.active, &:hover {
				background: rgb(37, 140, 219);
				color: #f5f5f5;

				@include dark {
					background: hsl(31, 98%, 44%);
					color: #fff;
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

	.timeline-event-group {
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
				position: absolute;
				text-align: center;
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

			&.blue {
				color: rgb(66, 149, 197);
				@include dark { color: rgb(120, 177, 222); }
			}

			&.red {
				color: rgb(209, 107, 108);
				@include dark { color: rgb(211, 130, 131); }
			}

			&.green {
				color: rgb(152, 186, 81);
				@include dark { color: rgb(157, 182, 89); }
			}

			&.purple {
				color: rgb(151, 114, 181);
				@include dark { color: rgb(166, 128, 210); }
			}

			&.grey {
				color: hsl(240, 5, 27);
				@include dark { color: hsl(240, 5, 52); }
			}
		}
	}

	.timeline-event {
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

		&.blue {
			.event-bar {
				background: rgb(66, 149, 197);
				@include dark { background: rgb(100, 157, 202); }

				.bar-light {
					background: rgb(120, 177, 222);
					@include dark { background: rgb(46, 129, 177); }
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
		visibility: hidden;
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

			&.blue {
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

			&.red {
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

			&.green {
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

			&.purple {
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

			&.grey {
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

		.popover-header {
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
