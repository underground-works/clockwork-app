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

let $store = new LocalStore
let $requests = new Requests
let $settings = new Settings($store, $requests, $platform)

let $authentication = new Authentication($requests)
let $credits = new Credits($platform)
let $editorLinks = new EditorLinks($settings)
let $onDemand = new OnDemand($platform, $settings)
let $profiler = new Profiler($requests, $platform)
let $requestsSearch = new RequestsSearch($requests)
let $sharing = new Sharing($platform, $settings)
let $textFilters = new TextFilters
let $updateNotification = new UpdateNotification($settings)
let $whatsNew = new WhatsNew($platform, $settings)

let global = {
	$requests, $platform, $authentication, $credits, $editorLinks, $onDemand, $profiler, $requestsSearch, $settings,
	$sharing, $textFilters, $store, $updateNotification, $whatsNew,
	$request: null, activeDetailsTab: 'performance', showIncomingRequests: true
}

$platform.init(global)
$onDemand.enableProfiling()

let app = createApp(global)

app.mount('#app')
