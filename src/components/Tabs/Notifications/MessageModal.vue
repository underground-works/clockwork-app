<template>
	<modal icon="mail" title="Message" :shown.sync="messageLocal">
		<div class="email-message">
			<div class="message-info">
				<div class="info-row" v-if="message">
					<span class="row-label">To: </span>
					<span class="row-value">{{message.to.join(', ')}}</span>
				</div>

				<div class="info-row" v-if="message">
					<span class="row-label">Subject: </span>
					<span class="row-value">{{message.subject}}</span>
				</div>
			</div>

			<div class="message-content">
				<iframe ref="content"></iframe>
			</div>
		</div>
	</modal>
</template>

<script>
import Modal from '../../UI/Modal'

export default {
	name: 'EmailMessageModal',
	components: { Modal },
	props: [ 'message' ],
	computed: {
		messageLocal: {
			get() { return this.message },
			set(val) { this.$emit('update:message', val) }
		}
	},
	watch: {
		message(message) {
			if (! message) return

			let document = this.$refs.content.contentWindow.document

			document.open()
			document.write(this.message.content)
			document.close()
		}
	}
}
</script>

<style lang="scss">
@import '../../../mixins.scss';

.email-message {
	font-size: 13px;
	margin: 0 auto;
	max-width: 820px;
	width: 100vw;

	.message-info {
		margin: 15px 0;

		.info-row {
			margin-bottom: 5px;

			.row-label {
				color: #333;
				font-size: 90%;
				font-weight: 600;
				padding-right: 2px;

				@include dark { color: #b2b2b2; }
			}
		}
	}

	.message-content {
		border-bottom: 1px solid hsl(240, 20, 92);
		border-top: 1px solid hsl(240, 20, 92);
		margin-left: -25px;
		width: calc(100% + 50px);

		@include dark {
			border-bottom: 1px solid rgb(52, 52, 54);
			border-top: 1px solid rgb(52, 52, 54);
		}

		iframe {
			border: 0;
			min-height: 70vh;
			width: 100%;
		}
	}
}
</style>
