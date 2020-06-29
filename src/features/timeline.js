import clone from 'just-clone'
import intersect from 'just-intersect'

export class Timeline {
	constructor(events, startTime, endTime)
	{
		this.startTime = startTime
		this.endTime = endTime

		this.events = events.map(data => new TimelineEvent(data))
	}

	append(data)
	{
		data.start = data.start || this.startTime

		this.events.push(new TimelineEvent(data))
		this.sort()
	}

	appendTotalEvent()
	{
		this.append({
			description: 'Total time',
			start: this.startTime,
			duration: this.endTime - this.startTime,
			color: 'grey'
		})
	}

	copy()
	{
		return new Timeline(clone(this.events), this.startTime, this.endTime)
	}

	sort()
	{
		this.events = this.events.sort((a, b) => a.start - b.start)

		return this
	}

	filter(filter, hiddenTags)
	{
		let timeline = this.copy()

		timeline.events = filter.filter(timeline.events)
		timeline.events = timeline.events.filter(item => ! intersect(item.tags, hiddenTags).length)

		return timeline
	}

	condense()
	{
		let timeline = this.copy()

		let condenseBelow = (timeline.endTime - timeline.startTime) / 20

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

	present(width)
	{
		return this.events.map(group => {
			if (! (group instanceof TimelineEventGroup)) group = new TimelineEventGroup(group)

			return group.present(this, width)
		})
	}

	findChildren(event)
	{
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
	constructor(data)
	{
		this.name = data.name
		this.description = data.description || ''
		this.start = data.start instanceof Date ? data.start.getTime() / 1000 : data.start
		this.duration = data.duration || 0
		this.color = data.color || 'blue'
		this.end = this.start + this.duration / 1000
		this.tags = data.tags || []
	}

	present(timeline, timelineWidth)
	{
		if (this.presented) return this

		this.name = this.name || this.description

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

	contains(event)
	{
		return this.start <= event.start && event.end <= this.end
	}
}

export class TimelineEventGroup {
	constructor(events)
	{
		this.events = events instanceof Array ? events : [ events ]
	}

	get condensed() { return this.events.length > 1 }

	get duration() { return this.condensed ? null : this.events[0].duration }
	get durationSelf() { return this.condensed ? null : this.events[0].duration }
	get durationChildren() { return this.condensed ? null : this.events[0].duration }
	get end() { return this.events[this.events.length - 1].end }

	get label() { return this.condensed ? `${this.events.length} events` : this.events[0].name }
	get labelStyle() { return this.events[0].labelStyle }
	get labelClass() { return this.events[0].labelClass }

	get description() { return this.condensed ? this.label : this.events[0].description }
	get tags() { return this.condensed ? [] : this.events[0].tags }

	get groupStyle() { return { 'margin-left': `${this.events[0].offset}px`, width: `${this.events[0].width}px` } }

	push(event)
	{
		this.events.push(event)
	}

	present(timeline, timelineWidth)
	{
		this.events.forEach(event => {
			event.present(timeline, timelineWidth)

			event.eventStyle.left = `${event.offset - this.events[0].offset}px`
		})

		return this
	}
}
