export default class WhatsNew
{
	constructor(settings) {
		this.settings = settings
	}

	get show() {
		// show the what's new content only when not already seen and the seen state can be persisted
		return this.settings.global.seenReleaseNotesVersion != WhatsNew.latestRelease.version
			&& this.settings.persistent
	}

	seen() {
		this.settings.global.seenReleaseNotesVersion = WhatsNew.latestRelease.version
		this.settings.save()
	}

	static get latestRelease() {
		return WhatsNew.releases[0]
	}

	static get releases() {
		return [
			{
				version: '4.1',
				url: 'https://underground.works/blog/clockwork-4.1-released-with-commands-queue-jobs-tests-profiling-and-more',
				notes: [
					{
						title: 'Commands profiling',
						text: [
							'Collect executed artisan commands with all profiling data and command specific data like command name, exit code, arguments, parameters and output.',
							'New "output" tab shows an ansi formatted command output.'
						],
						image: 'commands-profiling.png'
					},
					{
						title: 'Queue jobs profiling',
						text: [
							'Collect executed queue jobs with all profiling data and queue-job specific data like job name, status, payload, connection, queue name and options.',
							'The "queue" tab now shows the disatched job\'s status with an ability to show full job details if available.'
						],
						image: 'queue-jobs-profiling.png'
					},
					{
						title: 'Tests profiling',
						text: [
							'Collect ran tests with all profiling data and test specific data like test name, status and executed asserts.'
						],
						image: 'tests-profiling.png'
					},
					{
						title: 'Extended timeline',
						text: [
							'Timeline now includes database queries, events, cache queries, queue jobs, redis commands, views and emails.',
							'You can use the new "tag" icons to filter out specific type of timeline items.'
						],
						image: 'extended-timeline.png'
					},
					{
						title: 'New settings modal',
						text: [
							'Personalize Clockwork via the new settings modal, including new appearance settings, ability to hide various types of requests and to disable auto-showing of incoming requests.'
						],
						image: 'new-settings-modal.png'
					},
					{
						title: 'Parent requests',
						text: [
							'Requests can now have parent requests, eg. a queue-job can have the http request that dispatched it as a parent. Parent requests are lazy-loaded with ability to click-through to the parent details.'
						]
					},
					{
						title: 'Views timeline',
						text: [
							'The views tab now shows a timeline view instead of a simple table, supports memory usage and does not show empty view data anymore.'
						]
					}
				]
			}
		]
	}
}
