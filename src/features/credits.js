import { reactive, shallowReactive } from 'vue'

export class Credits
{
	constructor(platform) {
		this.platform = platform

		this.shown = false
		this.loaded = false

		this.version = import.meta.env.VITE_VERSION

		this.credits = reactive({
			app: { contributors: [], dependencies: [], sponsors: [] },
			php: { contributors: [], dependencies: [], sponsors: [] }
		})

		this.authors = [{
			name: 'its',
			avatarUrl: 'https://avatars.githubusercontent.com/u/821582?v=3',
			twitterUrl: 'https://twitter.com/itsgoingd',
			githubUrl: 'https://github.com/itsgoingd',
			sponsorUrl: 'https://github.com/sponsors/itsgoingd'
		}]
	}

	toggle() {
		this.shown = ! this.shown
		this.load()
	}

	load() {
		if (this.loaded) return

		let types = [ 'app', 'php' ]
		let keys = [ 'contributors', 'dependencies', 'sponsors' ]
		let fetches = []

		types.forEach(type => {
			keys.forEach(key => {
				fetches.push(
					this.platform.fetch('GET', `${import.meta.env.VITE_CREDITS_URL}/clockwork-${type}/${key}.json`)
						.then(({data}) => this.credits[type][key] = data)
				)
			})
		})

		Promise.all(fetches).then(() => this.loaded = true)
	}
}

export default (...args) => shallowReactive(new Credits(...args))
