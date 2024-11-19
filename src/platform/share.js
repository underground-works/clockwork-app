import Request from '../features/request'

import URI from 'urijs'

export default class Share
{
	init(global) {
		this.global = global
		this.requests = global.$requests
		this.settings = global.$settings

		this.useProperTheme()
		this.setMetadataUrl('/data/')
		this.setMetadataClient()

		this.loadRequestFromUri()

		this.isTakingScreenshot = Object.keys(URI(window.location.href).query(true)).includes('screenshot')
	}

	loadRequest(requestId) {
		this.requests.clear()
		this.requests.loadId(requestId)
	}

	useProperTheme() {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.settings.defaultAppearance = 'dark'
		}

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			this.settings.defaultAppearance = event.matches ? 'dark' : 'light'
		})
	}

	setMetadataUrl(url) {
		this.requests.setRemote(
			URI(url).path('').toString(), { path: URI(url).path() + '/' }
		)
	}

	setMetadataClient() {
		this.requests.setClient((method, url, data, headers) => {
			let body = new FormData
			Object.entries(data).forEach(([ key, value ]) => body.append(key, value))

			return this.fetch(method, url, data, headers)
				.then(({ response, data }) => {
					if (response.status == 403) {
						throw { error: 'requires-authentication', message: data.message, requires: data.requires }
					} else if (response.status != 200) {
						throw { error: 'error-response', message: 'Server returned an error response.' }
					} else if (! url.includes('only=') && (! (data instanceof Array) && (! (data instanceof Object) || ! Object.keys(data).length))) {
						throw { error: 'empty-response', message: 'Server returned an empty metadata.' }
					}

					return data
				})
		})
	}

	fetch(method, url, data = {}, headers = {}) {
		let body = new FormData
		Object.entries(data).forEach(([ key, value ]) => body.append(key, value))

		return fetch(url, { method, body: Object.keys(data).length ? body : null, headers })
			.then(response => response.json().then(data => ({ response, data })))
			.catch(e => {
				throw { error: 'empty-response', message: 'Shared request was not found.' }
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

	loadRequestFromUri() {
		let id = URI(window.location.href).path().split('/').slice(-1)[0]

		this.requests.loadId(`${id}.json`, false)
	}

	hasFeature(feature) {
		let disabledFeatures = [ 'load-client-metrics', 'profiler', 'requests-list', 'sharing', 'whats-new' ]

		if (this.isTakingScreenshot) {
			disabledFeatures = [ ...disabledFeatures, 'request-sidebar', 'tab-bar' ]
		} else {
			disabledFeatures = [ ...disabledFeatures, 'details-request' ]
		}

		return ! disabledFeatures.includes(feature)
	}

	settingsChanged() {
	}
}
