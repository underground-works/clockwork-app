<template>
	<transition name="sharing">
		<div class="sharing-modal" v-show="$sharing.termsShown">
			<div class="sharing-terms">
				<h1>Sharing</h1>

				<p>Request will be uploaded to our servers and a unique public link generated for you.</p>

				<h2>Deleting</h2>

				<ul>
					<li>You can delete the request anytime via the shared link.</li>
					<li>Shared links might expire after a few weeks.</li>
				</ul>

				<h2>Privacy</h2>

				<ul>
					<li>Shared requests are hosted on DigitalOcean servers.</li>
					<li>Collected data is never shared with third-parties.</li>
				</ul>

				<div class="terms-actions">
					<a href="#" @click.prevent="$sharing.acceptTerms()" class="actions-primary">Confirm</a>
					<a href="#" @click.prevent="$sharing.toggle()">Cancel</a>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'SharingTerms'
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.sharing-modal {
	background: #fff;
	border: 1px solid rgb(209, 209, 209);
	border-radius: 5px;
	box-shadow: 0 0 4px #e5e5e5;
	font-size: 13px;
	left: 50%;
	margin-left: -200px;
	max-width: 400px;
	padding: 35px 35px 30px;
	position: absolute;
	text-align: left;
	top: 0;
	width: 90%;
	z-index: 300;

	@include dark {
		background: rgb(31, 31, 31);
		border: 1px solid #404040;
		box-shadow: 0 0 4px #292929;
	}

	.sharing-terms {
		padding-top: 10px;

		h1 {
			font-size: 120%;
		}

		h2 {
			font-size: 110%;
			margin-top: 20px;
		}

		ul {
			padding-left: 20px;

			li {
				font-size: 95%;
				margin-bottom: 8px;
			}
		}

		.terms-actions {
			display: flex;
			justify-content: center;
			margin-top: 30px;

			a {
				background: transparent;
				border: none;
				color: #258cdb;
				margin: 0 15px;
				padding: 5px 20px;
				text-decoration: none;

				@include dark {
					color: #f27e02;
				}

				&.actions-primary {
					border: 1px solid #258cdb;
					border-radius: 4px;

					@include dark {
						border: 1px solid #f27e02;
					}
				}
			}
		}
	}
}

.sharing-enter-active, .sharing-leave-active {
	transition: top .33s;
}

.sharing-enter, .sharing-leave-to {
	top: -500px;
}
</style>
