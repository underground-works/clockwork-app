import App from './App.vue'
import { createApp as createVueApp } from 'vue'

import Icon from './components/UI/Icon'
import Spinner from './components/UI/Spinner'

import VueClipboard from 'vue-clipboard2'
import vClickOutside from 'v-click-outside'

import lodashGet from 'lodash/get'

export default function createApp(global) {
	let app = createVueApp(App)

	app.config.devtools = true
	app.config.performance = true

	global.$editorLinks.register(app)
	global.$textFilters.register(app)

	app.component('icon', Icon)
	app.component('spinner', Spinner)

	app.mixin({
        data: () => ({ global }),
		computed: Object.entries(global).reduce((result, [ key, value ]) => {
			result[key] = function () { return this.global[key] }
			return result
		}, {})
	})

	VueClipboard.config.autoSetContainer = true

	app.use(VueClipboard)
	app.use(vClickOutside)

	app.mixin({ methods: { $get: lodashGet } })

	return app
}
