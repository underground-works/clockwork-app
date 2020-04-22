<template>
	<div class="whats-new" v-if="$whatsNew.show">
		<div class="whats-new-content">
			<h1>Clockwork has just been updated!</h1>

			<template v-for="note in release.notes">
				<div class="whats-new-section">
					<h2>{{note.title}}</h2>

					<p v-for="line in note.text">{{line}}</p>

					<img :src="`img/whats-new/${release.version}/${note.image}`" v-if="note.image">
				</div>
			</template>

			<div class="whats-new-actions">
				<a :href="release.url" target="_blank" class="actions-show-more">Learn more</a>
				<a @click.prevent="close" href="#" class="actions-close">Close</a>

				<p><small>Some of the new features might require server-side Clockwork library update.</small></p>
			</div>
		</div>
	</div>
</template>

<script>
import WhatsNew from '../../features/whats-new'

export default {
	name: 'WhatsNew',
	computed: {
		release() {
			return WhatsNew.latestRelease
		}
	},
	methods: {
		close() {
			this.$whatsNew.seen()
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.whats-new {
	background: #fff;
	font-size: 14px;
	height: calc(100% - 31px);
	overflow: auto;
	position: absolute;
	top: 31px;
	width: 100%;
	z-index: 999;

	@include dark {
		background: rgb(31, 31, 31);
	}

	.whats-new-content {
		margin: 0 auto;
		max-width: 820px;
		padding: 4px 16px 20px;
	}

	h1 {
		font-size: 18px;
		font-weight: normal;
		margin: 50px 0;
		text-align: center;
		width: 100%;
	}

	h2 {
		font-size: 16px;
		font-weight: 500;
	}

	.whats-new-section {
		margin-bottom: 50px;

		img {
			border-bottom: 1px solid #eee;
			margin-top: 10px;
			max-width: 100%;

			@include dark {
				border-bottom: 1px solid #444;
			}
		}
	}

	.whats-new-actions {
		padding-top: 25px;
		text-align: center;
		width: 100%;

		a {
			color: #258cdb;
			font-size: 15px;
			margin: 0 15px;
			text-decoration: none;

			@include dark {
				color: #f27e02;
			}

			&.actions-show-more {
				border: 1px solid #258cdb;
				border-radius: 4px;
				padding: 6px 12px;

				@include dark {
					border-color: #f27e02;
				}
			}
		}

		p {
			margin-top: 45px;
		}
	}
}
</style>