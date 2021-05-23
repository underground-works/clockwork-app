import Extension from '../platform/extension'

import extend from 'just-extend'
import mapValues from 'just-map-values'

export default class Settings
{
	constructor(store, requests, platform) {
		this.store = store
		this.requests = requests
		this.platform = platform

		this.requests.settings = this

		this.shown = false
		this.loaded = false
		this.settings = this.defaults()

		this.defaultAppearance = 'light'

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

	get persistent() {
		return this.store.persistent
	}

	get appearance() {
		return this.global.appearance != 'auto' ? this.global.appearance : this.defaultAppearance
	}

	toggle() {
		this.shown = ! this.shown
	}

	save() {
		this.store.set('settings', this.settings)

		this.platform.settingsChanged()
	}

	async load() {
		let defaults = this.defaults()
		let settings = await this.store.get('settings', {})

		this.settings = {
			global: extend(true, defaults.global, settings.global || {}),
			site: mapValues(settings.site || {}, settings => extend(true, {}, defaults.site, settings || {}))
		}

		this.loaded = true

		this.platform.settingsChanged()
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
				ignoredUpdateNotifications: {},
				metadataPath: null,
				performanceVitalsInfoShown: true,
				preserveLog: true,
				requestsListCollapsed: false,
				requestSidebarCollapsed: false,
				requestSidebarCollapsedSections: {
					headers: false, data: false, getData: false, postData: false, cookies: false, middleware: false,
					session: false, arguments: false, options: false, payload: false, queue: false, connection: false,
					asserts: false
				},
				seenReleaseNotesVersion: null,
				shareTermsAccepted: false,
				timelineCondensed: { performance: true, views: false },
				timelineHiddenTags: {},
				viewsTimelineCondensed: false
			},
			site: {
				localPathMap: { real: null, local: null },
				onDemandSecret: null
			}
		}
	}
}