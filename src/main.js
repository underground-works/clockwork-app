import createApp from './app'

import Extension from './platform/extension'
import Standalone from './platform/standalone'
import Share from './platform/share'

import Authentication from './features/authentication'
import Credits from './features/credits'
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

if (import.meta.env.VITE_PLATFORM == 'share') {
	$platform = new Share
} else {
	$platform = Extension.runningAsExtension() ? new Extension : new Standalone
}

import { shallowReactive } from 'vue'

let $store = shallowReactive(new LocalStore)
let $requests = shallowReactive(new Requests)
let $settings = shallowReactive(new Settings($store, $requests, $platform))

let $authentication = shallowReactive(new Authentication($requests))
let $credits = shallowReactive(new Credits($platform))
let $editorLinks = shallowReactive(new EditorLinks($settings))
let $onDemand = shallowReactive(new OnDemand($platform, $settings))
let $profiler = shallowReactive(new Profiler($requests, $platform))
let $requestsSearch = shallowReactive(new RequestsSearch($requests))
let $sharing = shallowReactive(new Sharing($platform, $settings))
let $textFilters = shallowReactive(new TextFilters)
let $updateNotification = shallowReactive(new UpdateNotification($settings))
let $whatsNew = shallowReactive(new WhatsNew($platform, $settings))

let global = {
	$requests, $platform, $authentication, $credits, $editorLinks, $onDemand, $profiler, $requestsSearch, $settings,
	$sharing, $textFilters, $store, $updateNotification, $whatsNew,
	$request: null, activeDetailsTab: 'performance', showIncomingRequests: true
}

$platform.init(global)
$onDemand.enableProfiling()

let app = createApp(global)

app.mount('#app')
