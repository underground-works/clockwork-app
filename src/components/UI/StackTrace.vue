<template>
	<div class="stack-trace popover-container" v-click-outside="closePopover">
		<a :href="file || trace[0].file | editorLink(line)" v-if="file || trace.length">
			<shortened-text :full="trace ? shortPath : fullPath" @click.native="togglePopover($event)">{{shortPath}}</shortened-text>
		</a>
		<a href="#" v-else title="Stack trace">
			<span @click="togglePopover($event)">
				<font-awesome-icon icon="list-ol"></font-awesome-icon>
			</span>
		</a>
		<div class="popover" ref="popover" v-show="showPopover" v-if="trace">
			<div class="popover-content">
				<div v-for="frame in trace" class="stack-frame" :class="{'is-vendor':frame.isVendor}">
					<div class="stack-frame-call">{{ frame.call }}</div>
					<div class="stack-frame-file">
						<a :href="frame.file | editorLink(frame.line)">
							<shortened-text :full="makeFullPath(frame.file, frame.line)">
								{{makeShortPath(frame.file, frame.line)}}
							</shortened-text>
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
	name: 'StackTrace',
	components: { ShortenedText },
	props: [ 'trace', 'file', 'line' ],
	data: () => ({
		showPopover: false
	}),
	computed: {
		fullPath() { return this.makeFullPath(this.file || this.trace[0].file, this.line || this.trace[0].line) },
		shortPath() { return this.makeShortPath(this.file || this.trace[0].file, this.line || this.trace[0].line) }
	},
	methods: {
		closePopover() {
			this.showPopover = false
		},
		togglePopover($event) {
			if (! this.trace) return

			$event.preventDefault()

			this.showPopover = ! this.showPopover

			if (this.$el.offsetParent.clientWidth - this.$el.offsetLeft < 300) {
				this.$refs.popover.classList.add('right-aligned')
			}
		},
		makeFullPath(file, line) {
			return `${file}:${line}`
		},
		makeShortPath(file, line) {
			return this.makeFullPath(file, line).split(/[\/\\]/).pop()
		}
	}
}
</script>
