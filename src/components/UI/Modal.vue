<template>
	<transition name="modal">
		<div class="modal-backdrop" @click.self="close" v-if="shown">
			<div class="modal">
				<div class="modal-header">
					<div class="header-title">
						<icon :name="icon" v-if="icon"></icon>
						{{title}}
					</div>

					<a href="#" class="header-close" @click.prevent="close">
						<icon name="x"></icon>
					</a>
				</div>

				<slot></slot>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'Modal',
	props: [ 'icon', 'shown', 'title', 'onClose' ],
	methods: {
		close() {
			if (this.onClose) this.onClose()

			this.$emit('update:shown', false)
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.modal-backdrop {
	align-items: center;
	background: hsl(240deg 20% 90% / 60%);
	display: flex;
	height: 100%;
	justify-content: center;
	left: 0;
	opacity: 1;
	position: fixed;
	top: 0;
	transition: opacity 0.2s;
	width: 100%;
	z-index: 666;

	@include dark { background: hsl(240deg 20% 20% / 60%); }
}

.modal {
	background: hsl(240deg 20% 99%);
	border-radius: 8px;
	box-shadow: 0 0 1px 1px hsl(240deg 20% 90%), 0 2px 4px 0 hsl(240deg 20% 90%);
	max-height: calc(100vh - 20px);
	overflow: auto;
	padding: 25px;

	@include dark {
		background: rgb(31, 31, 31);
		box-shadow: 0 0 1px 1px hsl(240deg 5% 8%), 0 2px 4px 0 hsl(240deg 5% 8%);
	}

	.modal-header {
		align-items: center;
		display: flex;
		font-size: 13px;
	    font-weight: 600;

	    .header-title {
	    	flex: 1;

			.ui-icon {
				color: #111;
				margin-right: 5px;

				@include dark { color: #b2b2b2; }
			}
		}

		.header-close {
			font-size: 110%;

			&:hover {
				color: rgb(37, 140, 219);

				@include dark {
					color: hsl(31deg 98% 48%);
				}
			}
		}
	}
}

.modal-enter-from, .modal-leave-to {
	opacity: 0;
}
</style>