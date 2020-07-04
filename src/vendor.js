import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import VueMoment from 'vue-moment'
import VueSpinner from 'vue-spinkit'
import vClickOutside from 'v-click-outside'

import lodashGet from 'lodash/get'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(VueMoment)
Vue.use(vClickOutside)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('spinner', VueSpinner)

Vue.mixin({
	methods: {
		$get: lodashGet
	}
})