<template>
	<div v-if="active">
		<div class="counters-row models-counters">
			<div class="counter counter-retrieved" v-if="totals.retrieved">
				<div class="counter-value">{{totals.retrieved}}</div>
				<div class="counter-title has-mark">retrieved</div>
			</div>
			<div class="counter counter-created" v-if="totals.created">
				<div class="counter-value">{{totals.created}}</div>
				<div class="counter-title has-mark">created</div>
			</div>
			<div class="counter counter-updated" v-if="totals.updated">
				<div class="counter-value">{{totals.updated}}</div>
				<div class="counter-title has-mark">updated</div>
			</div>
			<div class="counter counter-deleted" v-if="totals.deleted">
				<div class="counter-value">{{totals.deleted}}</div>
				<div class="counter-title has-mark">deleted</div>
			</div>
		</div>

		<div class="models-tabs" v-if="$request.modelsActions.length">
			<a class="models-tab" :class="{ 'active': activeModelsTab == 'actions' }" href="#" @click.prevent="selectedModelsTab = 'actions'">
				<icon name="activity"></icon> Actions
			</a>
			<a class="models-tab" :class="{ 'active': activeModelsTab == 'models' }" href="#" @click.prevent="selectedModelsTab = 'models'">
				<icon name="hash"></icon> Models
			</a>
		</div>

		<details-table title="Actions" icon="activity" class="models-actions" :columns="[ 'Model', '', '' ]" :items="$request.modelsActions" :filter="actionsFilter" filter-example="App\User action:updated" v-if="activeModelsTab == 'actions'" :key="renderTrigger">
			<template v-slot:body="{ items }">
				<template v-for="action, index in items" :key="`${$request.id}-models-actions-${index}`">
					<tr class="actions-action">
						<td class="action-model">
							<div class="model-content">
								<div class="content-text">
									<shortened-text :full="action.model">{{action.shortModel}}</shortened-text>
									<span class="action-key" v-if="action.key">
										<span class="key-hash">#</span>{{action.key}}
									</span>
								</div>

								<stack-trace class="content-trace" :trace="action.trace" :file="action.file" :line="action.line"></stack-trace>
							</div>
						</td>
						<td class="database-duration">
							<span class="action-action" :class="`action-${action.action}`">{{action.action}}</span>
						</td>
						<td>
							<a href="#" @click.prevent="action.isShowingDetails = ! action.isShowingDetails; renderTrigger++" title="Show details" v-if="action.attributes || action.changes">
								<icon :name="action.isShowingDetails ? 'chevron-up' : 'chevron-down'"></icon>
							</a>
						</td>
					</tr>

					<tr class="actions-details" v-show="action.isShowingDetails">
						<td colspan="3">
							<div class="details-row" v-if="action.attributes">
								<div class="row-group">
									<h4>Attributes</h4>
									<pretty-print :data="action.attributes"></pretty-print>
								</div>
							</div>
							<div class="details-row" v-if="action.changes">
								<div class="row-group">
									<h4>Changes</h4>
									<pretty-print :data="action.changes"></pretty-print>
								</div>
							</div>
							<div class="details-row" v-if="action.query">
								<div class="row-group group-query" v-if="action.query">
									<h4>Query</h4>
									<highlighted-code language="sql" :code="action.query"></highlighted-code>
								</div>
								<div class="row-group" v-if="action.duration">
									<h4>Duration</h4>
									<span>{{$round(action.duration, 3)}} ms</span>
								</div>
								<div class="row-group" v-if="action.connection">
									<h4>Connection</h4>
									<span>{{action.connection}}</span>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</template>
		</details-table>

		<details-table title="Models" icon="hash" class="models-counts" :columns="[ 'Model', 'Retrieved', 'Created', 'Updated', 'Deleted' ]" :items="modelsCounts" :filter="countsFilter" filter-example="App\User retrieved:>10" v-if="activeModelsTab == 'models'">
			<template v-slot:body="{ items }">
				<template v-for="counts, index in items" :key="`${$request.id}-models-counts-${index}`">
					<tr>
						<td class="counts-model">
							<shortened-text :full="counts.model">{{counts.shortModel}}</shortened-text>
						</td>
						<td class="counts-count">
							<span class="count-text count-retrieved" v-if="counts.retrieved">{{counts.retrieved}}</span>
							<span v-else>-</span>
						</td>
						<td class="counts-count">
							<span class="count-text count-created" v-if="counts.created">{{counts.created}}</span>
							<span v-else>-</span>
						</td>
						<td class="counts-count">
							<span class="count-text count-updated" v-if="counts.updated">{{counts.updated}}</span>
							<span v-else>-</span>
						</td>
						<td class="counts-count">
							<span class="count-text count-deleted" v-if="counts.deleted">{{counts.deleted}}</span>
							<span v-else>-</span>
						</td>
					</tr>
				</template>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import HighlightedCode from '../UI/HighlightedCode'
