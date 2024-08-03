import Request from '../features/request'

export default class Extension
{
	get api() { return chrome || browser }

	static runningAsExtension() {
		return (typeof chrome == 'object' && chrome.devtools)
			|| (typeof browser == 'object' && browser.devtools)
	}

	init(global) {
		this.global = global
		this.requests = global.$requests
		this.profiler = global.$profiler
		this.settings = global.$settings
		this.updateNotification = global.$updateNotification

		this.lastPolledId = null

		this.useProperTheme()
		this.setMetadataUrl()
		this.setMetadataClient()

		this.listenToRequests()
		this.throttlePolling()

		this.loadLastRequest()
	}

	useProperTheme() {
		if (this.api.devtools.panels.themeName === 'dark') {
			this.settings.defaultAppearance = 'dark'
		}
	}

	setMetadataUrl() {
		this.resolveTabUrl().then(url => this.requests.setRemote(url))
	}

	setMetadataClient() {
		this.requests.setClient((method, url, data, headers) => {
			return this.profiler.withoutProfiling(() => {
				return this.fetch(method, url, data, headers)
					.then(({ response, data }) => {
						if (response.status == 403) {
							throw { error: 'requires-authentication', message: data.message, requires: data.requires }
						} else if (response.status != 200) {
							throw { error: 'error-response', message: 'Server returned an error response.' }
						} else if (! (data instanceof Array) && (! (data instanceof Object) || ! Object.keys(data).length)) {
							throw { error: 'empty-response', message: 'Server returned an empty metadata.' }
						}

						return data
					})
			})
		})
	}

	fetch(method, url, data = {}, headers = {}) {
		return this.api.runtime.sendMessage({
			action: 'fetch', method, url, data, headers
		})
	}

	setCookie(name, value, expiration) {
		return this.resolveTabUrl().then(url => {
			return this.api.runtime.sendMessage({
				action: 'setCookie', url, name, value, path: '/', expirationDate: Math.floor(Date.now() / 1000) + expiration
			})
		})
	}

	getCookie(name) {
		return this.resolveTabUrl().then(url => {
			return this.api.runtime.sendMessage({
				action: 'getCookie', url, name
			})
		})
	}

	resolveTabUrl() {
		return new Promise((accept, reject) => {
			return this.api.runtime.sendMessage({
				action: 'getTabUrl', tabId: this.api.devtools.inspectedWindow.tabId
			})
		})
	}

	listenToRequests() {
		this.api.runtime.onMessage.addListener(message => {
			if (message.action !== 'requestCompleted') return;

			// skip this check in firefox 57.0 to work around a bug where request.tabId is always -1
			if (navigator.userAgent.toLowerCase().indexOf('firefox/57.0') === -1) {
				if (message.request.tabId != this.api.devtools.inspectedWindow.tabId) return
			}

			let options = this.parseHeaders(message.request.responseHeaders)

			if (! options) return

			this.updateNotification.serverVersion = options.version

			this.requests.setRemote(message.request.url, options)

			let request = Request.placeholder(options.id, message.request)

			this.requests.loadId(options.id, null, request).then(() => this.retryLoading(request))

			options.subrequests.forEach(subrequest => {
				this.requests.setRemote(subrequest.url, { path: subrequest.path })
				this.requests.loadId(subrequest.id, null, Request.placeholder(subrequest.id, subrequest, request))
			})

			this.requests.setRemote(message.request.url, options)
		})

		if (! this.settings.global.hideCommandTypeRequests || ! this.settings.global.hideQueueJobTypeRequests || ! this.settings.global.hideTestTypeRequests) {
			this.startPollingRequests()
		}

		// handle clearing of requests list if we are not preserving log
		this.api.runtime.onMessage.addListener(message => {
			if (message.action !== 'navigationStarted') return;

			// preserve log is enabled
			if (this.settings.global.preserveLog) return

			// navigation event from a different tab
			if (message.details.tabId != this.api.devtools.inspectedWindow.tabId) return

			this.requests.clear()
		})
	}

