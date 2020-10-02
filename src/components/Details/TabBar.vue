<template>
	<div class="details-header-tabs">
		<tab-handle v-for="tab in tabs" :key="tab.name" :text="tab.text" :name="tab.name" :icon="tab.icon" :active="tab.name == activeTab" :short="shortTabs.includes(tab)" :full="fullTabs.includes(tab)" @tab-selected="$emit('tab-selected', $event)" v-if="tab.shown">{{tab.text}}</tab-handle>
	</div>
</template>

<script>
import TabHandle from './TabHandle'

import debounce from 'just-debounce-it'

export default {
	name: 'TabBar',
	components: { TabHandle },
	props: { tabs: { default: () => [] }, activeTab: {} },
	data: () => ({
		shortTabs: [],
		fullTabs: []
	}),
	methods: {
		hideOverflowingTabs() {
			this.shortTabs = []
			this.fullTabs = []
			this.$nextTick(() => this.hideNextOverflowingTab())
		},
		hideNextOverflowingTab() {
			if (this.$el.scrollWidth <= this.$el.clientWidth) return

			let activeTabIndex = this.tabs.indexOf(this.tabs.find(tab => tab.name == this.activeTab))

			let tab = this.tabs.slice()
				.sort((a, b) => Math.abs(activeTabIndex - this.tabs.indexOf(b)) - Math.abs(activeTabIndex - this.tabs.indexOf(a)))
				.find(tab => ! this.shortTabs.includes(tab))

			if (! tab || tab.name == this.activeTab) {
				return this.fullTabs = this.tabs.filter(tab => ! this.shortTabs.includes(tab))
			}

			this.shortTabs.push(tab)
			this.$nextTick(() => this.hideNextOverflowingTab())
		}
	},
	watch: {
		tabs() { this.hideOverflowingTabs() },
		activeTab() { this.hideOverflowingTabs() }
	},
	mounted() {
		this.resizeObserver = new ResizeObserver(debounce(() => this.hideOverflowingTabs(), 10))
		this.resizeObserver.observe(this.$el)
	}
}
</script>
