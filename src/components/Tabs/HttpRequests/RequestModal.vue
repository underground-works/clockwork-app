<template>
	<modal icon="compass" title="HTTP Request" v-model:shown="requestLocal">
        <div class="http-request-details" v-if="request">
            <div class="details-tabs">
                <a class="tabs-tab" :class="{ 'active': selectedTab == 'request' }" href="#" @click.prevent="selectedTab = 'request'">
                    Request
                    <span class="request-method" :class="`method-${request.request.method.toLowerCase()}`">{{request.request.method}}</span>
                </a>
                <a class="tabs-tab" :class="{ 'active': selectedTab == 'response', 'no-response': ! request.response }" href="#" @click.prevent="selectedTab = 'response'">
                    Response
                    <span v-if="request.response" class="response-status" :class="{ 'client-error': request.response?.status >= 400 && request.response?.status <= 499, 'server-error': request.response?.status >= 500 && request.response?.status <= 599 }">{{request.response.status}}</span>
                </a>
            </div>

            <div v-if="selectedTab == 'request'" class="details-request">
                <div class="request-info">
                    <div @click="showRequestHeaders = ! showRequestHeaders" class="info-header">
                        <div>
                            <span class="request-method" :class="`method-${request.request.method.toLowerCase()}`">{{request.request.method}}</span> <span class="request-scheme">{{request.request.url.scheme}}</span><span class="request-host">{{request.request.url.host}}</span><span class="request-path">{{request.request.url.path}}</span><span class="request-query">{{request.request.url.query}}</span>
                        </div>
                        <ui-icon :name="showRequestHeaders ? 'chevron-down' : 'chevron-up'"></ui-icon>
                    </div>

                    <div class="info-headers" v-if="showRequestHeaders">
                        <details-table :columns="['Key', 'Value']" :items="Object.entries(request.request.headers)" :no-header="true" :no-table-head="true">
                            <template v-slot:body="{ items }">
                                <tr v-for="[ header, value ] in items" :key="`${$request.id}-${header}`">
                                    <td colspan="2">
                                        <div class="key">{{header}}</div>
                                        <div class="value">{{value.join(', ')}}</div>
                                    </td>
                                </tr>
                            </template>
                        </details-table>
                    </div>
                </div>

                <div class="request-content">
                    <div class="request-content-header">
                        <div v-if="request.stats?.size.upload !== null && request.stats?.size.upload !== undefined" class="stats-item" title="Upload Size">
                            <ui-icon name="upload-cloud"></ui-icon>
                            {{formatBytesSize(request.stats.size.upload)}}
                        </div>
                        <div v-if="request.stats?.speed.upload !== null && request.stats?.speed.upload !== undefined" class="stats-item" title="Upload Speed">
                            <ui-icon name="zap"></ui-icon>
                            {{formatBytesSpeed(request.stats.speed.upload)}}
                        </div>
                        <div v-if="request.stats?.hosts.local" class="stats-item">
                            {{request.stats.hosts.local.ip}}:{{request.stats.hosts.local.port}}
                        </div>

                        <div class="header-actions">
                            <a v-if="hasRequestContent" @click.prevent="copyRequestContent" class="header-action" title="Copy to clipboard">
                                <ui-icon name="clipboard"></ui-icon>
                            </a>
                            <a v-if="request.request.body" @click="showRawRequestBody = ! showRawRequestBody" href="#" class="header-action" :class="{ 'active': showRawRequestBody }" title="Show raw request body">
                                Raw
                            </a>
                        </div>
                    </div>

                    <div class="request-content-content">
                        <div v-if="! hasRequestContent" class="request-content-empty">
                            No request body.
                        </div>

                        <pretty-print v-else-if="! showRawRequestBody" :data="request.request.content" :expanded="true"></pretty-print>

                        <code v-else v-html="request.request.body"></code>
                    </div>
                </div>
            </div>

            <div v-if="selectedTab == 'response'" class="details-response">
                <div v-if="request.response" class="response-info">
                    <div @click="showResponseHeaders = ! showResponseHeaders" class="info-header" :class="{ 'client-error': request.response.status >= 400 && request.response.status <= 499, 'server-error': request.response.status >= 500 && request.response.status <= 599 }">
                        <div class="header-status">
                            <span class="status-code">{{request.response.status}}</span>
                            <span class="status-message">
                                {{request.response.statusMessage}}
                            </span>
                        </div>
                        <span class="status-version" v-if="request.stats?.version">
                                HTTP{{request.stats.version}}
                        </span>
                        <ui-icon :name="showResponseHeaders ? 'chevron-down' : 'chevron-up'"></ui-icon>
                    </div>

                    <div class="info-headers" v-if="showResponseHeaders">
                        <details-table :columns="['Key', 'Value']" :items="Object.entries(request.response.headers)" :no-header="true" :no-table-head="true">
                            <template v-slot:body="{ items }">
                                <tr v-for="[ header, value ] in items" :key="`${$request.id}-${header}`">
                                    <td colspan="2">
                                        <div class="key">{{header}}</div>
                                        <div class="value">{{value.join(', ')}}</div>
                                    </td>
                                </tr>
                            </template>
                        </details-table>
                    </div>
                </div>

                <div v-if="request.response" class="response-content">
                    <div class="response-content-header">
                        <div v-if="request.stats?.size.download !== null && request.stats?.size.download !== undefined" class="stats-item" title="Download Size">
                            <ui-icon name="download-cloud"></ui-icon>
                            {{formatBytesSize(request.stats.size.download)}}
                        </div>
                        <div v-if="request.stats?.speed.download !== null && request.stats?.speed.download !== undefined" class="stats-item" title="Download Speed">
                            <ui-icon name="zap"></ui-icon>
                            {{formatBytesSpeed(request.stats.speed.download)}}
                        </div>
                        <div v-if="request.stats?.hosts.remote" class="stats-item">
                            {{request.stats.hosts.remote.ip}}:{{request.stats.hosts.remote.port}}
                        </div>

                        <div class="header-actions">
                            <a v-if="hasResponseContent" @click.prevent="copyResponseContent" class="header-action" title="Copy to clipboard">
                                <ui-icon name="clipboard"></ui-icon>
                            </a>
                            <a v-if="request.response.body && hasJsonResponse" @click="showRawResponseBody = ! showRawResponseBody" href="#" class="header-action" :class="{ 'active': showRawResponseBody }" title="Show raw response body">
                                Raw
                            </a>
                        </div>
                    </div>

                    <div class="response-content-content">
                        <div v-if="! hasResponseContent" class="response-content-empty">
                            No response body.
                        </div>

                        <pretty-print v-else-if="hasJsonResponse && ! showRawResponseBody" :data="request.response.content" :expanded="true"></pretty-print>

                        <code v-else-if="hasJsonResponse" v-html="request.response.body"></code>

                        <iframe v-else ref="responseContent" :srcdoc="request.response.body"></iframe>
                    </div>
                </div>

                <div v-if="! request.response" class="response-error">
                    <p>No response.</p>
                    <p v-if="request.error">({{request.error}})</p>
                </div>

                <div v-if="request.stats?.timing" class="request-performance">
                    <performance-chart :metrics="timings"></performance-chart>

                    <div class="performance-timings">
                        <div v-for="timing in timings" class="timings-timing">
                            <div class="timing-color" :class="timing.color"></div>
                    {{timing.name}}
                            <div class="timing-value" :title="`${timing.value} ms`">{{Math.round(timing.value)}} ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </modal>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'
