<template>
	<a href="#" class="toggle-filter" @click.stop="filter.toggle($event)">
		<icon name="search"></icon>
	</a>
</template>

<script>
export default {
	name: 'DetailsTableFilterToggle',
	props: [ 'filter' ]
}
</script>
