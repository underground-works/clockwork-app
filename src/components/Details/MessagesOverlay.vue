<template>
	<div class="messages-overlay">
		<parent-request compact="true" v-if="$settings.global.requestSidebarCollapsed"></parent-request>
		<exception-section compact="true" v-if="$settings.global.requestSidebarCollapsed"></exception-section>

		<div class="update-notification" v-if="updateNotification">
			<icon name="info"></icon>
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
@use '../../mixins' as *;

.messages-overlay {
	border-top: 1px solid #d1d1e0;
	bottom: 0;
	position: absolute;
	width: 100%;

	@include dark { border-top: 1px solid #2a2a3c; }

	.update-notification {
		align-items: center;
		background: rgba(#e3eccb, 0.9);
	    color: #586336;
		display: flex;
		font-size: 13px;
		padding: 12px 10px;

		@include dark {
		    background: rgba(#293800, 0.9);
		    color: #e3fa9e;
		}

		.notification-text {
			align-items: center;
			display: flex;
		}

		.ui-icon {
			margin-right: 5px;
		}

		a {
		    color: #586336;
			font-size: 80%;
			padding: 0 6px;
			text-decoration: none;
			text-transform: uppercase;

			@include dark { color: hsl(31deg 98% 48%); }
		}

		strong { font-weight: 500; }

		.updateNotification-close {
			margin-left: auto;
		}
	}
}
</style>