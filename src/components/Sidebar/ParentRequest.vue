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
	border-bottom: 1px solid hsl(240deg 20% 92%);
	display: flex;
	font-size: 12px;
	font-weight: 600;
	padding: 8px 10px;

	@include dark { border-bottom: 1px solid rgb(52, 52, 54); }

	&.compact {
		background: rgba(#fff, 0.9);

		@include dark { background: rgba(#1e1e1e, 0.9);  }

		.parent-title { padding-right: 4px; }
		.parent-title, .parent-name { display: inline; }
	}

	.parent-title {
		font-size: 10px;
		margin-bottom: 2px;
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
		background: hsl(206deg 47% 86%);
		border-radius: 3px;
		color: hsl(205deg 29% 30%);
		font-size: 80%;
		margin-right: 2px;
		padding: 1px 3px;
		vertical-align: 1px;

		@include dark {
			background: hsl(206deg 100% 16%);
		    color: hsl(205deg 90% 70%);
		}
	}

	a {
		color: rgb(37, 140, 219);
		font-size: 11px;
		font-weight: normal;
		padding: 0 6px;
		text-decoration: none;
		text-transform: uppercase;

		@include dark { color: hsl(31deg 98% 48%); }
	}

	.parent-close { margin-left: auto; }
}
</style>