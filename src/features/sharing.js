export default class Sharing
{
	constructor($platform, $settings) {
		this.$platform = $platform
		this.$settings = $settings

		this.shown = false
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

	clear(request) {
		request.shareId = request.shareUrl = request.shareImageUrl = null
	}

	share(request, filter) {
		if (request.shareUrl) return Promise.resolve()

		this.inProgress = true

		return this.$platform.fetch('POST', process.env.VUE_APP_SHARING_URL, { data: this.resolveSharedData(request, filter) })
			.then(({data}) => {
				this.inProgress = false

				request.shareId = data.shareId
				request.shareUrl = data.shareUrl
				request.shareImageUrl = data.shareImageUrl
			})
	}

	resolveSharedData(request, filter) {
		let shared = request.original

		if (! filter.log) shared.log = []
		if (! filter.events) shared.events = []
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
		if (! filter.emails) shared.emailsData = []
		if (! filter.routes) shared.routes = []
		if (! filter.output) shared.commandOutput = undefined
		if (! filter.userData) shared.userData = []

		return JSON.stringify(shared)
	}
}