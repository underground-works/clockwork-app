<template>
	<a href="#" class="toggle-filter" @click.stop="filter.toggle($event)">
		<font-awesome-icon icon="search"></font-awesome-icon>
	</a>
</template>

<script>
export default {
	name: 'DetailsTableFilterToggle',
	props: [ 'filter' ]
}
</script>