import PrettyPrint from '../UI/PrettyPrint'
import ShortenedText from '../UI/ShortenedText'
import StackTrace from '../UI/StackTrace'

import createFilter from '../../features/filter'

export default {
	name: 'ModelsTab',
	components: { DetailsTable, HighlightedCode, PrettyPrint, ShortenedText, StackTrace },
	props: [ 'active' ],
	data: () => ({
		selectedModelsTab: 'actions',

		actionsFilter: createFilter([
			{ tag: 'model' },
			{ tag: 'action' },
			{ tag: 'file', map: item => item.shortPath }
		]),

		countsFilter: createFilter([
			{ tag: 'model' },
			{ tag: 'retrieved', type: 'number' },
			{ tag: 'created', type: 'number' },
			{ tag: 'updated', type: 'number' },
			{ tag: 'deleted', type: 'number' }
		]),

		renderTrigger: 0
	}),
	computed: {
		totals() {
			return {
				retrieved: Object.values(this.$request.modelsRetrieved).reduce((sum, count) => sum + count, 0),
				created: Object.values(this.$request.modelsCreated).reduce((sum, count) => sum + count, 0),
				updated: Object.values(this.$request.modelsUpdated).reduce((sum, count) => sum + count, 0),
				deleted: Object.values(this.$request.modelsDeleted).reduce((sum, count) => sum + count, 0)
			}
		},

		activeModelsTab() {
			return this.selectedModelsTab == 'actions' && ! this.$request.modelsActions.length
				? 'models' : this.selectedModelsTab
		},

		modelsCounts() {
			let models = new Set([
				...Object.keys(this.$request.modelsRetrieved),
				...Object.keys(this.$request.modelsCreated),
				...Object.keys(this.$request.modelsUpdated),
				...Object.keys(this.$request.modelsDeleted)
			])

			return Array.from(models).map(model => ({
				model,
				shortModel: model.split('\\').pop(),
				retrieved: this.$request.modelsRetrieved[model],
				created: this.$request.modelsCreated[model],
				updated: this.$request.modelsUpdated[model],
				deleted: this.$request.modelsDeleted[model]
			}))
		}
	},
	methods: {
		isTabActive(tab) {
			if (tab == '')

			return this.selectedModelsTab == tab
		},

		showTab(tab) { this.selectedModelsTab = tab }
	}
}
</script>

<style lang="scss">
@use '../../mixins' as *;

.models-counters {
	.counter-retrieved .has-mark:before {
		background: rgb(120, 177, 222);

		@include dark {
			background: rgb(100, 157, 202);
		}
	}

	.counter-created .has-mark:before {
		background: rgb(177, 202, 109);

		@include dark {
			background: rgb(157, 182, 89);
		}
	}

	.counter-updated .has-mark:before {
		background: hsl(50deg 57% 61%);

		@include dark {
			background: hsl(27deg 39% 53%);
		}
	}

	.counter-deleted .has-mark:before {
		background: rgb(231, 150, 151);

		@include dark {
			background: rgb(211, 130, 131);
		}
	}
}

