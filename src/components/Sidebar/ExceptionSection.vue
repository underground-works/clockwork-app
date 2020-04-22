<template>
	<div class="exception-section" :class="{ 'compact': compact }" v-if="$request && $request.exceptions.length">
		<div class="exception-info" v-for="exception, index in $request.exceptions" :key="`${$request.id}-${index}`">
			<div class="exception-message">
				<h3>{{exception.type}} <small v-if="exception.code">#{{exception.code}}</small></h3>
				{{exception.message}}
			</div>
			<div>
				<a href="#" class="exception-previous" @click.prevent="showPreviousException(exception)" v-if="exception.previous" title="Show previous">
					<font-awesome-icon icon="arrow-circle-down"></font-awesome-icon>
				</a>
				<stack-trace class="exception-trace" :trace="exception.trace"></stack-trace>
			</div>
		</div>
	</div>
</template>

<script>
import StackTrace from '../UI/StackTrace'

export default {
	name: 'ExceptionSection',
	components: { StackTrace },
	props: [ 'compact' ],
	methods: {
		showPreviousException(exception) {
			this.$request.exceptions.push(exception.previous)
			exception.previous = undefined
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.exception-section {
	border-bottom: 1px solid rgb(209, 209, 209);

	@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

	&.compact {
		.exception-message h3 {
			display: inline;
			padding-right: 4px;
		}
	}

	.exception-info {
		align-items: center;
		background: rgb(255, 235, 235);
		color: rgb(197, 31, 36);
		display: flex;
		padding: 6px 10px;

		&:nth-child(even) { background: hsl(0, 100%, 94%); }
		&:first-child { padding-top: 12px; }
		&:last-child { padding-bottom: 12px; }

		@include dark {
			background: hsl(0, 100%, 11%);
			color: rgb(237, 121, 122);

			&:nth-child(even) { background: hsl(0, 100%, 9%); }
		}

		h3 {
			border-bottom: 0;
			font-size: 14px;
			margin: 0 0 5px;
			word-break: break-all;
		}

		.exception-message {
			flex: 1;
			font-size: 12px;
			line-height: 1.33;
		}

		.exception-previous, .exception-trace > a {
			color: rgb(197, 31, 36);
			font-size: 12px;
			margin: 0 4px;

			@include dark { color: rgb(237, 121, 122); }
		}

		.exception-previous {
			margin-right: 4px;
			text-decoration: none;
		}

		.exception-trace {
			display: inline-block;
		}
	}
}
</style>