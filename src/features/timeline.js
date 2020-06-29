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

	present(width, condense = false)
	{
		let timeline = this.copy()

		timeline.width = width

		timeline.events = timeline.events.map(event => new TimelineEventGroup(event.present(timeline)))

		if (condense) timeline.condense()

		return timeline.events
	}

	condense()
	{
		let condenseBelow = (this.endTime - this.startTime) / 20

		this.events = this.events.reduce((events, group) => {
			if (group.duration >= condenseBelow) return [ ...events, group ]

			let lastGroup = events[events.length - 1]

			if (lastGroup && lastGroup.duration < condenseBelow && lastGroup.end < group.end) {
				lastGroup.merge(group)
				return events
			}

			return [ ...events, group ]
		}, [])

		return this
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

	present(timeline)
	{
		if (this.presented) return this

		this.name = this.name || this.description

		this.startRelative = (this.start - timeline.startTime) * 1000 / (timeline.endTime - timeline.startTime)
		this.durationRelative = this.duration / (timeline.endTime - timeline.startTime)

		this.offset = this.startRelative * timeline.width
		this.width = this.durationRelative * timeline.width

		if (this.width < 3) this.width = 3
		if (this.width > timeline.width) this.width = timeline.width
		if (this.width + this.offset > timeline.width) this.offset = timeline.width - this.width

		this.eventClass = this.color
		this.eventStyle = { 'left': `0px`, width: `${this.width}px` }

		this.labelWidth = this.startRelative > 0.5 ? this.offset : timeline.width - this.width - this.offset

		this.labelClass = this.startRelative > 0.5 ? [ 'before', this.color ] : [ 'after', this.color ]
		this.labelStyle = { width: `${this.labelWidth}px` }

		if (this.width > 200) this.labelClass = [ 'inside', this.color ]

		let children = this.findChildren(timeline).map(event => event.present(timeline))

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

	findChildren(timeline)
	{
		return timeline.events.reduce((children, event) => {
			if (event !== this && this.contains(event) && children.every(child => ! child.contains(event))) {
				children.push(event)
			}

			return children
		}, [])
	}
}

export class TimelineEventGroup {
	constructor(events)
	{
		this.events = events instanceof Array ? events : [ events ]

		this.groupStyle = { 'margin-left': `${this.events[0].offset}px`, width: `${this.events[0].width}px` }
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

	merge(group)
	{
		this.events = this.events.concat(group.events)

		this.events.forEach(event => event.eventStyle.left = `${event.offset - this.events[0].offset}px`)
	}
}
