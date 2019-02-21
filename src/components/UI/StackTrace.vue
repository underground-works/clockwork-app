<template>
	<div class="stack-trace popover-container" v-click-outside="closePopover">
		<shortened-text :full="trace ? shortPath : fullPath" @click.native="togglePopover">{{shortPath}}</shortened-text>
		<div class="popover" v-show="showPopover" v-if="trace">
			<div class="popover-content">
				<div v-for="frame in trace" class="stack-frame" :class="{'is-vendor':frame.isVendor}">
					<div class="stack-frame-call">{{ frame.call }}</div>
					<div class="stack-frame-file">
						<a :href="frame.file | editorLink(frame.line)">
							<shortened-text :full="frame.fullPath">{{frame.shortPath}}</shortened-text>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PrettyJason from '../../features/pretty-jason/pretty-jason'
import ShortenedText from './ShortenedText'

export default {
	name: 'PrettyPrint',
	components: { ShortenedText },
	props: [ 'shortPath', 'fullPath', 'trace' ],
	data: () => ({
		showPopover: false
	}),
	methods: {
		closePopover: function () {
			this.showPopover = false
		},
		togglePopover: function () {
			this.showPopover = ! this.showPopover

			let popoverContainerEl = this.$el
			let popoverEl = this.$el.querySelector('.popover')
			if (window.innerWidth - popoverContainerEl.getBoundingClientRect().left < 300) {
				popoverEl.classList.add('right-aligned')
			}
		}
	}
}
</script>
