import debounce from 'just-debounce-it'
import moment from 'moment'
import Vue from 'vue'

export default class RequestsSearch
{
	constructor(requests) {
		this.requests = requests

		this.tags = [
			{ tag: 'controller' },
			{ tag: 'method', validate: val => [ 'get', 'post', 'put', 'patch', 'delete', 'head' ].includes(val) },
			{ tag: 'status', validate: val => val >= 100 && val < 600 },
			{ tag: 'time' },
			{ tag: 'received', validate: val => moment(val).isValid() },
			{ tag: 'type', validate: val => [ 'command', 'queue-job', 'request' ].includes(val) }
		]

		this.shown = false
		this.input = ''

		this.searchDebounced = debounce(() => this.search(), 500)
	}

	toggle() {
		this.shown = ! this.shown

		if (this.shown) {
			Vue.nextTick(() => document.querySelector('.requests-search input').focus())
		} else {
			this.input = ''
			this.search()
		}
	}

	search() {
		let { terms, tags } = this.tokenize(this.input)

		tags = Object.entries(tags).filter(([ tag, values ]) => {
			tag = this.tags.find(current => current.tag == tag)
			return tag && (! tag.validate || values.every(val => tag.validate(val)))
		}).reduce((tags, [ tag, values ]) => {
			tags[`${tag}[]`] = values
			return tags
		}, {})

		this.requests.setQuery(
			terms.length || Object.keys(tags).length ? { 'uri[]': terms, 'name[]': terms, ...tags } : {}
		)

		this.requests.returnLatest().then(latest => {
			this.requests.returnPrevious(9, latest.id).then(previous => {
				this.requests.setItems(previous ? [ ...previous, latest ] : [ latest ])
			})
		}).catch(() => {
			this.requests.clear()
		})
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
