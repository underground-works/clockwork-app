export default class UpdateNotification
{
	constructor(settings) {
		this.settings = settings

		this.serverVersion = null
	}

	get ignoredUpdates() {
		return this.settings.global.ignoredUpdateNotifications || {}
	}

	latest() {
		return {
			version: '4.1.2',
			url: 'https://underground.works/blog/clockwork-4.1-released-with-commands-queue-jobs-tests-profiling-and-more'
		}
	}

	show(host) {
		if (this.ignoresUpdate(host) || ! this.serverVersion) {
			return
		}

		if (this.versionCompare(this.latest().version, this.serverVersion) == 1) {
			return { version: this.latest().version, url: this.latest().url, currentVersion: this.serverVersion }
		}
	}

	ignoresUpdate(host) {
		let ignoredVersion = this.ignoredUpdates[host]

		return ignoredVersion && this.versionCompare(ignoredVersion, this.latest().version) >= 0
	}

	ignoreUpdate(host) {
		let ignoredUpdates = this.ignoredUpdates

		ignoredUpdates[host] = this.latest().version

		this.store.set('update-notification.ignored-updates', ignoredUpdates)
	}

	versionCompare(left, right) {
		left = left.split('.').map(number => parseInt(number))
		right = right.split('.').map(number => parseInt(number))

		for (let i = 0; i < Math.max(left.length, right.length); i++) {
			if ((left[i] && ! right[i]) || left[i] > right[i]) {
				return 1;
			} else if ((! left[i] && right[i]) || left[i] < right[i]) {
				return -1;
			}
		}

		return 0;
	}
}
