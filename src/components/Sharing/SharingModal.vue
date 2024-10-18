<template>
	<modal icon="share" title="Share" v-model:shown="$sharing.shown">
		<div class="sharing-modal">
			<template v-if="$sharing.termsAccepted">
				<div class="sharing-content">
	 				<label class="content-item item-all" :class="{ active: filterAll }">
						<span class="item-text">All</span>
						<input type="checkbox" v-model="filterAll">
					</label>
					<label class="content-item" :class="{ active: filter[section.name] && section.available, unavailable: ! section.available }" v-for="section in sections">
						<icon :name="section.icon"></icon>
						<span class="item-text">{{section.text}}</span>
						<input type="checkbox" v-model="filter[section.name]" :disabled="section.readonly || ! section.available">
					</label>
				</div>

				<p class="error-message" v-if="error">{{errorMessage}}</p>

				<a href="#" class="button" @click.prevent="share">
					<template v-if="isCopied">
						Copied to clipboard!
					</template>
					<template v-else-if="$sharing.inProgress">
						<spinner name="fading-circle" width="18" height="18" :no-fade-in="true" :color="$settings.appearance == 'dark' ? '#f27e02' : '#258cdb'"></spinner>
						Sharing...
					</template>
					<template v-else>
						Share
					</template>
				</a>
			</template>

			<template v-else>
				<div class="sharing-terms">
					<h1><icon name="users"></icon></h1>

					<p>Request will be uploaded to the Clockwork Cloud servers and a unique public link generated for you.</p>

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

					<a href="#" @click.prevent="$sharing.acceptTerms()" class="button">Continue</a>
				</div>
			</template>
		</div>
	</modal>
</template>

<script>
import Modal from '../UI/Modal'

export default {
	name: 'SharingModal',
	components: { Modal },
	data: () => ({
		filter: {
			performance: true,
			log: true,
			events: true,
			models: true,
			database: true,
			cache: true,
			redis: true,
			queue: true,
			views: true,
			notifications: true,
			routes: true,
			output: true,
			userData: true
		},

		isCopied: false,
		error: false
	}),
	computed: {
		sections() {
			return [
				{ text: 'Performance', name: 'performance', icon: 'activity', available: true, readonly: true },
				{ text: 'Log', name: 'log', icon: 'edit-2', available: this.shownSections.log },
				{ text: 'Events', name: 'events', icon: 'zap', available: this.shownSections.events },
				{ text: 'Models', name: 'models', icon: 'disc', available: this.shownSections.models },
				{ text: 'Database', name: 'database', icon: 'database', available: this.shownSections.database },
				{ text: 'Cache', name: 'cache', icon: 'paperclip', available: this.shownSections.cache },
				{ text: 'Redis', name: 'redis', icon: 'layers', available: this.shownSections.redis },
				{ text: 'Queue', name: 'queue', icon: 'clock', available: this.shownSections.queue },
				{ text: 'Views', name: 'views', icon: 'image', available: this.shownSections.views },
				{ text: 'Notifications', name: 'notifications', icon: 'mail', available: this.shownSections.notifications },
				{ text: 'Routes', name: 'routes', icon: 'map', available: this.shownSections.routes },
				{ text: 'Output', name: 'output', icon: 'terminal', available: this.shownSections.output },
				{ text: 'Custom tabs', name: 'userData', icon: 'menu', available: this.$request?.userData?.length }
			]
		},

		shownSections() {
			return {
				log: this.$request?.log?.length > 0,
				models: [ 'modelsRetrieved', 'modelsCreated', 'modelsUpdated', 'modelsDeleted' ].some(prop => this.$request?.[prop])
					|| this.$request?.modelsActions.length > 0,
				database: this.$request?.databaseQueriesCount > 0 || this.$request?.databaseQueries?.length > 0,
				cache: [ 'cacheReads', 'cacheHits', 'cacheWrites', 'cacheDeletes', 'cacheTime' ].some(prop => this.$request?.[prop])
					|| this.$request?.cacheQueries.length > 0,
				redis: this.$request?.redisCommands?.length > 0,
				queue: this.$request?.queueJobs?.length > 0,
				events: this.$request?.events?.length > 0,
				views: this.$request?.viewsData?.events.length > 0,
				notifications: this.$request?.notifications?.length > 0,
				routes: this.$request?.routes?.length > 0,
				output: this.$request?.commandOutput?.length > 0
			}
		},

		filterAll: {
			get() { return this.sections.every(s => ! s.available || this.filter[s.name]) },
			set(checked) { this.sections.filter(s => s.available && ! s.readonly).forEach(s => this.filter[s.name] = checked) }
		},

		errorMessage() {
			if (this.error == 'metadata-too-large') return 'Shared request metadata is too large, please try selecting fewer sections.'
			if (this.error == 'temporarily-unavailable') return 'Share service is temporarily unavailable, please try again later.'

			return 'Unexpected error, please try again later.'
		}
	},
	methods: {
		share() {
			this.$sharing.share(this.$request, this.filter).then(data => {
				if (data && data.error) return this.error = data.error

				this.$copyText(this.$request.shareUrl).then(() => this.isCopied = true)
			})
		}
	},
	watch: {
		filter: {
			handler: function () {
				this.$sharing.clear(this.$request)
				this.isCopied = false
			},
			deep: true
		},

		"$request": function () { this.isCopied = false },
		"$sharing.shown": function () { this.isCopied = this.error = false }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.sharing-modal {
	font-size: 13px;
	max-width: 320px;
	padding-top: 10px;

	.sharing-content {
		display: flex;
		flex-wrap: wrap;
		margin-left: -8px;
		margin-top: 10px;
		width: calc(100% + 16px);

		.content-item {
			align-items: center;
			background: hsl(0deg 0% 95%);
			border-radius: 4px;
			display: flex;
			font-size: 12px;
			margin: 8px 8px;
			max-width: 152px;
			padding: 5px 10px;
			width: 100%;

			@include dark {
				background: #252527;
			}

			&:hover {
				color: rgb(37, 140, 219);

				@include dark {
					color: hsl(31deg 98% 42%);
				}
			}

			&.active {
				background: rgb(39, 134, 243);
				color: #f5f5f5;

				@include dark {
					background: hsl(31deg 98% 42%);
					color: #fff;
				}
			}

			&.unavailable {
				opacity: 0.33;
			}

			&.item-all {
				font-size: 14px;
				margin: 8px 22%;
				max-width: 60%;
				text-align: center;
			}

			.ui-icon {
				margin-right: 5px;
			}

			.item-text {
				flex: 1;
			}

			input {
				display: none;
			}
		}
	}

	.error-message {
		text-align: center;
	}

	.button {
		margin: 30px auto 10px;
		max-width: 60%;

		.sk-spinner {
			margin-right: 6px;
		}
	}

	.sharing-terms {
		h1 {
			font-size: 200%;
			margin: 0;
			text-align: center;
		}

		h2 {
			font-size: 110%;
			margin-top: 25px;
		}

		ul {
			margin-bottom: 25px;
			padding-left: 20px;

			li {
				font-size: 95%;
				margin-bottom: 8px;
			}
		}

		.button {
			margin-top: 35px;
		}
	}
}
</style>
