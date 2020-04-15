import extend from 'just-extend'

export default class LocalStore
{
	constructor() {
		this.persistent = true

		this.load()
	}

	get(key, defaultValue) {
		if (this.data[key] == undefined) this.set(key, defaultValue)

		return this.data[key]
	}

	set(key, value) {
		this.data[key] = value
		this.save()
	}

	load() {
		try {
			this.data = JSON.parse(localStorage.getItem('clockwork'))
		} catch (e) {
			this.persistent = false
		}

		if (! (this.data instanceof Object)) this.data = {}

		this.data = extend({}, this.defaults(), this.data)
	}

	save() {
		try {
			localStorage.setItem('clockwork', JSON.stringify(this.data))
		} catch (e) {}
	}

	defaults() {
		return {
			preserveLog: true,
			requestsListCollapsed: false,
			requestSidebarCollapsed: false
		}
	}
}