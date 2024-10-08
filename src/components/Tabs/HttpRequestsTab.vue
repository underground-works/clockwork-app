<template>
	<div v-show="active">
		<details-table title="HTTP Requests" icon="compass" :columns="[ 'Request', 'Status', 'Duration', '' ]" :items="$request.httpRequests" :filter="filter" filter-example="&quot;/users&quot; method:post" class="http-requests-requests">
			<template v-slot:body="{ items }">
				<template v-for="request, index in items" :key="`${$request.id}-http-requests-${index}`">
					<tr>
						<td class="request-request">
							<div class="request-content">
								<div class="content-text">
									<span class="text-method" :class="`method-${request.request.method.toLowerCase()}`">{{request.request.method}}</span> <span class="text-scheme">{{request.request.url.scheme}}</span><span class="text-host">{{request.request.url.host}}</span><span class="text-path">{{request.request.url.path}}</span><span class="text-query">{{request.request.url.query}}</span>
								</div>
	                            <stack-trace class="content-trace" :trace="request.trace"></stack-trace>
							</div>
                        </td>
						<td class="request-status">
							<span :class="{ 'status-text': request.response?.status, 'client-error': request.response?.status >= 400 && request.response?.status <= 499, 'server-error': request.response?.status >= 500 && request.response?.status <= 599 }">{{request.response?.status || '—'}}</span>
						</td>
						<td class="request-duration">
							{{request.duration ? `${$round(request.duration, 1)} ms` : '—'}}
						</td>
						<td class="request-actions">
							<a href="#" @click.prevent="showRequest = request" title="Show request">
								<icon name="search"></icon>
							</a>
						</td>
					</tr>
				</template>
			</template>
		</details-table>

		<request-modal v-model:request="showRequest"></request-modal>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import RequestModal from './HttpRequests/RequestModal'
import PrettyPrint from '../UI/PrettyPrint'
import StackTrace from '../UI/StackTrace'

import createFilter from '../../features/filter'

export default {
	name: 'httpRequestsTab',
	components: { DetailsTable, PrettyPrint, RequestModal, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: createFilter([
			{ tag: 'to' }
		]),

		showRequest: null
	})
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.http-requests-requests {
	.request-request {
		width: 100%;

		.request-content {
			display: flex;
			flex-wrap: wrap;
			width: 100%;
			
			.content-text {
				font-size: 13px;
				
				.text-method {
					color: grey;
					font-weight: 500;
					
					@include dark {
						color: rgb(118, 118, 118);
					}
					
					&.method-get, &.method-head {
						color: hsl(109, 52%, 45%);
						@include dark { color: hsl(109, 47%, 50%); }
					}

					&.method-post, &.method-put, &.method-patch {
						color: hsl(212, 89%, 55%);
						@include dark { color: hsl(212, 83%, 60%); }
					}

					&.method-delete {
						color: hsl(359, 57%, 55%);
						@include dark { color: hsl(359, 52%, 60%); }
					}
				}
				
				.text-host { font-weight: 500; }
				.text-query { color: grey; }
			}

			.content-trace {
				margin-left: auto;
			}
		}
	}
	
	.request-duration {
		text-align: right;
		white-space: nowrap;
	}

	.request-status {
		text-align: center;
		
		.status-text {
			background: hsl(76, 47%, 86%);
			border-radius: 8px;
			color: #586336;
			font-size: 11px;
			padding: 2px 6px;
			text-transform: uppercase;
			
			@include dark {
				background: hsla(76, 100%, 11%, 1);
				color: hsla(75, 90%, 80%, 1);
			}

			&.client-error {
				background: #fffae2;
				color: #a85919;

				@include dark {
					background: #382f00;
					color: #fad89f;
				}
			}

			&.server-error {
				background: #ffebeb;
				color: #c51f24;

				@include dark {
					background: #380000;
					color: #ed797a;
				}
			}
		}
	}
	
	.request-actions {
		white-space: nowrap;

		a {
			margin-left: 5px;
		}
	}
}
</style>
