import { format as formatDate, isBefore, isAfter, isEqual, parseISO, setMilliseconds } from 'date-fns'
import { nextTick, shallowReactive } from 'vue'

export class Filter
{
	constructor(tags, map) {
		this.tags = tags
		this.map = map

		this.shown = false
		this.sortedBy = undefined
		this.sortedDesc = false
		this.input = ''
	}

	toggle($event) {
		this.shown = ! this.shown

		if (this.shown) {
			nextTick(() => {
				let table = $event.target
				while (table = table.parentNode) {
					if (table.tagName == 'TABLE') break
				}

				table.querySelector('.filter input').focus()
			})
		}
	}

	sortBy(column) {
		if (this.sortedBy == column) {
			this.sortedDesc = ! this.sortedDesc
		} else {
			this.sortedBy = column
			this.sortedDesc = true
		}
	}

	filter(items) {
		let { terms, tags } = this.tokenize(this.input)

		items = items.filter(item => {
			let searchable = this.map ? this.map(item) : item

			return this.matchesTerms(searchable, terms) && this.matchesTags(item, tags)
		})

		if (this.sortedBy) {
			let sortedByTag = this.tags.find(current => current.tag == this.sortedBy)

			items.sort((a, b) => {
				return sortedByTag && sortedByTag.type == 'number'
					? a[this.sortedBy] - b[this.sortedBy]
					: a[this.sortedBy]?.toString().localeCompare(b[this.sortedBy]?.toString())
			})
		}

		if (this.sortedDesc) items = items.reverse()

		return items
	}

	matchesTerms(item, terms) {
		if (! terms.length) return true

		if (typeof item == 'object' && item !== null) {
			return Object.values(item).find(item => this.matchesTerms(item, terms))
		}

		if (typeof item != 'string') return false

		return terms.find(term => item.toLowerCase().includes(term.toLowerCase()))
	}

	matchesTags(item, tags) {
		if (! Object.keys(tags).length) return true

		return Object.keys(tags).every(tag => {
			tag = this.tags.find(current => current.tag == tag)

			if (! tag) return false

			if (tag.type == 'number' || tag.type == 'date') {
				return tags[tag.tag].every(tagValue => this.isTagApplicable(tag, item, tagValue))
			} else {
				return tags[tag.tag].find(tagValue => this.isTagApplicable(tag, item, tagValue))
			}
		})
	}

	isTagApplicable(tag, item, tagValue) {
		if (tag.apply) {
			return tag.apply(item, tagValue)
		}

		item = tag.map ? tag.map(item) : item[tag.tag]

		if (tag.type == 'number') {
			let match

			if (match = tagValue.match(/^<(\d+(?:\.\d+)?)$/)) {
				return item < parseFloat(match[1])
			} else if (match = tagValue.match(/^>(\d+(?:\.\d+)?)$/)) {
				return parseFloat(match[1]) < item
			} else if (match = tagValue.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)) {
				return parseFloat(match[1]) < item && item < parseFloat(match[2])
			}

			return item == tagValue
		} else if (tag.type == 'date') {
			let match

			if (match = tagValue.match(/^<(.+)$/)) {
				return isBefore(
					setMilliseconds(item, 0),
					parseISO(match[1].match(/^\d+:\d+(:\d+)?$/) ? formatDate(new Date(), 'yyyy-MM-dd ') + match[1] : match[1])
				)
			} else if (match = tagValue.match(/^>(.+)$/)) {
				return isAfter(
					setMilliseconds(item, 0),
					parseISO(match[1].match(/^\d+:\d+(:\d+)?$/) ? formatDate(new Date(), 'yyyy-MM-dd ') + match[1] : match[1])
				)
			}

			return isEqual(
				setMilliseconds(item, 0),
				parseISO(tagValue.match(/^\d+:\d+(:\d+)?$/) ? formatDate(new Date(), 'yyyy-MM-dd ') + tagValue : tagValue)
			)
		} else {
			return typeof item == 'string' && item.toLowerCase().includes(tagValue.toLowerCase())
		}
	}

	tokenize(input) {
		let terms = []
		let tags = {}

		let pattern = /(\w+:)?("[^"]*"|[^\s]+)/g
		let match

		while (match = pattern.exec(input)) {
			let tag = match[1] ? match[1].substr(0, match[1].length - 1) : undefined
			let value = match[2]

			if (match = value.match(/^"(.+?)"$/)) {
				value = match[1]
			}

			if (tag) {
				if (! tags[tag]) tags[tag] = []
				tags[tag].push(value)
			} else {
				terms.push(value)
			}
		}

		return { terms, tags }
	}
}

export default (...args) => shallowReactive(new Filter(...args))
