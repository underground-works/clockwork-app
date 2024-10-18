<template>
	<div ref="content"></div>
	<a v-if="hasLongText && ! showFullText" @click.prevent="showFullText = true" class="pretty-print-more-link" href="#">Show more</a>
</template>

<script>
import PrettyJason from '../../features/pretty-jason/pretty-jason'

import linkify from 'linkify-html'

export default {
	name: 'PrettyPrint',
	props: [ 'data', 'expanded', 'linkify' ],
	data: () => ({
		hasLongText: false,
		showFullText: false
	}),
	methods: {
		render() {
			let data = this.data
			let rendered = document.createElement('div')

			if (data === true) {
				rendered.innerHTML = '<i>true</i>'
			} else if (data === false) {
				rendered.innerHTML = '<i>false</i>'
			} else if (data === undefined) {
				rendered.innerHTML = '<i>undefined</i>'
			} else if (data === null) {
				rendered.innerHTML = '<i>null</i>'
			} else if (typeof data === 'number') {
				rendered.innerText = data
			} else {
				try {
					rendered.append((new PrettyJason(data)).generateHtml())
				} catch (e) {
					this.hasLongText = data.length > 1000

					rendered.innerText = this.hasLongText && ! this.showFullText
						? data.substring(0, 1000) + '...' : data

					if (this.linkify) rendered.innerHTML = linkify(rendered.innerHTML, {
						target: (href, type) => type === "url" && "_blank"
					})
				}
			}

			if (this.$refs.content.firstChild) this.$refs.content.firstChild.remove()

			this.$refs.content.append(rendered)

			if (this.expanded) this.$refs.content.querySelector('.pretty-jason > li > span').click()
		}
	},
	mounted() {
		this.render()
	},
	watch: {
		data() { this.render() },
		showFullText() { this.render() }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.pretty-print-more-link {
	color: #aaa;
	display: inline-block;
	flex: 0;
	font-size: 90%;
	margin-top: 3px;
	text-decoration: none;

	@include dark {
		color: #777;
	}
}
</style>
