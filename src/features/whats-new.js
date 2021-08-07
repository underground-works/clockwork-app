export default class WhatsNew
{
	constructor(platform, settings) {
		this.platform = platform
		this.settings = settings
	}

	get show() {
		// show the what's new content only when not already seen and the seen state can be persisted
		return this.settings.global.seenReleaseNotesVersion != WhatsNew.latestRelease.version
			&& this.settings.persistent && this.settings.loaded && this.platform.hasFeature('whats-new')
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
				version: '5.1',
				url: 'https://underground.works/blog/clockwork-5.1-released-with-database-queries-highlighting-and-more',
				notes: [
					{
						title: 'Database Queries Highlighting',
						text: [
							'Database queries are now easier to read with SQL syntax highlighting. You can also enable the prettify mode to reformat the queries for even more readibility.'
						],
						image: 'database-queries.png',
						imagePlacement: 'top'
					},
					{
						title: 'Server-side Library Updated',
						text: [
							'The server-side library was also updated with support for Laravel Octane, collecting cache values and more.',
							'For the full list of improvements, changes, and fixes click on the "learn more" button.'
						]
					}
				]
			},
			{
				version: '5.0',
				url: 'https://underground.works/blog/clockwork-5.0-released-with-client-side-metrics-toolbar-and-more',
				notes: [
					{
						title: 'UI refinements',
						text: [
							'Almost every part of the Clockwork UI was touched up and improved. From simplified requests list, new tab bar, counters and tables to reworked dark theme colors.',
							'You will also find a new "credits" link in the settings modal. This opens a credits modal with a little shout-out to all contributors, sponsors and used third-party dependencies.'
						],
						image: 'clockwork-5.png',
						imagePlacement: 'top'
					},
					{
						title: 'Timeline',
						text: [
							'Timeline was rebuilt from the ground up in this release.',
							'The new timeline makes it easier than ever before to figure out what\'s happening in your application.',
							'The condense option makes the timeline more compact and clicking on an event now reveals a popover with more details.',
						],
						image: 'timeline.png',
						imagePlacement: 'right'
					},
					{
						title: 'Client-side metrics and Web Vitals',
						text: [
							'Clockwork helps you to keep your server-side performance in check. Optimizing the backend is just half of the battle though.',
							'Clockwork can now collect client-side performance metrics. Supported are both navigation timings and Web Vitals',
							'Collecting these metrics requires installing a tiny javascript library from npm or via cdn. Check the docs for more details.'
						],
						image: 'client-metrics.png',
						imagePlacement: 'left'
					},
					{
						title: 'Models',
						text: [
							'Models tab is a new tool in your toolbelt for dealing with database issues.',
							'Models actions give you a different point of view at your database usage.',
							'Models counts will show you how many of each model you\'ve retrieved, created, updated and deleted.'
						],
						image: 'models-tab.png',
						imagePlacement: 'right'
					},
					{
						title: 'Notifications',
						text: [
							'Notifications tab is a new tab replacing the emails tab.',
							'This time we support not only emails, but all kinds of notifications, like SMS or Slack messages.',
							'With details like subject, recipient, sender, but also notifiable, notified and mailable objects in Larvel.'
						],
						image: 'notifications-tab.png',
						imagePlacement: 'left'
					},
					{
						title: 'Sharing',
						text: [
							'Have you ever wanted to share a Clockwork profile with someone else? Maybe you\'d like to share details of a crash from a local environment with a co-worker. Or before and after optimisation metrics with your boss.',
							'Sharing a request uploads the metadata to a Clockwork share service and gives you a public link to share with others. On this link you will find a fully working Clockwork app showing the request you shared.',
							'The share service is free to use, click on the share button in the sidebar to start.'
						]
					},
					{
						title: 'Toolbar',
						text: [
							'Clockwork now gives you an option to show basic request information in the form of a toolbar in your app.',
							'A tiny browser component has to be installed from npm or via cdn. See the docs for full installation instructions.'
						],
						image: 'toolbar.png',
						imagePlacement: 'top'
					}
				]
			}
		]
	}
}
