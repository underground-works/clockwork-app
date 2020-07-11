<template>
	<a @click="selectTab" class="details-header-tab" :class="{'active':active}" href="#">
		<icon :name="icon" v-if="icon"></icon>
		<slot></slot>
		<div class="tab-badge" v-if="badge">{{badge}}</div>
	</a>
</template>

<script>
export default {
	name: 'TabHandle',
	props: [ 'name', 'icon', 'badge', 'active' ],
	methods: {
		selectTab() { this.$emit('tab-selected', this.name) }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.details-header-tab {
	align-items: center;
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
		color: rgb(158, 158, 158);
	}

	&:first-child {
		border-left: 1px solid hsl(240, 20, 85);
	}

	&:hover {
		background: hsl(240, 20, 91);
		color: rgb(37, 140, 219);
	}

	&.active {
		background: #f6f6f9;
		border-bottom: 0;
		border-right: 1px solid hsl(240, 20, 85);
		color: rgb(37, 140, 219);
		margin-bottom: -1px;
		padding-bottom: 1px;

		@include dark {
			color: hsl(31, 98%, 48%);
		}

		.tab-badge {
			background: transparent;
			border: 1px solid #258cdb;
			color: #258cdb;
		}
	}

	.ui-icon {
		margin-right: 5px;
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