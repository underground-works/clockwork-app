import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import VueSpinner from 'vue-spinkit'
import vClickOutside from 'v-click-outside'

import lodashGet from 'lodash/get'

Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(vClickOutside)

Vue.component('spinner', VueSpinner)

Vue.mixin({
	methods: {
		$get: lodashGet
	}
})