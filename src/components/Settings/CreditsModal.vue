<template>
	<modal icon="info" title="Credits" v-model:shown="$credits.shown">
		<div class="credits-modal">
			<h1>Clockwork App</h1>
			<p class="credits-version">Version {{$credits.version}}</p>

			<div>
				<h2>Created by</h2>

				<div class="credits-authors">
					<div class="authors-author" v-for="author in $credits.authors">
						<div class="author-avatar" :style="`background-image:url(${author.avatarUrl};`"></div>
						<div>
							<div class="author-name">{{author.name}}</div>
							<div class="author-links">
								<a :href="author.twitterUrl" target="_blank"><icon name="twitter"></icon></a>
								<a :href="author.githubUrl" target="_blank"><icon name="github"></icon></a>
								<a :href="author.sponsorUrl" target="_blank"><icon name="heart"></icon></a>
							</div>
						</div>
					</div>
				</div>

				<div class="credits-contributors" v-if="credits.app.contributors.length || credits.php.contributors.length">
					<a class="contributors-contributor" :href="contributor.url" target="_blank" :title="contributor.userName" v-for="contributor in credits.app.contributors">
						<div class="contributor-avatar" :style="`background-image:url(${contributor.avatarUrl};`"></div>
					</a>
					<a class="contributors-contributor" :href="contributor.url" target="_blank" :title="contributor.userName" v-for="contributor in credits.php.contributors">
						<div class="contributor-avatar" :style="`background-image:url(${contributor.avatarUrl};`"></div>
					</a>
				</div>
			</div>

			<div v-if="credits.app.sponsors.length">
				<h2>Sponsored by</h2>

				<div class="credits-sponsors">
					<a class="sponsors-sponsor" :href="sponsor.url" target="_blank" :title="sponsor.userName" v-for="sponsor in credits.app.sponsors">
						<div class="sponsor-avatar" :style="`background-image:url(${sponsor.avatarUrl};`"></div>
					</a>
				</div>
			</div>

			<div v-if="credits.app.dependencies.length || credits.php.dependencies.length">
				<h2>Built with</h2>

				<div class="credits-dependencies">
					<h3>Clockwork App</h3>

					<div class="dependencies-dependency" v-for="dependency in credits.app.dependencies">
						<div>
							<a :href="dependency.url" target="_blank">{{dependency.name}}</a>
							by
							<a :href="dependency.authorUrl" target="_blank">{{dependency.author}}</a>
						</div>
						<div class="dependency-description">
							{{dependency.description}}
						</div>
					</div>

					<h3>Clockwork PHP</h3>

					<div class="dependencies-dependency" v-for="dependency in credits.php.dependencies">
						<div>
							<a :href="dependency.url" target="_blank">{{dependency.name}}</a>
							by
							<a :href="dependency.authorUrl" target="_blank">{{dependency.authors|join}}</a>
						</div>
						<div class="dependency-description">
							{{dependency.description}}
						</div>
					</div>
				</div>
			</div>
		</div>
	</modal>
</template>

<script>
import Modal from '../UI/Modal'

export default {
	name: 'CreditsModal',
	components: { Modal },
	computed: {
		credits() { return this.$credits.credits }
	}
}
</script>

<style lang="scss">
@use '../../mixins' as *;

.credits-modal {
	font-size: 13px;
	max-height: 450px;
	max-width: 600px;
	padding-top: 10px;
	width: 90vw;

	.credits-section {
		margin-bottom: 35px;
	}

	h1 {
		font-size: 180%;
		font-weight: 600;
		margin-bottom: 0;
		text-align: center;
	}

	h2 {
		font-size: 120%;
		font-weight: 600;
		margin-bottom: 10px;
		margin-left: 56px;
		margin-top: 30px;
	}

	.credits-version {
		font-size: 85%;
		margin-top: 2px;
		text-align: center;
	}

	.credits-authors, .credits-contributors, .credits-sponsors {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10px;

		.authors-author {
			align-items: center;
			display: flex;
			justify-content: center;
			width: 100%;

			.author-avatar {
				margin-right: 12px;
			}

			.author-name {
				font-size: 110%;
				font-weight: 500;
				margin-bottom: 4px;
			}

			.author-links {
				font-size: 110%;

				a {
					margin-right: 6px;
				}
			}
		}

		.author-avatar, .contributor-avatar, .sponsor-avatar {
			background-color: #fff;
			background-size: cover;
			border-radius: 50%;
			height: 38px;
			margin: 6px;
			width: 38px;
		}
	}

	.credits-dependencies {
		padding-bottom: 40px;
		text-align: center;

		h3 {
			font-size: 100%;
			margin-top: 20px;
		}

		a {
			text-decoration: none;
		}

		.dependencies-dependency {
			margin-bottom: 10px;
		}
	}
}
</style>