import Modal from '../../UI/Modal'
import PerformanceChart from '../Performance/PerformanceChart'
import PrettyPrint from '../../UI/PrettyPrint'
import UiIcon from '../../UI/Icon'

export default {
    name: 'HttpRequestModal',
    components: { DetailsTable, Modal, PerformanceChart, PrettyPrint, UiIcon },
    props: [ 'request' ],
    data: () => ({
        selectedTab: 'request',
        showRequestHeaders: false,
        showResponseHeaders: false,
        showRawRequestBody: false,
        showRawResponseBody: false
    }),
    computed: {
        requestLocal: {
            get() { return this.request },
            set(val) { this.$emit('update:request', val) }
        },
        
        hasRequestContent() {
            return (this.request.request.content && Object.values(this.request.request.content).length) || this.request.request.body
        },

        hasResponseContent() {
            return (this.request.response?.content && Object.values(this.request.response?.content).length) || this.request.response?.body
        },

        hasJsonResponse() {
            return this.request.response?.content instanceof Object
        },

        copyRequestContent() {
            this.$copyText(this.request.request.body || JSON.stringify(this.request.request.content))
        },

        copyResponseContent() {
            this.$copyText(this.request.response.body || JSON.stringify(this.request.response.content))
        },

        timings() {
            return this.request.stats.timing ? [
                { name: 'Lookup', value: this.request.stats.timing.lookup, color: 'red' },
                { name: 'Connect', value: this.request.stats.timing.connect, color: 'purple' },
                { name: 'Waiting', value: this.request.stats.timing.waiting, color: 'blue' },
                { name: 'Transfer', value: this.request.stats.timing.transfer, color: 'green' }
            ] : []
        }
    },
    methods: {
        formatBytesSize(value) {
            if (! value) return '0 B'
            
            const units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB' ]
            const i = Math.floor(Math.log(value) / Math.log(1024))

            return `${Math.round(value / Math.pow(1024, i))} ${units[i]}`
        },
        
        formatBytesSpeed(value) {
            return `${this.formatBytesSize(value)}/s`
        }
    }
}
</script>

