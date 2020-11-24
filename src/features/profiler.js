import Callgrind from './callgrind/callgrind'

export default class Profiler
{
	constructor(requests, platform) {
		this.requests = requests
		this.platform = platform

		this.available = false
		this.loading = false
		this.parsing = false
		this.ready = false
		this.isProfiling = false

		this.metric = 0
		this.percentual = false
		this.shownFraction = 0.9

		this.request = undefined
		this.functions = []

		this.platform.getCookie('XDEBUG_PROFILE').then(value => this.isProfiling = value)
	}

	enableProfiling() {
		return this.platform.setCookie('XDEBUG_PROFILE', '1', 60 * 60 * 24 * 30).then(() => {
			this.isProfiling = true
		})
	}

	disableProfiling(clear = false, temporary = false) {
		if (clear) this.clear()

		return this.platform.setCookie('XDEBUG_PROFILE', '0', 0).then(() => {
			if (! temporary) this.isProfiling = false
		})
	}

	withoutProfiling(callback) {
		if (! this.isProfiling) return callback()

		this.disableProfiling(false, true)
		let ret = callback()
		this.enableProfiling()

		return ret
	}

	loadRequest(request) {
		if (this.request && this.request.id == request.id) return

		if (! request.xdebug || ! request.xdebug.profile) {
			return this.clear()
		}

		this.request = request

		this.available = this.loading = this.parsing = this.ready = false
		this.summary = this.metadata = this.functions = []

		this.available = true

		if (request.xdebug.profileData) {
			return this.parseProfile()
		}

		this.loading = true

		this.requests.loadExtended(request.id, [ 'xdebug' ]).then(request => {
			this.loading = false
			this.parseProfile()
		})
	}

	parseProfile() {
		if (! this.request.xdebug.profileData) {
			return this.available = false
		}

		this.ready = false
		this.parsing = true

		Callgrind.parse(this.request.xdebug.profileData).then(profile => {
			if (! profile.metadata.summary) {
				return this.parsing = this.available = false
			}

			this.metadata = profile.metadata
			this.summary = this.metadata.summary.split(' ')

			this.functionsAll = profile.functions
				.filter(fn => fn.name != '{main}')
				.map(fn => {
					fn.selfAll = fn.self
					fn.inclusiveAll = fn.inclusive
					fn.fullPath = fn.file == 'php:internal' ? 'internal' : `${fn.file}:${fn.line}`
					fn.shortPath = fn.fullPath != 'internal' ? fn.fullPath.split(/[\/\\]/).pop() : fn.fullPath
					return fn
				})

			this.presentProfile()

			this.parsing = false
			this.ready = true
		})
	}

	presentProfile() {
		let budget = this.shownFraction * this.summary[this.metric]

		this.functions = this.functionsAll
			.filter(fn => {
				budget -= fn.selfAll[this.metric]
				return budget > 0
			})
			.map(fn => {
				fn.self = this.percentual ? fn.selfAll[this.metric] / this.summary[this.metric] * 100 : fn.selfAll[this.metric]
				fn.inclusive = this.percentual ? fn.inclusiveAll[this.metric] / this.summary[this.metric] * 100 : fn.inclusiveAll[this.metric]
				return fn
			})
	}

	clear() {
		this.available = this.loading = this.parsing = this.ready = false
		this.summary = this.metadata = this.functions = []
		this.request = undefined
	}

	showMetric(metric) {
		this.metric = metric

		this.presentProfile()
	}

	showPercentual(percentual) {
		this.percentual = percentual === true || percentual === undefined

		this.presentProfile()
	}

	setShownFraction(shownFraction) {
		this.shownFraction = shownFraction

		this.presentProfile()
	}

	formatMetric(metric) {
		if (this.percentual) {
			return Math.round(metric) + ' %'
		} else {
			return this.metric == 1 ? Math.round(metric / 1024) + ' kB' : Math.round(metric / 100) / 10 + ' ms'
		}
	}
}
