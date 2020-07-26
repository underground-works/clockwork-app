<template>
	<div class="popover" :class="classList" v-show="shown" v-click-outside="close">
		<div class="popover-content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Popover',
	data: () => ({
		shown: false,
		classList: []
	}),
	methods: {
		close($event) {
			if ($event && this.$el.closest('.popover-container').contains($event.target)) return

			this.shown = false
		},

		open() {
			this.shown = true

			let popoverViewport = this.$el.closest('.popover-viewport')
			let popoverViewportRect = popoverViewport.getBoundingClientRect()
			let popoverContainer = this.$el.closest('.popover-container')
			let popoverContainerRect = popoverContainer.getBoundingClientRect()

			this.classList = []

			if (popoverViewportRect.left > popoverContainerRect.left + popoverContainerRect.width / 2 - 200) {
				this.classList = [ 'left-aligned' ]
			} else if (popoverViewportRect.right < popoverContainerRect.left + popoverContainerRect.width / 2 + 200) {
				this.classList = [ 'right-aligned' ]
			}
		},

		toggle() {
			this.shown ? this.close() : this.open()
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.popover-container {
	position: relative;
}

.popover {
	left: calc(50% - 200px);
	padding-top: 17px;
	position: absolute;
	top: 100%;
	width: 400px;
	z-index: 666;

	&.left-aligned {
		left: 0;
		right: auto;

		.popover-content:before {
			left: 15px;
			right: auto;
		}

		.popover-content:after {
			left: 14px;
			right: auto;
		}
	}

	&.right-aligned {
		left: auto;
		right: 0;

		.popover-content:before {
			left: auto;
			right: 8px;
		}

		.popover-content:after {
			left: auto;
			right: 7px;
		}
	}

	.popover-content {
		background: hsl(240, 20, 99);
		border-radius: 8px;
		box-shadow: 0 1px 5px rgba(#333, 0.4);
		max-height: 400px;
		overflow: auto;
		padding: 5px 0;
		text-align: center;
		width: 100%;

		@include dark {
			background: hsl(240, 3, 13);
			box-shadow: 0 0 1px 1px hsl(240, 5, 8), 0 2px 4px 0 hsl(240, 5, 8);
		}

		&:before, &:after {
			border-style: solid;
			content: '';
			height: 0;
			position: absolute;
			width: 0;
		}

		&:before {
			border-color: transparent transparent hsl(240, 20, 99) transparent;
			border-width: 0 11px 11px 11px;
			left: calc(50% - 10px);
			top: 7px;
			z-index: 500;

			@include dark {
				border-color: transparent transparent rgb(31, 31, 31) transparent;
			}
		}

		&:after {
			border-color: transparent transparent rgba(#333, 0.05) transparent;
			border-width: 0 12px 12px 12px;
			left: calc(50% - 11px);
			top: 5px;

			@include dark {
				border-color: transparent transparent rgba(#888, 0.05) transparent;
			}
		}
	}
}
</style>