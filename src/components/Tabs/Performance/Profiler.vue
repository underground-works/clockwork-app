<template>
	<div>

		<table class="profiler" v-if="$profiler.ready">
			<thead>
				<tr>
					<th @click="filter.sortBy(`self[${$profiler.metric}]`)">
						Self
						<icon v-show="filter.sortedBy == `self[${$profiler.metric}]`" :name="filter.sortedDesc ? 'chevron-down' : 'chevron-up'"></icon>
					</th>
					<th @click="filter.sortBy(`inclusive[${$profiler.metric}]`)">
						Inclusive
						<icon v-show="filter.sortedBy == `inclusive[${$profiler.metric}]`" :name="filter.sortedDesc ? 'chevron-down' : 'chevron-up'"></icon>
					</th>
					<th @click="filter.sortBy('function')">
						Function
						<icon v-show="filter.sortedBy == 'function'" :name="filter.sortedDesc ? 'chevron-down' : 'chevron-up'"></icon>
						<div class="profiler-controls">
							<span class="profiler-control-group">
								<a href="#" class="toggle-filter" @click.prevent.stop="filter.toggle()">
									<icon name="search"></icon>
								</a>
							</span>
							<span class="profiler-control-group profiler-show-metric">
								<a href="#" @click.prevent.stop="$profiler.showMetric(0)" :class="{ 'active': $profiler.metric == 0 }" title="Execution time">
									<icon name="clock"></icon>
								</a>
								<a href="#" @click.prevent.stop="$profiler.showMetric(1)" :class="{ 'active': $profiler.metric == 1 }" title="Memory usage">
									<icon name="cpu"></icon>
								</a>
							</span>
							<span class="profiler-control-group">
								<a href="#" @click.prevent.stop="$profiler.showPercentual(false)" :class="{ 'active': ! $profiler.percentual }" title="Exact">
									<span v-if="$profiler.metric == 0">ms</span>
									<span v-if="$profiler.metric == 1">kB</span>
								</a>
								<a href="#" @click.prevent.stop="$profiler.showPercentual()" :class="{ 'active': $profiler.percentual }" title="Percentual">
									<icon name="percent"></icon>
								</a>
							</span>
							<span class="profiler-control-group profiler-shown-fraction">
								<a href="#" @click.prevent.stop="$profiler.setShownFraction(1)" :class="{ 'active': $profiler.shownFraction == 1 }">
									100%
								</a>
								<a href="#" @click.prevent.stop="$profiler.setShownFraction(0.9)" :class="{ 'active': $profiler.shownFraction == 0.9 }">
									90%
								</a>
								<a href="#" @click.prevent.stop="$profiler.setShownFraction(0.5)" :class="{ 'active': $profiler.shownFraction == 0.5 }">
									50%
								</a>
							</span>
							<span class="profiler-control-group">
								<a href="#" @click.prevent="$profiler.disableProfiling()" title="Disable profiler">
									<icon name="x-circle"></icon>
								</a>
							</span>
						</div>
					</th>
				</tr>
				<tr class="filter" v-show="filter.shown">
					<td colspan="3">
						<label>
							<icon name="search"></icon>
							<input type="search" placeholder="Filter..." v-model="filter.input">
							<span class="example" v-show="! filter.input">eg. "preg_match" self:>500</span>
						</label>
					</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item, index in filterXdebug($profiler.functions)" :key="`${$request.id}-${index}`">
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
			</tbody>
		</table>

		<div class="profiler-loading" v-show="$profiler.loading || $profiler.parsing">
			<spinner name="fading-circle"></spinner>

			<p class="message" v-show="$profiler.loading">
				Loading profile...
			</p>
			<p class="message" v-show="$profiler.parsing">
				Processing profile...
			</p>
		</div>

		<div class="profiler-not-available" v-show="! $profiler.available">
			<p>
				Profile is not present for current request.
			</p>
			<p class="message">
				Profiling requires the Xdebug php extension.<br>
				<a href="https://underground.works/clockwork/xdebug-profiler?#content" target="_blank">Read more about how to set up Xdebug</a>
			</p>
			<p class="message profiler-enable">
				<a href="#" @click="$profiler.enableProfiling()" v-show="! $profiler.isProfiling">
					Enable profiler
				</a>
				<a href="#" @click="$profiler.disableProfiling()" v-show="$profiler.isProfiling">
					Disable profiler
				</a>
			</p>
		</div>
	</div>
</template>

<script>
import ShortenedText from '../../UI/ShortenedText'

import Filter from '../../../features/filter'

export default {
	name: 'Profiler',
	components: { ShortenedText },
	data: () => ({
		filter: (() => {
			let filter = new Filter([
				{ tag: 'model' },
				{ tag: 'file', map: item => item.shortPath },
				{ tag: 'self', type: 'number' },
				{ tag: 'inclusive', type: 'number' }
			], item => item.name)
			filter.sortedBy = 'self[0]'
			filter.sortedDesc = true

			return filter
		})()
	}),
	methods: {
		filterXdebug(xdebug) { return xdebug ? this.filter.filter(xdebug) : [] }
	}
}
</script>
