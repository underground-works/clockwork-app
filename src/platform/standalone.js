import Request from '../features/request'

import URI from 'urijs'

export default class Standalone
{
	init(global) {
		this.global = global
		this.requests = global.$requests
		this.authentication = global.$authentication
		this.profiler = global.$profiler
		this.settings = global.$settings

		this.useProperTheme()
		this.setMetadataUrl()
		this.setMetadataClient()

		this.startPollingRequests()
		this.throttlePolling()
	}

	useProperTheme() {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.global.defaultAppearance = 'dark'
		}
	}

	setMetadataUrl() {
		if (process.env.NODE_ENV == 'development') {
			return this.requests.setRemote(
				process.env.VUE_APP_STANDALONE_REMOTE_HOST, { path: process.env.VUE_APP_STANDALONE_REMOTE_PATH }
			)
		}

		this.requests.setRemote(
			window.location.href, { path: URI(window.location.href.split('/').slice(0, -1).join('/')).path() + '/' }
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

		return Promise.resolve(! matches ? undefined : matches[1])
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
			if (! this.settings.global.preserveLog) {
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

	settingsChanged() {
	}
}
