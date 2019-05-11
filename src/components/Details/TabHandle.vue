<template>
	<a @click="selectTab" class="details-header-tab" :class="{'active':active}" href="#">
		<slot></slot>
	</a>
</template>

<script>
export default {
	name: 'TabHandle',
	props: [ 'name', 'active' ],
	methods: {
		selectTab() { this.$emit('tab-selected', this.name) }
	}
}
</script>
