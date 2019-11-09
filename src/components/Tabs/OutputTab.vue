<template>
	<div>
		<div class="command-output" v-html="formattedOutput"></div>
	</div>
</template>

<script>
import AnsiToHtml from 'ansi-to-html'

export default {
	name: 'OutputTab',
	computed: {
		formattedOutput() { return this.ansiToHtml.toHtml(this.$request.commandOutput) }
	},
	created() {
		this.ansiToHtml = new AnsiToHtml({
			fg: '#c7c7c7',
			bg: '#000000',
			escapeXML: true,
			colors: {
				0: '#000000', 1: '#c91b00', 2: '#00c200', 3: '#c7c400', 4: '#0225c7', 5: '#c930c7', 6: '#00c5c7',
				7: '#c7c7c7', 8: '#676767', 9: '#ff6d67', 10: '#5ff967', 11: '#fefb67', 12: '#6871ff', 13: '#ff76ff',
				14: '#5ffdff', 15: '#feffff'
			}
		})
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.command-output {
	background: #333;
	border-radius: 6px;
	font-family: Menlo, monospace;
	overflow: auto;
	padding: 16px 12px;
	white-space: pre;

	@include dark {
		background: #111;
	}
}
</style>