.models-tabs {
	display: flex;
	flex: 1;
	justify-content: center;
	margin-bottom: 10px;
	margin-top: 30px;

	.models-tab {
		align-items: center;
	    border-radius: 12px;
		color: rgb(64, 64, 64);
		cursor: default;
		display: flex;
		font-size: 12px;
		line-height: 26px;
		padding: 0 26px;
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

		.ui-icon {
		    margin-right: 5px;
		}
	}
}

.models-actions {
	.actions-action {
		.action-model {
			width: 100%;

			.model-content {
				display: flex;
				flex-wrap: wrap;
				width: 100%;

				.content-trace {
					margin-left: auto;
				}
			}
		}

		.action-key {
			color: rgb(128, 128, 128);
			font-size: 11px;

			@include dark {
				color: rgb(118, 118, 118);
			}

			.key-hash {
				margin: 0 1px 0 2px;
			}
		}

		.action-action {
			background: hsl(206deg 47% 86%);
			border-radius: 8px;
			color: hsl(205deg 29% 30%);
			font-size: 10px;
			padding: 3px 8px;
			text-transform: uppercase;

			@include dark {
				background: hsl(206deg 100% 16%);
				color: hsl(205deg 90% 70%);
			}

			&.action-created {
				background: hsl(76deg 47% 86%);
				color: #586336;

				@include dark {
					background: hsl(76deg 100% 11%);
					color: hsl(75deg 90% 80%);
				}
			}

			&.action-updated {
				background: #fffae2;
				color: #a85919;

				@include dark {
					background: #382f00;
					color: #fad89f;
				}
			}

			&.action-deleted {
				background: #ffebeb;
				color: #c51f24;

				@include dark {
					background: #380000;
					color: #ed797a;
				}
			}
		}
	}

	.actions-details {
		td {
			padding: 0 20px 10px !important;
		}

		h4 {
			color: #333;
			font-size: 90%;
			font-weight: 600;
			margin: 0 0 3px;

			@include dark {
				color: #b2b2b2;
			}
		}

		.details-row {
			display: flex;
			margin-top: 12px;

			&:first-child {
				margin-top: 6px;
			}

			.row-group {
				margin-right: 15px;

				&:last-child { margin-right: 0; }

				&.group-query {
					flex: 1;
				}
			}
		}
	}

	tr {
		background: hsl(240deg 20% 99%) !important;
		@include dark { background: hsl(240deg 2% 15%) !important; }

		&:nth-child(4n), &:nth-child(4n-1) {
			background: hsl(240deg 20% 96%) !important;
			@include dark { background: hsl(240deg 2% 13%) !important; }
		}
	}
}

.models-counts {
	.counts-model {
		width: 100%;
	}

	.counts-count {
		text-align: center;
	}

	.count-text {
		background: hsl(206deg 47% 86%);
		border-radius: 8px;
		color: hsl(205deg 29% 30%);
		font-size: 11px;
		padding: 3px 8px;
		text-transform: uppercase;

		@include dark {
			background: hsl(206deg 100% 16%);
			color: hsl(205deg 90% 70%);
		}

		&.count-created {
			background: hsl(76deg 47% 86%);
			color: #586336;

			@include dark {
				background: hsl(76deg 100% 11%);
				color: hsl(75deg 90% 80%);
			}
		}

		&.count-updated {
			background: #fffae2;
			color: #a85919;

			@include dark {
				background: #382f00;
				color: #fad89f;
			}
		}

		&.count-deleted {
			background: #ffebeb;
			color: #c51f24;

			@include dark {
				background: #380000;
				color: #ed797a;
			}
		}
	}
}
</style>
