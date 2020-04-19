export default class LocalStore
{
	constructor() {
		this.backend = null

		if (this.isLocalStorageAvailable()) {
			this.backend = 'local-storage'
		} else if (this.isBrowserStorageAvailable()) {
			this.backend = 'browser-storage'
		}

		this.persistent = !! this.backend
		this.data = null

		this.load()
	}

	async get(key, defaultValue) {
		await this.load()

		if (this.data[key] == undefined) await this.set(key, defaultValue)

		return this.data[key]
	}

	async set(key, value) {
		await this.load()

		this.data[key] = value
		this.save()
	}

	load() {
		if (this.data) return Promise.resolve()

		return new Promise(accept => {
			if (this.backend == 'local-storage') {
				this.loaded(accept, localStorage.getItem('clockwork'))
			} else if (this.backend == 'browser-storage') {
				(window.browser || window.chrome).storage.local.get(['clockwork'], data => {
					this.loaded(accept, data.clockwork)
				})
			} else {
				this.loaded(accept)
			}
		})
	}

	loaded(accept, json) {
		try { this.data = JSON.parse(json) } catch (e) {}

		this.data = this.data instanceof Object ? this.data : {}

		accept()
	}

	save() {
		if (this.backend == 'local-storage') {
			try { localStorage.setItem('clockwork', JSON.stringify(this.data)) } catch (e) {}
		} else if (this.backend == 'browser-storage') {
			(window.browser || window.chrome).storage.local.set({ clockwork: JSON.stringify(this.data) })
		}
	}

	isLocalStorageAvailable() {
		try { localStorage } catch (e) { return false }

		return true
	}

	isBrowserStorageAvailable() {
		return (window.browser && browser.storage) || (window.chrome && chrome.storage)
	}
}