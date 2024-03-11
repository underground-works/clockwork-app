<template>
	<a @click="selectTab" class="details-header-tab" :class="{'active':active, 'short':short, 'full':full}" href="#">
		<icon :name="icon" :title="text" v-if="icon"></icon>
		<div class="tab-title" v-show="! short">{{text}}</div>
		<div class="tab-badge" v-show="badge && ! short">{{badge}}</div>
	</a>
</template>

<script>
export default {
	name: 'TabHandle',
	props: [ 'text', 'name', 'icon', 'badge', 'active', 'short', 'full' ],
	methods: {
		selectTab() { this.$emit('tab-selected', this.name) }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.details-header-tab {
	align-items: center;
	border-bottom: 1px solid hsl(240, 20, 85);
	border-left: 1px solid transparent;
	border-right: 1px solid hsl(240, 20, 85);
	color: rgb(64, 64, 64);
	cursor: default;
	display: flex;
	flex: 1;
	font-size: 12px;
	justify-content: center;
	padding: 0 12px;
	text-align: center;
	text-decoration: none;
	transition: all 0.1s;

	@include dark {
		border-bottom: 1px solid hsl(240, 17%, 20%);
		border-right: 1px solid hsl(240, 17%, 20%);
		color: rgb(158, 158, 158);
	}

	&:first-child {
		border-left: 1px solid hsl(240, 20, 85);

		@include dark { border-left: 1px solid hsl(240, 17%, 20%); }
	}

	&:hover {
		background: hsl(240, 20, 91);
		color: rgb(37, 140, 219);

		@include dark {
			background: hsl(240, 17%, 12%);
		}
	}

	&.active {
		background: #f6f6f9;
		border-bottom: 0;
		border-right: 1px solid hsl(240, 20, 85);
		color: rgb(37, 140, 219);
		margin-bottom: -1px;
		padding-bottom: 1px;

		@include dark {
			background: hsl(240, 2, 15);
			color: hsl(31, 98%, 48%);
		}

		.tab-badge {
			background: transparent;
			border: 1px solid #258cdb;
			color: #258cdb;
		}
	}

	&.full {
		min-width: 40px;
	}

	&.short {
		flex: 0;
		width: 40px;

		.ui-icon {
			margin-right: 0;
		}
	}

	.ui-icon {
		flex-shrink: 0;
		margin-right: 5px;
	}

	.tab-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tab-badge {
		background: hsl(240, 10, 65);
		border: 1px solid hsl(240, 10, 65);
		border-radius: 6px;
		color: #f5f5f5;
		font-size: 90%;
		margin-left: 5px;
		margin-top: 1px;
		padding: 0 4px;
	}
}
</style>