	loadLastRequest() {
		this.api.runtime.sendMessage({
			action: 'getLastClockworkRequestInTab', tabId: this.api.devtools.inspectedWindow.tabId
		}).then(request => {
			if (! request) return

			let options = this.parseHeaders(request.responseHeaders)

			this.updateNotification.serverVersion = options.version

			this.requests.setRemote(request.url, options)
			this.requests.loadId(options.id, null, Request.placeholder(options.id, request))

			if (! this.settings.global.hideCommandTypeRequests || ! this.settings.global.hideQueueJobTypeRequests || ! this.settings.global.hideTestTypeRequests) {
				this.startPollingRequests()
			}
		})
	}

	parseHeaders(requestHeaders) {
		let found
		let id = (found = requestHeaders.find((x) => x.name.toLowerCase() == 'x-clockwork-id'))
			? found.value : undefined
		let path = (found = requestHeaders.find((x) => x.name.toLowerCase() == 'x-clockwork-path'))
			? found.value : undefined
		let version = (found = requestHeaders.find((x) => x.name.toLowerCase() == 'x-clockwork-version'))
			? found.value : undefined

		if (! id) return

		let headers = {}
		requestHeaders.forEach((header) => {
			if (header.name.toLowerCase().indexOf('x-clockwork-header-') === 0) {
				let name = header.name.replace(/^x-clockwork-header-/i, '')
				headers[name] = header.value
			}
		})

		let subrequests = requestHeaders.filter(header => header.name.toLowerCase() == 'x-clockwork-subrequest')
			.reduce((subrequests, header) => {
				return subrequests.concat(
					header.value.split(',').map(value => {
						let data = value.trim().split(';')
						return { id: data[0], url: decodeURIComponent(data[1]), path: decodeURIComponent(data[2]) }
					})
				)
			}, [])

		return { id, path, version, headers, subrequests }
	}

	retryLoading(request, attempts = 0) {
		if (! request.error) return
		if (attempts > 3) return

		setTimeout(
			() => this.requests.loadId(request.id).then(() => this.retryLoading(request, attempts + 1)),
			(attempts + 1) * (attempts + 1) * 100
		)
	}

	startPollingRequests() {
		this.pollingInterval = 1000
		this.isPolling = true
		this.lastPolledId = this.requests.last()?.id

		if (! this.pollTimeout) this.pollRequests()
	}

	stopPollingRequests() {
		this.isPolling = false

		clearTimeout(this.pollTimeout)
		this.pollTimeout = null
	}

	pollRequests() {
		clearTimeout(this.pollTimeout)

		let types = [
			this.settings.global.hideCommandTypeRequests ? null : 'command',
			this.settings.global.hideQueueJobTypeRequests ? null : 'queue-job',
			this.settings.global.hideTestTypeRequests ? null : 'test'
		].filter(Boolean)

		this.requests.withQuery({ 'type[]': types }, () => {
			this.requests.loadNext().then(requests => {
				this.lastPolledId = this.requests.last()?.id || this.lastPolledId
				if (this.isPolling) this.pollTimeout = setTimeout(() => this.pollRequests(), this.updatePollingInterval(requests.length))
			}).catch(() => {
				if (this.isPolling) this.pollTimeout = setTimeout(() => this.pollRequests(), this.updatePollingInterval(false))
			})
		})
	}

	throttlePolling() {
		document.addEventListener('visibilitychange', () => {
			this.pollingInterval = document.hidden ? 60000 : 1000

			if (! document.hidden && this.isPolling) this.pollRequests()
		});
	}

	updatePollingInterval(requestsReceived) {
		let currentTime = (new Date).getTime()

		if (requestsReceived || ! this.pollingLastReceived) {
			this.pollingLastReceived = currentTime
		}

		if (currentTime - this.pollingLastReceived > 60000) {
			return this.pollingInterval = 5000
		} else if (currentTime - this.pollingLastReceived > 30000) {
			return this.pollingInterval = 2500
		} else {
			return this.pollingInterval = 1000
		}
	}

	hasFeature(feature) {
		let disabledFeatures = [ 'delete-shared', 'details-request' ]

		return ! disabledFeatures.includes(feature)
	}

	settingsChanged() {
		if (this.settings.global.hideCommandTypeRequests && this.settings.global.hideQueueJobTypeRequests && this.settings.global.hideTestTypeRequests) {
			this.stopPollingRequests()
		} else {
			this.startPollingRequests()
		}
	}
}
