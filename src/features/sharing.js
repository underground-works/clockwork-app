import clone from 'just-clone'
import URI from 'urijs'
import { shallowReactive } from 'vue'

export class Sharing
{
	constructor($platform, $settings) {
		this.$platform = $platform
		this.$settings = $settings

		this.shown = false
		this.shownDelete = false
		this.inProgress = false
	}

	get termsAccepted() {
		return this.$settings.global.shareTermsAccepted
	}

	acceptTerms() {
		this.$settings.global.shareTermsAccepted = true
		this.$settings.save()
	}

	toggle() {
		this.shown = ! this.shown
	}

	toggleDelete() {
		this.shownDelete = ! this.shownDelete
	}

	clear(request) {
		request.shareId = request.shareUrl = request.shareImageUrl = null
	}

	share(request, filter) {
		if (request.shareUrl) return Promise.resolve()

		this.inProgress = true

		return this.$platform.fetch('POST', import.meta.env.VITE_SHARING_URL, { data: this.resolveSharedData(request, filter) })
			.then(({response, data}) => {
				this.inProgress = false

				if (response.status == 500) return { error: 'server-error' }

				request.shareId = data.shareId
				request.shareUrl = data.shareUrl
				request.shareImageUrl = data.shareImageUrl

				return data
			})
			.catch(() => {
				this.inProgress = false

				return { error: 'server-error' }
			})
	}

	resolveSharedData(request, filter) {
		let shared = clone(request.original)

		if (! filter.log) shared.log = []
		if (! filter.events) shared.events = []
		if (! filter.models) {
			shared.modelsActions = []
			shared.modelsRetrieved = shared.modelsCreated = shared.modelsUpdated = shared.modelsDeleted = undefined
		}
		if (! filter.database) {
			shared.databaseQueries = []
			shared.databaseQueriesCount = shared.databaseSlowQueries = shared.databaseSelects = shared.databaseInserts
				= shared.databaseUpdates = shared.databaseDeletes = shared.databaseOthers = undefined
		}
		if (! filter.cache) {
			shared.cacheQueries = []
			shared.cacheReads = shared.cacheHits = shared.cacheWrites = shared.cacheDeletes = undefined
		}
		if (! filter.redis) shared.redisCommands = []
		if (! filter.queue) shared.queueJobs = []
		if (! filter.views) shared.viewsData = []
		if (! filter.notifications) shared.notifications = shared.emailsData = []
		if (! filter.routes) shared.routes = []
		if (! filter.output) shared.commandOutput = undefined
		if (! filter.userData) shared.userData = []

		return JSON.stringify(shared)
	}

	deleteShared() {
		let id = URI(window.location.href).path().split('/').slice(-1)[0]

		return this.$platform.fetch('POST', window.location, { '_method': 'delete' })
	}
}

export default (...args) => shallowReactive(new Sharing(...args))
