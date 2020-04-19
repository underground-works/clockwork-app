<template>
	<div class="messages-overlay">
		<parent-request compact="true" v-show="$settings.global.requestSidebarCollapsed"></parent-request>
		<exception-section compact="true" v-show="$settings.global.requestSidebarCollapsed"></exception-section>

		<div class="update-notification" v-if="updateNotification">
			<span>
				A new Clockwork server-side version <strong>{{updateNotification.version}}</strong> is available, you are using <strong>{{updateNotification.currentVersion}}</strong>.
				<a v-if="updateNotification.url" :href="updateNotification.url" target="_blank">Read more</a>
			</span>
			<span class="updateNotification-close">
				<a @click="closeUpdateNotification" href="#">Close</a>
			</span>
		</div>
	</div>
</template>

<script>
import ExceptionSection from '../Sidebar/ExceptionSection'
import ParentRequest from '../Sidebar/ParentRequest'
import StackTrace from '../UI/StackTrace'

export default {
	name: 'MessagesOverlay',
	components: { ExceptionSection, ParentRequest, StackTrace },
	data: () => ({
		updateNotification: false
	}),
	methods: {
		closeUpdateNotification() {
			this.$updateNotification.ignoreUpdate(this.$requests.remoteUrl)
			this.updateNotification = false
		},
		showPreviousException(exception) {
			this.$request.exceptions.push(exception.previous)
			exception.previous = undefined
		},
		showRequestById(requestId) {
			this.global.$request = this.$requests.find(requestId)
		}
	},
	watch: {
		'$requests.remoteUrl': {
			handler() {
				this.updateNotification = this.$updateNotification.show(this.$requests.remoteUrl)
			},
			immediate: true
		},
		'$updateNotification.serverVersion': function () {
			this.updateNotification = this.$updateNotification.show(this.$requests.remoteUrl)
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.messages-overlay {
	.parent-request {
		display: flex;
		font-size: 12px;
		font-weight: 600;
		padding: 10px;

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

		a {
			color: rgb(37, 140, 219);
			font-weight: normal;
			text-decoration: none;

			@include dark { color: hsl(31, 98%, 48%); }
		}

		.parent-close { margin-left: auto; }
	}

	.exception {
		.exception-info {
			align-items: center;
			background: rgb(255, 235, 235);
			color: rgb(197, 31, 36);
		    display: flex;
		    padding: 10px;

			&:nth-child(even) { background: hsl(0, 100%, 94%); }

			@include dark {
				background: hsl(0, 100%, 11%);
				color: rgb(237, 121, 122);

				&:nth-child(even) { background: hsl(0, 100%, 9%); }
			}

			h3 {
			    border-bottom: 0;
			    display: inline;
			    font-size: 12px;
			}

		    .exception-message {
			    flex: 1;
	    	    font-size: 12px;
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

	.update-notification {
		align-items: center;
		background: hsl(206, 71%, 95%);
		display: flex;
		font-size: 110%;
		padding: 10px;

		@include dark { background: hsl(30, 97%, 20%); }

		a {
			color: rgb(37, 140, 219);
			text-decoration: none;

			@include dark { color: hsl(31, 98%, 48%); }
		}

		strong { font-weight: 500; }

		.updateNotification-close {
			margin-left: auto;
		}
	}
}
</style>