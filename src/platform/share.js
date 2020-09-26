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
	}

	loadRequest(requestId) {
		this.requests.clear()
		this.requests.loadId(requestId)
	}

	useProperTheme() {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.settings.defaultAppearance = 'dark'
		}
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
		let id = URI(window.location.href).fragment()

		if (id) this.requests.loadId(`${id}.json`, false)
	}

	isTakingScreenshot() {
		return Object.keys(URI(window.location.href).query(true)).includes('screenshot')
	}

	hasFeature(feature) {
		let disabledFeatures = [ 'profiler', 'requests-list', 'sharing' ]

		return ! disabledFeatures.includes(feature)
	}

	settingsChanged() {
	}
}