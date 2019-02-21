<template>
	<span @click="expand($event)">
		<template v-if="expanded">
			{{full}}
		</template>
		<template v-else>
			<slot></slot>
		</template>
	</span>
</template>

<script>
export default {
	name: 'ShortenedText',
	props: [ 'full' ],
	data: () => ({
		expanded: false
	}),
	methods: {
		expand($event) {
			if (! this.expanded) {
				$event.stopPropagation()
				$event.preventDefault()
			}

			this.expanded = true
		}
	}
}
</script>
