import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import VueSpinner from 'vue-spinkit'
import vClickOutside from 'v-click-outside'

import lodashGet from 'lodash/get'
import hljs from 'highlight.js/lib/core';
import hljsSql from 'highlight.js/lib/languages/sql';

window.hljs = hljs; // See https://github.com/highlightjs/highlight.js/issues/2718
hljs.registerLanguage('sql', hljsSql);

Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(vClickOutside)
Vue.use(hljs.vuePlugin);

Vue.component('spinner', VueSpinner)

Vue.mixin({
	methods: {
		$get: lodashGet
	}
})