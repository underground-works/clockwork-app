import { shallowReactive } from 'vue'

export class Authentication
{
	constructor(requests) {
		this.requests = requests

		this.username = this.password = ''
		this.shown = false
		this.failed = false
		this.requires = []
	}

	attempt() {
		let data = { username: this.username, password: this.password }

		this.username = this.password = ''
		this.failed = false

		return this.requests.client('POST', `${this.requests.remoteUrl}auth`, data).then(data => {
			this.shown = false

			this.requests.setAuthenticationToken(data.token)

			this.requests.items.forEach(request => {
				if (request.error && request.error.error == 'requires-authentication') {
					return this.requests.loadId(request.id)
				}
			})

			this.accept()
		}).catch(e => {
			this.failed = true
		})
	}

	request(message, requires) {
		this.shown = true
		this.requires = requires
		this.message = message

		return new Promise((accept, reject) => {
			this.accept = accept
			this.reject = reject
		})
	}
}

export default (...args) => shallowReactive(new Authentication(...args))
