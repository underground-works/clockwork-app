import Request from '../features/request'

import URI from 'urijs'

export default class Standalone
{
	init(global) {
		this.global = global
		this.requests = global.$requests
		this.authentication = global.$authentication
		this.profiler = global.$profiler
		this.store = global.$store

		this.useProperTheme()
		this.setMetadataUrl()
		this.setMetadataClient()

		this.startPollingRequests()
		this.throttlePolling()
	}

	// appending ?dark to the query string will cause dark theme to be used, ?dark=1 or ?dark=0 can be used to
	// permanently activate or deactivate dark theme in this browser
	useProperTheme() {
		let wantsDarkTheme = URI(window.location.href).query(true).dark

		if (wantsDarkTheme == '1' || wantsDarkTheme == '0')	{
			this.store.set('use-dark-theme', wantsDarkTheme)
			wantsDarkTheme = wantsDarkTheme == '1'
		} else if (this.store.get('use-dark-theme')) {
			wantsDarkTheme = this.store.get('use-dark-theme') == '1'
		} else {
			wantsDarkTheme = wantsDarkTheme === null
		}

		if (wantsDarkTheme) {
			document.querySelector('body').classList.add('dark')
		}
	}

	setMetadataUrl() {
		this.requests.setRemote(
			// window.location.href, { path: URI(window.location.href.split('/').slice(0, -1).join('/')).path() + '/' }
			'http://127.0.0.1:8000/', { path: '__clockwork/' }
		)
	}

	setMetadataClient() {
		this.requests.setClient((method, url, data, headers) => {
			let isProfiling = this.profiler.isProfiling

			let body = new FormData
			Object.entries(data).forEach(([ key, value ]) => body.append(key, value))

			let makeRequest = () => {
				return fetch(url, { method, body: Object.keys(data).length ? body : null, headers })
					.then(response => response.json().then(data => ({ response, data })))
					.then(({ response, data }) => {
						if (response.status == 403) {
							throw { error: 'requires-authentication', message: data.message, requires: data.requires }
						} else if (response.status != 200) {
							throw { error: 'Server returned an error response.' }
						} else if (! (data instanceof Object) || ! Object.keys(data).length) {
							throw { error: 'Server returned an empty metadata.' }
						}

						return data
					})
					.then(data => {
						if (isProfiling) this.profiler.enableProfiling()

						return data
					})
			}

			return isProfiling ? this.profiler.disableProfiling().then(makeRequest) : makeRequest()
		})
	}

	setCookie(name, value, expiration) {
		document.cookie = `${name}=${value};path=/;max-age=${expiration}`

		return Promise.resolve()
	}

	getCookie(name) {
		let matches = document.cookie.match(new RegExp(`(?:^| )${name}=([^;]*)`))

		return Promise.resolve(! matches ? undefined : matches.groups[0])
	}

	startPollingRequests() {
		this.pollingInterval = 1000

		this.requests.loadLatest().then(() => {
			if (! this.requests.last()) throw new Error

			this.pollRequests()
		}).catch(error => {
			if (error.error == 'requires-authentication') {
				this.authentication.request(error.message, error.requires).then(() => {
					this.startPollingRequests()
				})
			} else {
				setTimeout(() => this.startPollingRequests(), this.pollingInterval)
			}
		})
	}

	pollRequests() {
		clearTimeout(this.pollTimeout)

		this.requests.loadNext().then(() => {
			if (! this.store.get('preserveLog')) {
				this.requests.setItems(this.requests.all().slice(-1))
			}

			this.pollTimeout = setTimeout(() => this.pollRequests(), this.pollingInterval)
		}).catch(() => {
			this.pollTimeout = setTimeout(() => this.pollRequests(), this.pollingInterval)
		})
	}

	throttlePolling() {
		document.addEventListener('visibilitychange', () => {
			this.pollingInterval = document.hidden ? 60000 : 1000

			if (! document.hidden) this.pollRequests()
		});
	}
}
