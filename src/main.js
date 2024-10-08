import createApp from './app'

import Extension from './platform/extension'
import Standalone from './platform/standalone'
import Share from './platform/share'

import createAuthentication from './features/authentication'
import createCredits from './features/credits'
import createEditorLinks from './features/editor-links'
import createLocalStore from './features/local-store'
import createOnDemand from './features/on-demand'
import createProfiler from './features/profiler'
import createRequests from './features/requests'
import createRequestsSearch from './features/requests-search'
import createSettings from './features/settings'
import createSharing from './features/sharing'
import createTextFilters from './features/text-filters'
import createUpdateNotification from './features/update-notification'
import createWhatsNew from './features/whats-new'

let $platform

if (import.meta.env.VITE_PLATFORM == 'share') {
	$platform = new Share
} else {
	$platform = Extension.runningAsExtension() ? new Extension : new Standalone
}

let $store = createLocalStore()
let $requests = createRequests()
let $settings = createSettings($store, $requests, $platform)

let $authentication = createAuthentication($requests)
let $credits = createCredits($platform)
let $editorLinks = createEditorLinks($settings)
let $onDemand = createOnDemand($platform, $settings)
let $profiler = createProfiler($requests, $platform)
let $requestsSearch = createRequestsSearch($requests)
let $sharing = createSharing($platform, $settings)
let $textFilters = createTextFilters()
let $updateNotification = createUpdateNotification($settings)
let $whatsNew = createWhatsNew($platform, $settings)

let global = {
	$requests, $platform, $authentication, $credits, $editorLinks, $onDemand, $profiler, $requestsSearch, $settings,
	$sharing, $textFilters, $store, $updateNotification, $whatsNew,
	$request: null, activeDetailsTab: 'performance', showIncomingRequests: true
}

$platform.init(global)
$onDemand.enableProfiling()

let app = createApp(global)

app.mount('#app')
