import Callgrind from './callgrind/callgrind'

export default class Profiler
{
	constructor (requests, platform) {
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

		this.platform.getCookie('XDEBUG_PROFILE').then(value => this.isProfiling = value)
	}

	enableProfiling () {
		return this.platform.setCookie('XDEBUG_PROFILE', '1', 60 * 60 * 24 * 30).then(() => {
			this.isProfiling = true
		})
	}

	disableProfiling (clear = false) {
		if (clear) this.clear()

		return this.platform.setCookie('XDEBUG_PROFILE', '0', 0).then(() => {
			this.isProfiling = false
		})
	}

	loadRequest (request) {
		if (this.request && this.request.id == request.id) return

		if (! request.xdebug || ! request.xdebug.profile) {
			return this.clear()
		}

		this.request = request

		this.available = this.loading = this.parsing = this.ready = false
		this.summary = this.metadata = this.functions = undefined

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

	parseProfile () {
		this.ready = false
		this.parsing = true

		Callgrind.parse(this.request.xdebug.profileData).then(profile => {
			if (! profile.metadata.summary) {
				return this.parsing = this.available = false
			}

			this.metadata = profile.metadata
			this.summary = this.metadata.summary.split(' ')

			let budget = this.shownFraction * this.summary[this.metric]

			this.functions = profile.functions
				.filter(fn => fn.name != '{main}')
				.sort((fn1, fn2) => fn2.self[this.metric] - fn1.self[this.metric])
				.filter(fn => {
					budget -= fn.self[this.metric]
					return budget > 0
				})
				.map(fn => {
					fn.fullPath = fn.file == 'php:internal' ? 'internal' : `${fn.file}:${fn.line}`
					fn.shortPath = fn.fullPath != 'internal' ? fn.fullPath.split(/[\/\\]/).pop() : fn.fullPath
					return fn
				})

			this.parsing = false
			this.ready = true
		})
	}

	clear () {
		this.available = this.loading = this.parsing = this.ready = false
		this.metadata = this.functions = undefined
	}

	showMetric (metric) {
		this.metric = metric

		this.parseProfile()
	}

	showPercentual (percentual) {
		this.percentual = percentual === true || percentual === undefined
	}

	setShownFraction (shownFraction) {
		this.shownFraction = shownFraction

		this.parseProfile()
	}

	formatMetric (item) {
		if (this.percentual) {
			return Math.round(item[this.metric] / this.summary[this.metric] * 100) + ' %'
		} else {
			return this.metric == 1
				? Math.round(item[this.metric] / 1024) + ' kB'
				: Math.round(item[this.metric] / 100) / 10 + ' ms'
		}
	}
}
