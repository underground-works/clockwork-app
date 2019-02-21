import Vue from 'vue'
import VueChartkick from 'vue-chartkick'
import VueClipboard from 'vue-clipboard2'
import VueMoment from 'vue-moment'
import VueSpinner from 'vue-spinkit'
import vClickOutside from 'v-click-outside'

import Chart from 'chart.js'
import lodashGet from 'lodash/get'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(VueMoment)
Vue.use(VueChartkick, { adapter: Chart })
Vue.use(vClickOutside)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('spinner', VueSpinner)

Vue.mixin({
	methods: {
		$get: lodashGet
	}
})