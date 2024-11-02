<template>
	<div class="command-tab">
		<sidebar-section title="Arguments" name="arguments" :items="$request.commandArgumentsMerged" filter-example="&quot;Mike Jones&quot; name:name" v-if="$request.commandArgumentsMerged.length">
		</sidebar-section>

		<sidebar-section title="Options" name="options" :items="$request.commandOptionsMerged" filter-example="&quot;Mike Jones&quot; name:name" v-if="$request.commandOptionsMerged.length">
		</sidebar-section>
	</div>
</template>

<script>
import SidebarSection from '../UI/SidebarSection'

export default {
	name: 'CommandTab',
	components: { SidebarSection }
}
</script>

<style lang="scss">
@use '../../mixins' as *;

.command-tab {
	background: #fff;

	@include dark { background: #1f1f1f; }
}
</style>