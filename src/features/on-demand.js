export default class OnDemand
{
	constructor(platform, settings) {
		this.platform = platform
		this.settings = settings

		this.enabled = false
		this.cookieLifetime = 60
	}

	enableProfiling() {
		this.enabled = true

		this.platform.setCookie('clockwork-profile', this.settings.site.onDemandSecret, this.cookieLifetime)

		clearTimeout(this.timeout)

		this.timeout = setTimeout(() => { if (this.enabled) this.enableProfiling() }, this.cookieLifetime * 1000)
	}

	disableProfiling() {
		this.enabled = false

		clearTimeout(this.timeout)
	}
}
