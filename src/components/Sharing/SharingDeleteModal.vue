<template>
	<modal icon="trash-2" title="Delete" v-model:shown="$sharing.shownDelete">
		<div class="delete-shared-modal">
			<h1>
				<template v-if="deleted">
					<icon name="check-circle"></icon>
				</template>
				<template v-else>
					<icon name="trash-2"></icon>
				</template>
			</h1>

			<p>
				<template v-if="deleted">
					Shared request was successfully deleted.
				</template>
				<template v-else>
					Are you sure you want to delete this shared request?
				</template>
			</p>

			<a href="#" @click.prevent="deleteShared" class="button">
				<template v-if="deleted">
					Deleted!
				</template>
				<template v-else-if="deleting">
					<spinner width="16" height="16" :no-fade-in="true" :color="$settings.appearance == 'dark' ? '#f27e02' : '#258cdb'"></spinner>
					Deleting...
				</template>
				<template v-else>
					Delete
				</template>
			</a>
		</div>
	</modal>
</template>

<script>
import Modal from '../UI/Modal'

export default {
	name: 'SharingDeleteModal',
	components: { Modal },
	data: () => ({
		deleting: false,
		deleted: false
	}),
	methods: {
		deleteShared() {
			this.deleting = true
			this.$sharing.deleteShared().then(() => this.deleted = true)
		}
	}
}
</script>

<style lang="scss">
@use '../../mixins' as *;

.delete-shared-modal {
	font-size: 13px;
	max-width: 320px;
	padding-top: 10px;

	h1 {
		font-size: 200%;
		text-align: center;
	}

	.button {
		margin: 30px auto 10px;
		max-width: 60%;

		.spinner {
			margin-right: 6px;
		}
	}
}
</style>
