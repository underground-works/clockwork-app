import App from './App.vue'
import Vue from 'vue'

import './vendor'
import './fonts'
// import './registerServiceWorker'

import Extension from './platform/extension'
import Standalone from './platform/standalone'

import Authentication from './features/authentication'
import EditorLinks from './features/editor-links'
import LocalStore from './features/local-store'
import Profiler from './features/profiler'
import Requests from './features/requests'
import RequestsSearch from './features/requests-search'
import Settings from './features/settings'
import TextFilters from './features/text-filters'
import UpdateNotification from './features/update-notification'
import WhatsNew from './features/whats-new'

let $platform = Extension.runningAsExtension() ? new Extension : new Standalone

let $store = new LocalStore
let $requests = new Requests
let $settings = new Settings($store, $requests, $platform)

let $authentication = new Authentication($requests)
let $editorLinks = new EditorLinks($settings)
let $profiler = new Profiler($requests, $platform)
let $requestsSearch = new RequestsSearch($requests)
let $textFilters = new TextFilters
let $updateNotification = new UpdateNotification($settings)
let $whatsNew = new WhatsNew($settings)

let global = {
	$requests, $platform, $authentication, $profiler, $requestsSearch, $settings, $store, $updateNotification, $whatsNew,
	$request: null, activeTab: 'performance', showIncomingRequests: true, defaultAppearance: 'light'
}

$platform.init(global)
$editorLinks.register()
$textFilters.register()

Vue.mixin({
	data: () => ({ global }),
	computed: Object.entries(global).reduce((result, [ key, value ]) => {
		result[key] = function () { return this.global[key] }
		return result
	}, {})
})

new Vue({
  render: h => h(App)
}).$mount('#app')
