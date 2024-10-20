import { Timeline } from './timeline'

import httpCodes from '../support/http-codes.json'

import clone from 'just-clone'
import pick from 'just-pick'
import sqlFormatter from '@sqltools/formatter'
import URI from 'urijs'
import { shallowReactive } from 'vue'

export class Request
{
	constructor(data) {
		Object.assign(this, data)

		this.original = data

		this.time = parseFloat(this.time)
		this.responseDuration = parseFloat(this.responseDuration)
		this.responseDurationRounded = this.responseDuration ? Math.round(this.responseDuration) : 0
		this.databaseDurationRounded = this.databaseDuration ? Math.round(this.databaseDuration) : 0
		this.memoryUsageFormatted = this.memoryUsage ? this.formatBytes(this.memoryUsage) : undefined

		this.processCacheStats()
		this.cacheQueries = this.processCacheQueries(this.cacheQueries)
		this.cookies = this.createKeypairs(this.cookies)
		this.middleware = this.middleware instanceof Array ? this.middleware : []
		this.processDatabase()
		this.processModels()
		this.notifications = this.processNotifications(this.notifications, this.emailsData)
		this.processHttpRequests()
		this.events = this.processEvents(this.events)
		this.getData = this.createKeypairs(this.getData)
		this.requestData = this.requestData instanceof Object
			? this.createKeypairs(this.requestData, false) : this.requestData
		this.headers = this.processHeaders(this.headers)
		this.log = this.processLog(this.log)
		this.postData = this.createKeypairs(this.postData)
		this.queueJobs = this.processQueueJobs(this.queueJobs)
		this.redisCommands = this.processRedisCommands(this.redisCommands)
		this.sessionData = this.createKeypairs(this.sessionData)
		this.performanceMetrics = this.processPerformanceMetrics(this.performanceMetrics)
		this.viewsData = this.processViews(this.viewsData)
		this.userData = this.processUserData(this.userData)
		this.timeline = this.processTimeline(this.timelineData)
		this.clientMetrics = this.processClientMetrics(this.clientMetrics)
		this.webVitals = this.processWebVitals(this.webVitals)

		this.processCommand()
		this.processQueueJob()
		this.processTest()

		this.errorsCount = this.getErrorsCount()
		this.warningsCount = this.getWarningsCount()
		this.exceptions = this.processExceptions()

		this.loadClientMetricsAttempts = 0
	}

	static placeholder(id, request, parent) {
		return Object.assign(new Request({
			loading: true,
			id: id,
			uri: request ? (new URI(request.url)).pathname() : '/',
			controller: 'Waiting...',
			method: request ? request.method : 'GET',
			responseStatus: '?',
			parent
		}), {
			responseDurationRounded: '?',
			databaseDurationRounded: '?'
		})
	}

	resolve(request, fields) {
		return Object.assign(this, fields ? pick(request, fields) : request, {
			loading: false, error: undefined, original: Object.assign(this.original, request.original)
		})
	}

	resolveWithError(error) {
		return Object.assign(this, { loading: false, error })
	}

	loadClientMetrics(requests) {
		// return if this is not an http request
		if (! this.isRequest()) return

		// return if we already have client metrics loaded, checks both clientMetrics and webVitals as webVitals take
		// longer to measure
		if (this.clientMetrics.some(m => m.value) && Object.values(this.webVitals).some(v => v.value)) return

		// return if we are already loading
		if (this.loadClientMetricsTimeout) return

		// return if we made too many attempts
		if (++this.loadClientMetricsAttempts > 4) return

		// load the metrics with a 2.5s delay to accomodate for the request being updated with metrics from the client
		// browser, keep trying until we get the metrics or run out of attempts
		this.loadClientMetricsTimeout = setTimeout(() => {
			// return if the request has been removed form the requests list
			if (! requests.findId(this.id)) return

			requests.loadId(this.id, [ 'clientMetrics', 'webVitals' ]).then(() => {
				this.loadClientMetricsTimeout = undefined
				this.loadClientMetrics(requests)
			})
		}, 2500)
	}

	isClientError() {
		return this.responseStatus >= 400 && this.responseStatus < 500
	}

	isServerError() {
		return this.responseStatus >= 500 && this.responseStatus < 600
	}

