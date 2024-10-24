<template>
	<div>
		<details-table title="Profiler" icon="clock" :columns="['Self', 'Inclusive', 'Function']" :items="$profiler.functions" :filter="filter" :per-page="100" class="profiler">
			<template v-slot:toolbar="{ filter }">
				<div class="header-group">
					<label class="header-toggle">
						<input type="checkbox" v-model="enabled">
						Enabled
					</label>
				</div>

				<div class="header-group">
					<a href="#" @click.prevent.stop="$profiler.showPercentual(false)" class="header-item item-text" :class="{ 'active': ! $profiler.percentual }" title="Exact">
						<span v-if="$profiler.metric == 0">ms</span>
						<span v-if="$profiler.metric == 1">kB</span>
					</a>
					<a href="#" @click.prevent.stop="$profiler.showPercentual()" class="header-item" :class="{ 'active': $profiler.percentual }" title="Percentual">
						<icon name="percent"></icon>
					</a>
				</div>

				<div class="header-group">
					<a href="#" @click.prevent.stop="$profiler.setShownFraction(0.5)" class="header-item item-text" :class="{ 'active': $profiler.shownFraction == 0.5 }">
						50%
					</a>
					<a href="#" @click.prevent.stop="$profiler.setShownFraction(0.9)" class="header-item item-text" :class="{ 'active': $profiler.shownFraction == 0.9 }">
						90%
					</a>
					<a href="#" @click.prevent.stop="$profiler.setShownFraction(1)" class="header-item item-text" :class="{ 'active': $profiler.shownFraction == 1 }">
						100%
					</a>
				</div>

				<div class="header-group">
					<div class="header-search">
						<input type="search" v-model="filter.input" placeholder="Search...">
						<icon name="search"></icon>
					</div>
				</div>
			</template>
			<template v-slot:body="{ items }">
				<tr v-for="item, index in filterXdebug(items)" :key="`${$request.id}-${index}`" v-if="$profiler.ready">
					<td class="profiler-metric">{{$profiler.formatMetric(item.self)}}</td>
					<td class="profiler-metric">{{$profiler.formatMetric(item.inclusive)}}</td>
					<td class="profiler-function">
						<div class="profiler-function-name">
							{{item.name}}
						</div>
						<div class="profiler-path">
							<shortened-text :full="item.fullPath">{{item.shortPath}}</shortened-text>
						</div>
					</td>
				</tr>

				<tr v-if="$profiler.loading || $profiler.parsing">
					<td colspan="3">
						<div class="profiler-content">
							<spinner name="fading-circle" :no-fade-in="true" :color="$settings.appearance == 'dark' ? '#f27e02' : '#258cdb'"></spinner>

							<p>
								{{$profiler.loading ? 'Loading profile...' : 'Processing profile...'}}
							</p>
						</div>
					</td>
				</tr>

				<tr v-if="$profiler.invalid">
					<td colspan="3">
						<div class="profiler-content">
							<h1>
								Profile contains invalid data.
							</h1>

							<p>
								This is usually caused by a misconfigured Xdebug php extension.<br>
								<a href="https://underground.works/clockwork/#docs-xdebug-profiler" target="_blank">Read more about how to set up Xdebug</a>
							</p>
						</div>
					</td>
				</tr>

				<tr v-if="! $profiler.available">
					<td colspan="3">
						<div class="profiler-content">
							<h1>
								Profile is not present for current request.
							</h1>

							<p>
								Profiling requires the Xdebug php extension.<br>
								<a href="https://underground.works/clockwork/#docs-xdebug-profiler" target="_blank">Read more about how to set up Xdebug</a>
							</p>

							<p class="content-actions">
								<a href="#" class="button" @click="$profiler.enableProfiling()" v-if="! $profiler.isProfiling">
									Enable profiler
								</a>
								<a href="#" class="button" @click="$profiler.disableProfiling()" v-if="$profiler.isProfiling">
									Disable profiler
								</a>
							</p>
						</div>
					</td>
				</tr>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../../UI/DetailsTable'
import ShortenedText from '../../UI/ShortenedText'

import createFilter from '../../../features/filter'

export default {
	name: 'Profiler',
	components: { DetailsTable, ShortenedText },
	data: () => ({
		filter: (() => {
			let filter = createFilter([
				{ tag: 'model' },
				{ tag: 'file', map: item => item.shortPath },
				{ tag: 'self', type: 'number' },
				{ tag: 'inclusive', type: 'number' }
			], item => item.name)
			filter.sortedBy = 'self'
			filter.sortedDesc = true

			return filter
		})()
	}),
	computed: {
		enabled: {
			get() { return this.$profiler.isProfiling },
			set(val) { val ? this.$profiler.enableProfiling() : this.$profiler.disableProfiling() }
		}
	},
	methods: {
		filterXdebug(xdebug) { return xdebug ? this.filter.filter(xdebug) : [] }
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

.profiler {
	.profiler-metric {
		white-space: nowrap;
	}

	.profiler-function {
		display: flex;
		flex-wrap: wrap;

		.profiler-function-name {
			flex: 1 1 auto;
			word-break: break-all;
		}

		.profiler-path {
			color: #aaa;
			flex: 0;
			font-size: 90%;
			margin-top: 3px;
		}
	}

	.profiler-content {
		align-items: center;
		display: flex;
		flex-direction: column;
		font-size: 14px;
		padding: 80px 0;
		text-align: center;
		width: 100%;

		h1 {
			font-size: 110%;
		}
	}
}
</style>
