import clone from 'just-clone'
import intersect from 'just-intersect'

export class Timeline {
	constructor(events, startTime, endTime) {
		this.startTime = startTime
		this.endTime = endTime
		this.events = []

		events.map(data => this.append(data))
	}

	append(data) {
		data.start = data.start || this.startTime

		if (data.start < this.startTime) data.start = this.startTime
		if (data.end > this.endTime) data.end = this.endTime

		this.events.push(new TimelineEvent(data))
		this.sort()
	}

	appendTotalEvent() {
		this.append({
			description: 'Total time',
			start: this.startTime,
			duration: this.endTime - this.startTime,
			color: 'grey'
		})
	}

	merge(timeline) {
		this.events = this.events.concat(timeline.events)
		this.sort()
	}

	copy() {
		return new Timeline(clone(this.events), this.startTime, this.endTime)
	}

	sort() {
		this.events = this.events.sort((a, b) => a.start - b.start)

		return this
	}

	filter(filter, hiddenTags) {
		let timeline = this.copy()

		timeline.events = filter.filter(timeline.events)
		timeline.events = timeline.events.filter(item => ! intersect(item.tags, hiddenTags).length)

		return timeline
	}

	condense() {
		let timeline = this.copy()

		let condenseBelow = (timeline.endTime - timeline.startTime) / 64

		timeline.events = timeline.events.reduce((events, event) => {
			if (event.duration >= condenseBelow) return [ ...events, event ]

			let lastEvent = events[events.length - 1]

			if (lastEvent instanceof TimelineEventGroup && lastEvent.end <= event.start) {
				lastEvent.push(event)
				return events
			}

			return [ ...events, new TimelineEventGroup(event)]
		}, [])

		return timeline
	}

	present(width) {
		return this.events.map(group => {
			if (! (group instanceof TimelineEventGroup)) group = new TimelineEventGroup(group)

			return group.present(this, width)
		})
	}

	findChildren(event) {
		return this.events.flatMap(event => event instanceof TimelineEventGroup ? event.events : event)
			.reduce((children, item) => {
				if (item !== event && event.contains(item) && children.every(child => ! child.contains(item))) {
					children.push(item)
				}

				return children
			}, [])
	}
}

export class TimelineEvent {
	constructor(data) {
		this.name = data.name || data.description
		this.description = data.description || ''
		this.start = data.start instanceof Date ? data.start.getTime() / 1000 : data.start
		this.duration = data.duration || 0
		this.color = data.color || 'blue'
		this.end = this.start + this.duration / 1000
		this.tags = data.tags || []
		this.data = data.data
	}

	present(timeline, timelineWidth) {
		if (this.presented) return this

		this.startRelative = (this.start - timeline.startTime) * 1000 / (timeline.endTime - timeline.startTime)
		this.durationRelative = this.duration / (timeline.endTime - timeline.startTime)

		this.offset = this.startRelative * timelineWidth
		this.width = this.durationRelative * timelineWidth

		if (this.width < 3) this.width = 3
		if (this.width > timelineWidth) this.width = timelineWidth
		if (this.width + this.offset > timelineWidth) this.offset = timelineWidth - this.width

		this.eventClass = this.color
		this.eventStyle = { 'left': `0px`, width: `${this.width}px` }

		this.labelWidth = this.startRelative > 0.5 ? this.offset : timelineWidth - this.width - this.offset

		this.labelClass = this.startRelative > 0.5 ? [ 'before', this.color ] : [ 'after', this.color ]
		this.labelStyle = { width: `${this.labelWidth}px` }

		if (this.width > 200) this.labelClass = [ 'inside', this.color ]

		let children = timeline.findChildren(this).map(event => event.present(timeline, timelineWidth))

		this.childrenSections = children.map(event => ({
			style: { 'left': `${event.offset - this.offset}px`, width: `${event.width}px` }
		}))

		this.durationChildren = children.length ? children.reduce((total, event) => total + event.duration, 0) : null
		this.durationSelf = this.duration - this.durationChildren

		this.presented = true

		return this
	}

	contains(event) {
		return this.start < event.start && event.end < this.end
	}
}

export class TimelineEventGroup {
	constructor(events) {
		this.events = events instanceof Array ? events : [ events ]

		this.name = this.firstEvent.name
		this.description = this.firstEvent.description
		this.start = this.firstEvent.start
		this.duration = this.lastEvent.end - this.firstEvent.start
		this.color = this.firstEvent.color
		this.end = this.lastEvent.end
	}

	get condensed() { return this.events.length > 1 }

	get firstEvent() { return this.events[0] }
	get lastEvent() { return this.events[this.events.length - 1] }

	push(event) {
		this.events.push(event)

		this.name = this.description = `${this.events.length} events`
		this.duration = this.lastEvent.end - this.firstEvent.start
		this.end = this.lastEvent.end
	}

	present(timeline, timelineWidth) {
		this.events.forEach(event => {
			event.present(timeline, timelineWidth)

			event.eventStyle.left = `${event.offset - this.events[0].offset}px`
		})

		this.duration = this.condensed ? null : this.firstEvent.duration
		this.durationSelf = this.condensed ? null : this.firstEvent.durationSelf
		this.durationChildren = this.condensed ? null : this.firstEvent.durationChildren

		this.offset = this.firstEvent.offset
		this.width = this.lastEvent.width + this.lastEvent.offset - this.firstEvent.offset

		this.color = this.offset > timelineWidth / 2 ? this.firstEvent.color : this.lastEvent.color

		this.labelWidth = this.offset > timelineWidth / 2 ? this.offset : timelineWidth - this.width - this.offset

		this.labelClass = this.offset > timelineWidth / 2 ? [ 'before', this.color ] : [ 'after', this.color ]
		this.labelStyle = { width: `${this.labelWidth}px` }

		if (this.width > 200 && ! this.condensed) this.labelClass = [ 'inside', this.color ]

		this.groupStyle = { 'margin-left': `${this.offset}px`, width: `${this.width}px` }

		this.tags = this.condensed ? [] : this.firstEvent.tags
		this.data = this.condensed ? undefined : this.firstEvent.data

		return this
	}
}
