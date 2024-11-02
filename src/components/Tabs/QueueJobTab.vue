<template>
	<div class="queue-job-tab">
		<sidebar-section title="Payload" name="payload" v-if="$request.jobPayload">
			<template v-slot:content="{ expanded }">
				<div class="data-value" v-if="expanded">
					<pretty-print :data="$request.jobPayload" :expanded="true"></pretty-print>
				</div>
			</template>
		</sidebar-section>

		<sidebar-section title="Queue" name="queue" v-if="$request.jobQueue">
			<template v-slot:content="{ expanded }">
				<div class="data-value" v-if="expanded">
					{{$request.jobQueue}}
				</div>
			</template>
		</sidebar-section>

		<sidebar-section title="Connection" name="connection" v-if="$request.jobConnection">
			<template v-slot:content="{ expanded }">
				<div class="data-value" v-if="expanded">
					{{$request.jobConnection}}
				</div>
			</template>
		</sidebar-section>

		<sidebar-section title="Options" name="options" :items="$request.jobOptions" filter-example="&quot;Mike Jones&quot; name:name" v-if="$request.jobOptions.length">
		</sidebar-section>
	</div>
</template>

<script>
import PrettyPrint from '../UI/PrettyPrint'
import SidebarSection from '../UI/SidebarSection'

export default {
	name: 'QueueJobTab',
	components: { PrettyPrint, SidebarSection }
}
</script>

<style lang="scss">
@use '../../mixins' as *;

.queue-job-tab {
	background: #fff;

	@include dark { background: #1f1f1f; }

	.data-value {
		border-bottom: 1px solid rgb(209, 209, 209);
		padding: 8px 10px;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }
	}
}
</style>