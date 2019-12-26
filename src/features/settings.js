import Extension from '../platform/extension'

import extend from 'just-extend'
import mapValues from 'just-map-values'

export default class Settings
{
	constructor(store, requests, platform) {
		this.store = store
		this.requests = requests
		this.platform = platform

		this.shown = false
		this.settings = {}

		this.load()
	}

	get global() {
		return this.settings.global
	}

	get site() {
		if (! this.settings.site[this.requests.remoteUrl]) {
			this.settings.site[this.requests.remoteUrl] = extend(true, {}, this.defaults().site)
		}

		return this.settings.site[this.requests.remoteUrl]
	}

	toggle() {
		this.shown = ! this.shown
	}

	save() {
		this.store.set('settings', this.settings)

		this.platform.settingsChanged()
	}

	load() {
		let defaults = this.defaults()
		let settings = this.store.get('settings', {})

		this.settings = {
			global: extend(true, defaults.global, settings.global || {}),
			site: mapValues(settings.site || {}, settings => extend(true, {}, defaults.site, settings || {}))
		}
	}

	defaults() {
		return {
			global: {
				appearance: 'auto',
				editor: null,
				showIncomingRequests: true,
				hideCommandTypeRequests: this.platform instanceof Extension,
				hideQueueJobTypeRequests: this.platform instanceof Extension,
				hideTestTypeRequests: this.platform instanceof Extension,
				timelineHiddenTags: {}
			},
			site: {
				localPathMap: { real: null, local: null }
			}
		}
	}
}