<template>
	<div>
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
export default {
	name: 'MessagesOverlay',
	computed: {
		updateNotification() { return this.$updateNotification.show(this.$requests.remoteUrl) }
	},
	methods: {
		closeUpdateNotification: function () {
			this.$updateNotification.ignoreUpdate(this.$requests.remoteUrl)
			this.updateNotification = false
		}
	}
}
</script>

<style lang="scss">
.update-notification {
	align-items: center;
	background: hsl(206, 71%, 95%);
	display: flex;
	font-size: 110%;
	padding: 10px;

	body.dark & { background: hsl(30, 97%, 20%); }

	a {
		color: rgb(37, 140, 219);
		text-decoration: none;

		body.dark & { color: hsl(31, 98%, 48%); }
	}

	strong { font-weight: 500; }

	.updateNotification-close {
		margin-left: auto;
	}
}
</style>