	isAjax() {
		return this.headers.find(header => header.name == 'X-Requested-With' && header.value == 'XMLHttpRequest')
	}

	isRequest() {
		return this.type == 'request' || ! this.type
	}

	isCommand() {
		return this.type == 'command'
	}

	isCommandError() {
		return this.commandExitCode == 1
	}

	isCommandWarning() {
		return this.commandExitCode > 1
	}

	isQueueJob() {
		return this.type == 'queue-job'
	}

	isQueueJobError() {
		return this.jobStatus == 'failed'
	}

	isQueueJobWarning() {
		return this.jobStatus == 'released'
	}

	isTest() {
		return this.type == 'test'
	}

	isTestError() {
		return [ 'failed', 'error' ].includes(this.testStatus)
	}

	isTestWarning() {
		return [ 'warning' ].includes(this.testStatus)
	}

	get tooltip() {
		if (this.isCommand()) {
			return `[CMD] ${this.commandName} (${this.commandLine})`
		} else if (this.isQueueJob()) {
			return `[QUEUE] ${this.jobName} (${this.jobDescription})`
		} else if (this.isTest()) {
			return `[TEST] ${this.testGroup} (${this.testName})`
		} else {
			return `${this.method} ${this.uri} (${this.controller})`
		}
	}

	createKeypairs(data, sorted = true) {
		if (! (data instanceof Object)) return []

		let keypairs = Object.keys(data).map(key => ({ name: key, value: data[key] }))

		if (sorted) keypairs = keypairs.sort((a, b) => a.name.localeCompare(b.name))

		return keypairs
	}

	processCacheStats() {
		if (this.cacheDeletes) this.cacheDeletes = parseInt(this.cacheDeletes)
		if (this.cacheHits) this.cacheHits = parseInt(this.cacheHits)
		if (this.cacheReads) this.cacheReads = parseInt(this.cacheReads)
		if (this.cacheWrites) this.cacheWrites = parseInt(this.cacheWrites)

		this.cacheMisses = this.cacheReads && this.cacheHits ? this.cacheReads - this.cacheHits : null
	}

	processCacheQueries(data) {
		if (! (data instanceof Array)) return []

		return data.map(query => {
			query.expiration = query.expiration ? this.formatTime(query.expiration) : undefined
			query.value = query.value !== undefined ? query.value : ''

			return query
		})
	}

	processClientMetrics(data) {
		data = this.enforceObject(data)

		return [
			{ name: 'Redirect', value: data.redirect },
			{ name: 'DNS', value: data.dns, color: 'purple', onChart: true },
			{ name: 'Connection', value: data.connection, color: 'blue', onChart: true },
			{ name: 'Waiting', value: data.waiting, color: 'red', onChart: true },
			{ name: 'Receiving', value: data.receiving, color: 'green', onChart: true },
			{ name: 'To interactive', value: data.domInteractive, color: 'blue', onChart: true, dom: true },
			{ name: 'To complete', value: data.domComplete, color: 'purple', onChart: true, dom: true }
		]
	}

	processDatabase() {
		this.databaseQueries = this.processDatabaseQueries(this.databaseQueries)

		this.databaseQueriesCount = parseInt(this.databaseQueriesCount) || this.databaseQueries.length
		this.databaseSlowQueries = parseInt(this.databaseSlowQueries)
			|| this.databaseQueries.filter(query => query.tags.includes('slow')).length
		this.databaseSelects = parseInt(this.databaseSelects)
			|| this.databaseQueries.filter(query => query.query.match(/^select /i)).length
		this.databaseInserts = parseInt(this.databaseInserts)
			|| this.databaseQueries.filter(query => query.query.match(/^insert /i)).length
		this.databaseUpdates = parseInt(this.databaseUpdates)
			|| this.databaseQueries.filter(query => query.query.match(/^update /i)).length
		this.databaseDeletes = parseInt(this.databaseDeletes)
			|| this.databaseQueries.filter(query => query.query.match(/^delete /i)).length
		this.databaseOthers = parseInt(this.databaseOthers)
			|| this.databaseQueries.filter(query => ! query.query.match(/^(select|insert|update|delete) /i)).length
	}

