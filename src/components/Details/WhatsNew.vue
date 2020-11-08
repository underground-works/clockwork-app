<template>
	<modal icon="star" title="What's new" :shown="$whatsNew.show" :on-close="close">
		<div class="whats-new">
			<div class="whats-new-content">
				<h1>Clockwork has just been updated!</h1>

				<template v-for="note in release.notes">
					<div class="whats-new-section" :class="`image-${note.imagePlacement || 'bottom'}`">
						<img :src="`img/whats-new/${release.version}/${note.image}`" v-if="note.image && (note.imagePlacement || 'bottom') != 'bottom'">

						<h2>{{note.title}}</h2>

						<p v-for="line in note.text">{{line}}</p>

						<img :src="`img/whats-new/${release.version}/${note.image}`" v-if="note.image && (note.imagePlacement || 'bottom') == 'bottom'">
					</div>
				</template>

				<div class="whats-new-actions">
					<a :href="release.url" target="_blank" class="actions-show-more">Learn more</a>
					<a @click.prevent="close" href="#" class="actions-close">Close</a>

					<p><small>Some of the new features might require server-side Clockwork library update.</small></p>
				</div>
			</div>
		</div>
	</modal>
</template>

<script>
import Modal from '../UI/Modal'

import WhatsNew from '../../features/whats-new'

export default {
	name: 'WhatsNew',
	components: { Modal },
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
	font-size: 14px;
	width: 100%;

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

		&.image-left, &.image-right {
			padding-top: 20px;

			&:after {
				clear: both;
				content: '';
				display: block;
			}

			img {
				border-bottom: 0;
				float: left;
				margin-left: -40px;
				margin-top: -20px;
				max-width: 65%;

				@include dark {
					border-bottom: 0;
				}
			}
		}

		&.image-right {
			img {
				float: right;
				margin-left: 0;
				margin-right: -40px;
			}
		}

		&.image-top {
			img {
				border-bottom: 0;
				border-top: 1px solid #eee;
				margin-top: 0;

				@include dark {
					border-bottom: 0;
					border-top: 1px solid #444;
				}
			}

			h2 {
				margin-top: 0;
			}
		}

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