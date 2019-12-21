<template>
	<div class="parent-request" :class="{ 'compact': compact }" v-if="parentRequest">
		<div>
			<div class="parent-title">
				Subrequest of
			</div>
			<div class="parent-name" v-if="parentRequest.isCommand()">
				<span class="type-text">CMD</span> {{parentRequest.commandName}}
			</div>
			<div class="parent-name" v-else-if="parentRequest.isQueueJob()">
				<span class="type-text">QUEUE</span> {{parentRequest.jobName}}
			</div>
			<div class="parent-name" v-else>
				<span class="parent-method">{{parentRequest.method}}</span> <span class="parent-uri">{{parentRequest.uri}}</span>
			</div>
		</div>
		<div class="parent-close">
			<a @click="showRequestById(parentRequest.id)" href="#">Show</a>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ParentRequest',
	props: [ 'compact' ],
	data: () => ({
		parentRequest: null
	}),
	methods: {
		showRequestById(requestId) {
			this.global.$request = this.$requests.findId(requestId)
		}
	},
	watch: {
		'$request': {
			async handler() {
				this.parentRequest = null

				if (! this.$request || ! this.$request.parent || ! this.$request.parent.id) return

				this.parentRequest = this.$requests.findId(this.$request.parent.id)
					|| await this.$requests.loadId(this.$request.parent.id)
			},
			immediate: true
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.parent-request {
	align-items: center;
	border-bottom: 1px solid rgb(209, 209, 209);
	display: flex;
	font-size: 12px;
	font-weight: 600;
	padding: 12px 10px;

	@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

	&.compact {
		.parent-title { padding-right: 4px; }
		.parent-title, .parent-name { display: inline; }
	}

	.parent-title {
		font-size: 11px;
		margin-bottom: 3px;
	}

	.parent-method {
		color: gray;
		font-size: 90%;
		font-weight: normal;
		margin-right: 2px;

		@include dark { color: rgb(118, 118, 118); }
	}

	.parent-uri {
		font-weight: normal;
	}

	.type-text {
		background: hsla(206, 47%, 86%, 1);
		border-radius: 3px;
		color: hsla(205, 29%, 30%, 1);
		font-size: 80%;
		margin-right: 2px;
		padding: 1px 3px;
		vertical-align: 1px;

		@include dark {
			background: hsla(206, 100%, 16%, 1);
		    color: hsla(205, 90%, 70%, 1);
		}
	}

	a {
		color: rgb(37, 140, 219);
		font-weight: normal;
		text-decoration: none;

		@include dark { color: hsl(31, 98%, 48%); }
	}

	.parent-close { margin-left: auto; }
}
</style>