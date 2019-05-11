<template>
</template>

<script>
import PrettyJason from '../../features/pretty-jason/pretty-jason'

export default {
	name: 'PrettyPrint',
	props: [ 'data' ],
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
					rendered.innerText = data
				}
			}

			if (this.$el.firstChild) this.$el.firstChild.remove()

			this.$el.append(rendered)
		}
	},
	mounted() {
		this.render()
	},
	watch: {
		data() { this.render() }
	}
}
</script>
