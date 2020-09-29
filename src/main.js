import App from './App.vue'
import Vue from 'vue'

import './vendor'
// import './registerServiceWorker'

import Extension from './platform/extension'
import Standalone from './platform/standalone'
import Share from './platform/share'

import Authentication from './features/authentication'
import EditorLinks from './features/editor-links'
import LocalStore from './features/local-store'
import OnDemand from './features/on-demand'
import Profiler from './features/profiler'
import Requests from './features/requests'
import RequestsSearch from './features/requests-search'
import Settings from './features/settings'
import Sharing from './features/sharing'
import TextFilters from './features/text-filters'
import UpdateNotification from './features/update-notification'
import WhatsNew from './features/whats-new'

let $platform

if (process.env.VUE_APP_PLATFORM == 'share') {
	$platform = new Share
} else {
	$platform = Extension.runningAsExtension() ? new Extension : new Standalone
}

let $store = new LocalStore
let $requests = new Requests
let $settings = new Settings($store, $requests, $platform)

let $authentication = new Authentication($requests)
let $editorLinks = new EditorLinks($settings)
let $onDemand = new OnDemand($platform, $settings)
let $profiler = new Profiler($requests, $platform)
let $requestsSearch = new RequestsSearch($requests)
let $sharing = new Sharing($platform, $settings)
let $textFilters = new TextFilters
let $updateNotification = new UpdateNotification($settings)
let $whatsNew = new WhatsNew($platform, $settings)

let global = {
	$requests, $platform, $authentication, $onDemand, $profiler, $requestsSearch, $settings, $sharing, $store,
	$updateNotification, $whatsNew,
	$request: null, activeDetailsTab: 'performance', showIncomingRequests: true
}

$platform.init(global)
$editorLinks.register()
$onDemand.enableProfiling()
$textFilters.register()

Vue.mixin({
	data: () => ({ global }),
	computed: Object.entries(global).reduce((result, [ key, value ]) => {
		result[key] = function () { return this.global[key] }
		return result
	}, {})
})

import Icon from './components/UI/Icon'

Vue.component('icon', Icon)

new Vue({
  render: h => h(App)
}).$mount('#app')