<style lang="scss">
@use '../../../mixins' as *;

.http-request-details {
    font-size: 13px;
    margin: 0 auto;
    max-width: 680px;
    width: 100vw;
    
    .details-tabs {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin: 10px 0 20px;

    	.tabs-tab {
    		align-items: center;
    	    border-radius: 6px;
    		color: rgb(64, 64, 64);
    		cursor: default;
            display: flex;
            font-size: 14px;
            padding: 6px 12px 6px 8px;
            text-align: center;
            text-decoration: none;

            @include dark {
                color: rgb(158, 158, 158);
            }

            &:hover {
                color: #258cdb;

                @include dark { color: #f27e02; }
            }

            &.active {
                background: rgb(39, 134, 243);
                color: #f5f5f5;

                @include dark {
                    background: hsl(31deg 98% 42%);
                    color: #fff;
                }
            }

            &.no-response {
                padding-left: 12px;
            }

            .ui-icon {
                margin-right: 5px;
            }

            .request-method {
                border-radius: 8px;
                font-size: 12px;
                margin-left: 6px;
                padding: 2px 6px;
                text-transform: uppercase;

                &.method-get, &.method-head {
                    color: #586336;
                    background: hsl(76deg 47% 86%);
                    @include dark {
                        background: hsl(76deg 100% 11%);
                        color: hsl(75deg 90% 80%);
                    }
                }

                &.method-post, &.method-put, &.method-patch {
                    background: hsl(206deg 47% 86%);
                    color: hsl(205deg 29% 30%);
                    @include dark {
                        background: hsl(206deg 100% 16%);
                        color: hsl(205deg 90% 70%);
                    }
                }

                &.method-delete {
                    color: #c51f24;
                    background: #ffebeb;
                    @include dark {
                        color: #ed797a;
                        background: #380000;
                    }
                }
            }

            .response-status {
                background: hsl(76deg 47% 86%);
                border-radius: 8px;
                color: #586336;
                font-size: 12px;
                margin-left: 6px;
                padding: 2px 6px;
                text-transform: uppercase;

                @include dark {
                    background: hsl(76deg 100% 11%);
                    color: hsl(75deg 90% 80%);
                }

                &.client-error {
                    color: #a85919;
                    background: #fffae2;

                    @include dark {
                        color: #fad89f;
                        background: #382f00;
                    }
                }

                &.server-error {
                    color: #c51f24;
                    background: #ffebeb;

                    @include dark {
                        color: #ed797a;
                        background: #380000;
                    }
                }
            }
        }
    }
    
    .request-info, .response-info, .request-content, .response-content, .response-error {
        background: hsl(240deg 20% 99%);
        border: 1px solid hsl(240deg 20% 90%);
        border-radius: 8px;
        box-shadow: 0 2px 2px 0 hsl(240deg 20% 95%);
        padding: 10px;
    }
    
    .request-content, .response-content {
        margin-top: 16px;
        
        .request-content-header, .response-content-header {
            align-items: center;
            display: flex;
            margin-bottom: 10px;

            .stats-item {
                background: hsl(240deg 20% 96%);
                border-radius: 8px;
                color: grey;
                font-size: 12px;
                margin-right: 5px;
                padding: 4px 8px;

                @include dark {
                    background: hsl(240deg 2% 13%);
                    color: rgb(118, 118, 118);
                }

                .ui-icon {
                    margin-right: 2px;
                }
            }

            .header-actions {
                align-items: center;
                display: flex;
                margin-left: auto;
            }

            .header-action {
                align-items: center;
                border-radius: 4px;
                display: flex;
                font-size: 12px;
                height: 24px;
                justify-content: center;
                margin-left: auto;
                padding: 0 8px;
                text-decoration: none;

                @include dark {
                    color: rgb(158, 158, 158);
                }

                &:hover {
                    color: rgb(37, 140, 219);

                    @include dark {
                        color: hsl(31deg 98% 42%);
                    }
                }

                &.active {
                    background: rgb(39, 134, 243);
                    color: #f5f5f5;

                    @include dark {
                        background: hsl(31deg 98% 42%);
                        color: #fff;
                    }
                }
            }
        }

        .request-content-empty, .response-content-empty {
            color: gray;
            padding: 20px 0;
            text-align: center;

            @include dark {
                color: rgb(118, 118, 118);
            }
        }
        
        .request-content-content, .response-content-content {
            padding: 8px 4px;
            
            code {
                font-size: 12px;
            }
            
            iframe {
                border: 1px solid hsl(240deg 20% 90%);
                border-radius: 8px;
                min-height: 30vh;
                width: 100%;
            }
        }
    }
    
    .details-request {
        flex: 1;

        @include dark {
            background: hsl(240deg 2% 15%);
            box-shadow: 0 0 0px 1px #15151e, 0 2px 2px 0 #15151e;
        }
        
        .info-header {
            font-size: 15px;

            .request-method {
                color: grey;
                font-weight: 500;

                @include dark {
                    color: rgb(118, 118, 118);
                }
                
                &.method-get, &.method-head {
                    color: hsl(109deg 52% 45%);
                    @include dark { color: hsl(109deg 47% 50%); }
                }
                
                &.method-post, &.method-put, &.method-patch {
                    color: hsl(212deg 89% 55%);
                    @include dark { color: hsl(212deg 83% 60%); }
                }

                &.method-delete {
                    color: hsl(359deg 57% 55%);
                    @include dark { color: hsl(359deg 52% 60%); }
                }
            }

            .request-host { font-weight: 600; }
            .request-query { color: grey; }
        }
    }

    .details-response {
        flex: 1;
        
        @include dark {
            background: hsl(240deg 2% 15%);
            box-shadow: 0 0 0px 1px #15151e, 0 2px 2px 0 #15151e;
        }
        
        .info-header {
            &.client-error {
                .header-status {
                    color: #a85919;
                    .status-code { background: #fffae2; }

                    @include dark {
                        color: #fad89f;
                        .status-code { background: #382f00; }
                    }
                }
            }

            &.server-error {
                .header-status {
                    color: #c51f24;
                    .status-code { background: #ffebeb; }

                    @include dark {
                        color: #ed797a;
                        .status-code { background: #380000; }
                    }
                }
            }
        }
        
        .header-status {
            color: #586336;
            flex: 1;
            font-size: 14px;
            
            @include dark {
                color: hsl(75deg 90% 80%);
            }
            
            .status-code {
                background: hsl(76deg 47% 86%);
                border-radius: 8px;
                padding: 2px 6px;
                text-transform: uppercase;

                @include dark {
                    background: hsl(76deg 100% 11%);
                }
            }
            
            .status-message {
                margin-left: 5px;
            }
        }
        
        .status-version {
            color: grey;
            font-size: 12px;
            margin-right: 5px;
            
            @include dark {
                color: rgb(118, 118, 118);
            }
        }
    }
    
    .info-header {
        align-items: center;
        cursor: pointer;
        display: flex;
        padding: 4px;
        
        .ui-icon {
            flex-shrink: 0;
            margin-left: auto;
        }
    }
    
    .info-headers {
        margin-top: 5px;
        
        .details-table {
            border-radius: 0;
            box-shadow: none;
            margin-bottom: 0;
            padding-bottom: 0;

            @include dark {
                box-shadow: none;
            }

            td {
                border-radius: 5px;
                vertical-align: top;

                .key {
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 3px;
                    white-space: nowrap;
                }

                .value {
                    word-break: break-all;
                }
            }
        }
    }
    
    .request-performance {
        margin-top: 25px;
        
        .performance-chart {
            margin-bottom: 10px;
        }
        
        .performance-timings {
            display: flex;
            gap: 12px;
            
            .timings-timing {
                align-items: center;
                color: gray;
                display: flex;
                gap: 5px;
                
                @include dark {
                    color: rgb(118, 118, 118);
                }
                
                .timing-color {
                    border-radius: 50%;
                    height: 10px;
                    width: 10px;
                    
                    &.blue {
                        background-color: hsl(212deg 89% 55%);
                        @include dark { background-color: hsl(212deg 76% 60%); }
                    }

                    &.red {
                        background-color: hsl(359deg 57% 55%);
                        @include dark { background-color: hsl(359deg 45% 60%); }
                    }

                    &.green {
                        background-color: hsl(109deg 52% 45%);
                        @include dark { background-color: hsl(109deg 40% 50%); }
                    }

                    &.purple {
                        background-color: hsl(273deg 57% 55%);
                        @include dark { background-color: hsl(273deg 45% 60%); }
                    }
                }
                
                .timing-value {
                    font-weight: 600;
                }
            }
        }
    }
    
    .response-error {
        align-items: center;
        color: gray;
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        
        @include dark {
            color: rgb(118, 118, 118);
        }
    }
}
</style>
