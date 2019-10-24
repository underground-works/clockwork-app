import Request from './request'
import URI from 'urijs'

export default class Requests
{
	constructor(store) {
		this.store = store
		this.items = []

		this.tokens = this.store.get('requests.tokens')
		this.query = {}
		this.exclusive = {}

		if (! (this.tokens instanceof Object)) this.tokens = {}
	}

	// returns all requests up to the first placeholder, or everything if there are no placeholders
	all() {
		return this.items
	}

	// return request by id
	findId(id) {
		return this.items.find(request => request.id == id)
	}

	// loads request by id, inserts a placeholder to the items array which is replaced once the metadata is retrieved
	loadId(id, placeholder) {
		let existing = this.findId(id)

		if (existing) {
			placeholder = existing
		} else {
			placeholder = placeholder || Request.placeholder(id)
			this.items.push(placeholder)
		}

		placeholder.loading = true

		return this.load(id, promise => {
			return promise
				.then(data => { return placeholder.resolve(data[0]) })
				.catch(message => { return placeholder.resolveWithError(message) })
		})
	}

	loadExtended(id, fields) {
		let request = this.findId(id)

		return this.load(`${id}/extended`, promise => {
			return promise.then(data => { return request.extend(data[0], fields) }).catch(error => {})
		})
	}

	loadLatest(update = true) {
		return this.load('latest', promise => {
			return promise.then(data => {
				if (update) this.items.push(data[0])
				return data[0]
			})
		}, update)
	}

	returnLatest() {
		return this.loadLatest(false)
	}

	// loads requests after the last request, if the count isn't specified loads all requests
	loadNext(count, id, update = true) {
		if (! id && ! this.items.length) return Promise.resolve([])

		id = id || this.last().id

		return this.load(`${id}/next` + (count ? `/${count}` : ''), promise => {
			return promise.then(data => {
				if (update) this.items.push(...data)
				return data
			}).catch(error => {})
		}, update)
	}

	returnNext(count, id) {
		return this.loadNext(count, id, false)
	}

	// loads requests before the first request, if the count isn't specified loads all requests
	loadPrevious(count, id, update = true) {
		if (! id && ! this.items.length) return Promise.resolve([])

		id = id || this.first().id

		return this.load(`${id}/previous` + (count ? `/${count}` : ''), promise => {
			return promise.then(data => {
				if (update) this.items.unshift(...data)
				return data
			}).catch(error => {})
		}, update)
	}

	returnPrevious(count, id) {
		return this.loadPrevious(count, id, false)
	}

	clear() {
		this.items.splice(0)
	}

	first() {
		return this.items[0]
	}

	last(filter) {
		return filter
			? this.items.slice().reverse().find(filter)
			: this.items[this.items.length - 1]
	}

	setClient(client) {
		this.client = client
	}

	setItems(items) {
		this.items = items
	}

	setRemote(url, options) {
		options = options || {}
		options.path = options.path || '/__clockwork/'

		url = new URI(url)

		let [ pathname, query ] = options.path.split('?')
		url.pathname(pathname || '')
		url.query(query || '')
		url.hash('')

		this.remoteUrl = url.toString()
		this.remoteHeaders = options.headers || {}
	}

	setAuthenticationToken(token) {
		this.tokens[this.remoteUrl] = token
		this.store.set('requests.tokens', this.tokens)
	}

	setQuery(query) {
		this.query = query
	}

	load(uri, configure, exclusive = false) {
		if (exclusive) return this.loadExclusive(uri, configure)

		let url = URI(`${this.remoteUrl}${uri}`).addQuery(this.query).toString()
		let headers = Object.assign({}, this.remoteHeaders, { 'X-Clockwork-Auth': this.tokens[this.remoteUrl] })

		return configure(this.client('GET', url, {}, headers).then(data => {
			if (! data) return []
			return ((data instanceof Array) ? data : [ data ]).map(data => new Request(data))
		}))
	}

	loadExclusive(uri, configure) {
		if (this.exclusive[uri]) return this.exclusive[uri]

		return this.exclusive[uri] = this.load(uri, configure).finally(() => this.exclusive[uri] = null)
	}
}