	processDatabaseQueries(data) {
		if (! (data instanceof Array)) return []

		return data.map(query => {
			query.model = query.model || '-'
			query.shortModel = query.model ? query.model.split('\\').pop() : '-'
			query.tags = query.tags instanceof Array ? query.tags : []
			query.bindings = this.optionalNonEmptyObject(query.bindings)
			query.prettifiedQuery = sqlFormatter.format(query.query)

			let match, sql = query.query.trim()

			if (match = sql.match(/^SELECT\s[\s\S]*?\sFROM\s+([A-Za-z-_'".]+)/i)) {
				query.shortQuery = `SELECT FROM ${match[1].replaceAll(/['"]/g, '')}`
			} else if (match = sql.match(/^INSERT\s+INTO\s+([A-Za-z-_'".]+)/i)) {
				query.shortQuery = `INSERT INTO ${match[1].replaceAll(/['"]/g, '')}`
			} else if (match = sql.match(/^UPDATE\s+([A-Za-z-_'".]+)/i)) {
				query.shortQuery = `UPDATE ${match[1].replaceAll(/['"]/g, '')}`
			} else if (match = sql.match(/^DELETE\s+FROM\s+([A-Za-z-_'".]+)/i)) {
				query.shortQuery = `DELETE FROM ${match[1].replaceAll(/['"]/g, '')}`
			} else {
				query.shortQuery = sql
			}

			return query
		})
	}

	processNotifications(notifications, emails) {
		// legacy emails data in timeline format
		emails = Object.values(this.optionalNonEmptyObject(emails, {}))
			.filter(email => email.data instanceof Object)
			.map(email => ({
				subject: email.data.subject,
				to: [ email.data.to ],
				from: [ email.data.from ],
				time: email.start,
				duration: email.duration,
				type: 'mail',
				data: []
			}))

		return this.enforceArray(notifications).concat(emails).map(function (notification) {
			notification.isShowingDetails = false

			return notification
		})
	}

	processHttpRequests() {
		this.httpRequests = this.enforceArray(this.httpRequests).map(request => {
			let matches

			if (matches = request.request.url.match(/(.+?:\/\/)(.+?)(\/.+?)?(\?.+)?$/)) {
				request.request.url = { full: request.request.url, scheme: matches[1], host: matches[2], path: matches[3], query: matches[4] }
			} else {
				request.request.url = { full: request.request.url }
			}

			if (request.response?.status) {
				request.response.statusMessage = httpCodes[request.response.status].message
			}

			return request
		})
	}

	processEvents(data) {
		if (! (data instanceof Array)) return []

		return data.map(event => {
			event.objectEvent = (event.data instanceof Object && event.event == event.data.__class__)
			event.time = event.time ? new Date(event.time * 1000) : undefined

			event.listeners = event.listeners instanceof Array ? event.listeners : []
			event.listeners = event.listeners.map(listener => {
				let shortName, matches

				if (matches = listener.match(/Closure \(.*[\/\\](.+?:\d+)-\d+\)/)) {
					shortName = 'Closure (' + matches[1] + ')'
				} else {
					shortName = listener.split(/[\/\\]/).pop()
				}

				return { name: listener, shortName }
			})

			return event
		})
	}

	processExceptions() {
		let exception = this.log.length ? this.log[this.log.length - 1].exception : null

		if ((this.isRequest() && ! this.isServerError()) || ! exception) return []

		exception = clone(exception)

		let current = exception;

		do {
			current.trace = [ {
				call:     `${current.type}()`,
				file:     current.file,
				line:     current.line,
				isVendor: false
			}, ...current.trace ]
		} while (current = current.previous)

		return [ exception ]
	}

	processHeaders(data) {
		if (! (data instanceof Object)) return []

		return Object.keys(data)
			.map(key => {
				let value = data[key]

				key = key.split('-').map(value =>
					value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
				).join('-')

				return { name: key, value }
			})
			.reduce((flat, header) => {
				header = header.value instanceof Array
					? header.value.map(value => ({ name: header.name, value })) : [ header ]

				return flat.concat(header)
			}, [])
			.sort((a, b) => a.name.localeCompare(b.name))
	}

	processLog(data) {
		if (! (data instanceof Array)) return []

		return data.map(message => {
			if (message.exception) {
				message.file = message.exception.file
				message.line = message.exception.line
				message.trace = message.exception.trace
			}

			message.time = new Date(message.time * 1000)
			message.context = message.context instanceof Object && Object.keys(message.context).filter(key => key != '__type__').length ? message.context : undefined

			return message
		})
	}

	processModels() {
		this.modelsActions = this.processModelsActions(this.modelsActions)
	}

	processModelsActions(actions) {
		return this.enforceArray(actions).map(action => {
			action.shortModel = action.model ? action.model.split('\\').pop() : ''
			action.attributes = this.optionalNonEmptyObject(action.attributes)
			action.changes = this.optionalNonEmptyObject(action.changes)
			action.tags = this.enforceArray(action.tags)
			action.bindings = this.optionalNonEmptyObject(action.bindings)
			action.isShowingDetails = false

			return action
		})
	}

	processPerformanceMetrics(data) {
		if (! data) {
			return [
				{ name: 'App', value: (this.responseDurationRounded || 0) - (this.databaseDurationRounded || 0) - (this.cacheTime || 0), color: 'blue' },
				{ name: 'DB', value: this.databaseDurationRounded, color: 'red' },
				{ name: 'Cache', value: this.cacheTime, color: 'green' }
			].filter(metric => metric.value > 0)
		}

		data = data.filter(metric => metric instanceof Object)
			.map((metric, index) => {
				metric.color = metric.color || 'purple'
				return metric
			})

		let metricsSum = data.reduce((sum, metric) => { return sum + metric.value }, 0)

		data.push({ name: 'Other', value: this.responseDurationRounded - metricsSum, color: 'purple' })

		return data
	}

	processQueueJobs(data) {
		if (! (data instanceof Array)) return []

		return data.map(job => {
			job.shortName = job.name.split('\\').pop()

			return job
		})
	}

	processRedisCommands(data) {
		return data instanceof Array ? data : []
	}

	processTest() {
		if (! this.testName) return

		[ this.testGroup, this.testName ] = this.testName.includes('::')
			? this.testName.split('::') : [ this.testName, '' ];
	}

	processTimeline(data) {
		let timeline = new Timeline(
			Object.values(this.optionalNonEmptyObject(data, {})),
			this.time,
			this.time + this.responseDuration
		)

		if (data && ! data.total) timeline.appendTotalEvent()

		this.databaseQueries.forEach(query => timeline.append({
			start: query.time,
			duration: query.duration,
			name: query.shortQuery,
			description: query.query,
			color: 'red',
			tags: [ 'databaseQueries' ]
		}))

		this.events.forEach(event => timeline.append({
			start: event.time,
			duration: event.duration,
			description: event.event,
			color: 'purple',
			tags: [ 'events' ]
		}))

		this.cacheQueries.forEach(query => timeline.append({
			start: query.time,
			duration: query.duration,
			description: `${query.type.toUpperCase()} ${query.key}`,
			color: 'green',
			tags: [ 'cacheQueries' ]
		}))

		this.redisCommands.forEach(command => timeline.append({
			start: command.time,
			duration: command.duration,
			description: `${command.command} ${Object.values(command.parameters).join(' ')}`,
			color: 'green',
			tags: [ 'redisCommands' ]
		}))

		this.queueJobs.forEach(job => timeline.append({
			start: job.time,
			duration: job.duration,
			description: job.name,
			color: 'purple',
			tags: [ 'queueJobs' ]
		}))

		this.notifications.forEach(notification => timeline.append({
			start: notification.time,
			duration: notification.duration,
			description: `${notification.to} - ${notification.subject}`,
			color: 'purple',
			tags: [ 'notifications' ]
		}))

		this.httpRequests.forEach(request => timeline.append({
			start: request.time,
			duration: request.duration,
			description: `${request.request.method} ${request.request.url.full}`,
			color: 'purple',
			tags: [ 'httpRequests' ]
		}))

		timeline.merge(this.viewsData)

		return timeline
	}

	processViews(data) {
		let views = Object.values(this.optionalNonEmptyObject(data, {})).map(view => ({
			start: view.start,
			duration: view.duration,
			name: view.data?.name || view.description,
			description: (view.data?.name || view.description) + (view.data?.memoryUsage ? ` (${this.formatBytes(view.data.memoryUsage)})` : ''),
			data: this.optionalNonEmptyObject(view.data?.data),
			color: 'purple',
			tags: [ 'views' ]
		}))

		return new Timeline(views, this.time, this.time + this.responseDuration)
	}

	processUserData(tabs) {
		if (! (tabs instanceof Object)) return []

		let stripMeta = ([ key, section ]) => key != '__meta'
		let labeledValues = (labels) => ([ key, value ]) => ({ key: labels[key] || key, value })

		return Object.entries(tabs).filter(([ key, tab ]) => {
			return (tab instanceof Object) || tab.__meta || tab.__meta.title
		}).map(([ key, tab ]) => {
			return {
				key,
				title: tab.__meta.title,
				sections: Object.entries(tab).filter(stripMeta).map(([ key, section ]) => {
					let labels = section.__meta.labels || {}
					let data = section.__meta.showAs == 'counters'
						? Object.entries(section).filter(stripMeta).map(labeledValues(labels))
						: Object.entries(section).filter(stripMeta).map(([ key, value ]) => {
							return Object.entries(value).map(labeledValues(labels))
						})

					return {
						data,
						showAs: section.__meta.showAs,
						title: section.__meta.title
					}
				})
			}
		})
	}

	processWebVitals(data) {
		data = this.enforceObject(data)

		let vitals = {
			cls: { slow: 7300, moderate: 3800 },
			fid: { slow: 300, moderate: 100 },
			lcp: { slow: 4000, moderate: 2000 },
			fcp: { slow: 4000, moderate: 2000 },
			ttfb: { slow: 600, moderate: 600 },
			si: { slow: 5800, moderate: 4300 }
		}

		Object.keys(vitals).forEach(key => {
			let value = data[key]
			let score = 'fast'
			let available = ! isNaN(parseFloat(value))

			if (value > vitals[key].slow) score = 'slow'
			else if (value > vitals[key].moderate) score = 'moderate'

			data[key] = { value, score, available }
		})

		return data
	}

	processCommand() {
		this.commandLine = ''

		this.commandLine += (Object.values(this.commandArguments || {})).filter(val => val).join(' ')
		this.commandLine += (Object.entries(this.commandOptions || {})).reduce((line, [ option, value ]) => {
			return line + (value === true ? ` --${option}` : ` --${option}=${value}`)
		}, '')

		this.commandArgumentsMerged = this.createKeypairs(
			Object.assign({}, this.commandArgumentsDefaults || {}, this.commandArguments || {}), false
		)
		this.commandOptionsMerged = this.createKeypairs(
			Object.assign({}, this.commandOptionsDefaults || {}, this.commandOptions || {}), false
		)
	}

	processQueueJob() {
		this.jobOptions = this.createKeypairs(this.jobOptions)
	}

	getErrorsCount() {
		return this.log.reduce((count, message) => {
			return message.level == 'error' ? count + 1 : count
		}, 0)
	}

	getWarningsCount() {
		return this.log.filter(message => message.level == 'warning').length
			+ this.databaseSlowQueries
	}

	formatTime(seconds) {
		let minutes = Math.floor(seconds / 60)
		let hours = Math.floor(minutes / 60)

		seconds = seconds % 60
		minutes = minutes % 60

		let time = []

		if (hours) time.push(hours + 'h')
		if (minutes) time.push(minutes + 'min')
		if (seconds) time.push(seconds + 'sec')

		return time.join(' ')
	}

	formatBytes(bytes) {
		let units = [ 'B', 'kB', 'MB', 'GB', 'TB', 'PB' ]
		let pow = Math.floor(Math.log(bytes) / Math.log(1024))

		return `${Math.round(bytes / Math.round(Math.pow(1024, pow)))} ${units[pow]}`
	}

	enforceArray(input) {
		return input instanceof Array ? input : []
	}

	enforceObject(input) {
		return input instanceof Object && Object.keys(input).filter(key => key != '__type__').length ? input : {}
	}

	optionalNonEmptyObject(input, defaultValue) {
		return input instanceof Object && Object.keys(input).filter(key => key != '__type__').length ? input : defaultValue
	}
}

export default (...args) => shallowReactive(new Request(...args))
export function createRequestPlaceholder(...args) { return shallowReactive(Request.placeholder(...args)) }
