import App from './App.vue'
import Vue from 'vue'

import './vendor'
import './fonts'
// import './registerServiceWorker'

import Extension from './platform/extension'
import Standalone from './platform/standalone'

import Authentication from './features/authentication'
import EditorLinks from './features/editor-links'
import Profiler from './features/profiler'
import Requests from './features/requests'
import Settings from './features/settings'
import UpdateNotification from './features/update-notification'

let $requests = new Requests
let $settings = new Settings($requests)

let $platform = Extension.runningAsExtension() ? new Extension : new Standalone

let $authentication = new Authentication($requests)
let $editorLinks = new EditorLinks($settings)
let $profiler = new Profiler($requests, $platform)
let $updateNotification = new UpdateNotification

let global = {
	$requests, $platform, $authentication, $profiler, $settings, $updateNotification, $request: null,
	preserveLog: true, requestsListCollapsed: false, showIncomingRequests: true
}

$platform.init(global)
$editorLinks.register()

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
