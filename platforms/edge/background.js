let api = chrome || browser
let lastClockworkRequestPerTab = {}

api.runtime.onMessage.addListener((message, sender, callback) => {
	if (message.action == 'fetch') {
		let { method, url, data, headers } = message

		let body = new FormData
		Object.entries(data).forEach(([ key, value ]) => body.append(key, value))

		fetch(url, { method, body: Object.keys(data).length ? body : null, headers })
			.then(response => response.json().then(data => callback({ response: { status: response.status }, data })))
	} else if (message.action == 'getCookie') {
		let { url, name } = message

		api.cookies.get({ url, name }, cookie => {
			callback(cookie ? cookie.value : undefined)
		})
	} else if (message.action == 'getTabUrl') {
		api.tabs.get(message.tabId, tab => callback(tab.url))
	} else if (message.action == 'getLastClockworkRequestInTab') {
		callback(lastClockworkRequestPerTab[message.tabId])
	} else if (message.action == 'setCookie') {
		let { url, name, value, path, expirationDate } = message

		api.cookies.set({ url, name, value, path, expirationDate })
	}

	return true
})

// listen to http requests and send them to the app
api.webRequest.onHeadersReceived.addListener(
	request => {
		// ignore requests executed from the extension itself
		if (request.documentUrl && request.documentUrl.match(new RegExp('^moz-extension://'))) return

		// track last clockwork-enabled request per tab
		if (request.responseHeaders.find(x => x.name.toLowerCase() == 'x-clockwork-id')) {
			lastClockworkRequestPerTab[request.tabId] = request
		}

		api.runtime.sendMessage({ action: 'requestCompleted', request })
	},
	{ urls: [ '<all_urls>' ] },
	[ 'responseHeaders' ]
)

// listen to before navigate events and send tem to the app (used for preserve log feature)
api.webNavigation.onBeforeNavigate.addListener(details => {
	api.runtime.sendMessage({ action: 'navigationStarted', details })
})

// clean up last request when tab is closed
api.tabs.onRemoved.addListener(tabId => delete lastClockworkRequestPerTab[tabId])
