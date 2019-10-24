import extend from 'just-extend'

export default class Settings
{
	constructor(store, requests) {
		this.store = store
		this.requests = requests

		this.reload()
	}

	get editor() {
		return this.settings.global.editor
	}

	set editor(value) {
		this.settings.global.editor = value
	}

	get localPathMapReal() {
		return this.getSite('localPathMap', {}).real
	}

	set localPathMapReal(value) {
		this.setSite('localPathMap', extend(true, this.getSite('localPathMap', {}), { real: value }))
	}

	get localPathMapLocal() {
		return this.getSite('localPathMap', {}).local
	}

	set localPathMapLocal(value) {
		this.setSite('localPathMap', extend(true, this.getSite('localPathMap', {}), { local: value }))
	}

	get showIncomingRequests() {
		return this.settings.global.showIncomingRequests
	}

	set showIncomingRequests(value) {
		this.settings.global.showIncomingRequests = value
	}

	getSite(key, defaultValue) {
		return this.settings.site[this.requests.remoteUrl] ? this.settings.site[this.requests.remoteUrl][key] : defaultValue
	}

	setSite(key, value) {
		if (! this.settings.site[this.requests.remoteUrl]) this.settings.site[this.requests.remoteUrl] = {}

		this.settings.site[this.requests.remoteUrl][key] = value
	}

	save() {
		let settings = extend(true, this.loadSettings(), this.settings)

		this.store.set('settings', settings)
	}

	reload() {
		this.settings = this.loadSettings()
	}

	loadSettings() {
		let defaultSettings = { global: { editor: null, showIncomingRequests: true }, site: {} }

		return extend(true, defaultSettings, this.store.get('settings'))
	}
}