<template>
	<div class="popover right-aligned sharing-popover">
		<div class="popover-content" v-show="$sharing.shown">
			<a href="#" class="sharing-button" @click.prevent="share">
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

			<div class="sharing-content">
				<label class="content-item">
					<span class="item-text">All</span>
					<input type="checkbox" v-model="filterAll">
				</label>
				<label class="content-item">
					<span class="item-text">Performance</span>
					<input type="checkbox" checked disabled>
				</label>
				<label class="content-item">
					<span class="item-text">Log</span>
					<input type="checkbox" v-model="filter.log">
				</label>
				<label class="content-item">
					<span class="item-text">Events</span>
					<input type="checkbox" v-model="filter.events">
				</label>
				<label class="content-item">
					<span class="item-text">Database</span>
					<input type="checkbox" v-model="filter.database">
				</label>
				<label class="content-item">
					<span class="item-text">Cache</span>
					<input type="checkbox" v-model="filter.cache">
				</label>
				<label class="content-item">
					<span class="item-text">Redis</span>
					<input type="checkbox" v-model="filter.redis">
				</label>
				<label class="content-item">
					<span class="item-text">Queue</span>
					<input type="checkbox" v-model="filter.queue">
				</label>
				<label class="content-item">
					<span class="item-text">Views</span>
					<input type="checkbox" v-model="filter.views">
				</label>
				<label class="content-item">
					<span class="item-text">Emails</span>
					<input type="checkbox" v-model="filter.emails">
				</label>
				<label class="content-item">
					<span class="item-text">Routes</span>
					<input type="checkbox" v-model="filter.routes">
				</label>
				<label class="content-item">
					<span class="item-text">Output</span>
					<input type="checkbox" v-model="filter.output">
				</label>
				<label class="content-item">
					<span class="item-text">Custom tabs</span>
					<input type="checkbox" v-model="filter.userData">
				</label>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SharingPopover',
	data: () => ({
		filter: {
			log: true,
			events: true,
			database: true,
			cache: true,
			redis: true,
			queue: true,
			views: true,
			emails: true,
			routes: true,
			output: true,
			userData: true
		},

		isCopied: false
	}),
	computed: {
		filterAll: {
			get() { return Object.values(this.filter).every(Boolean) },
			set(checked) { Object.keys(this.filter).forEach(key => this.filter[key] = checked) }
		}
	},
	methods: {
		share() {
			this.$sharing.share(this.$request, this.filter).then(() => {
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
		"$sharing.shown": function () { this.isCopied = false }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.sharing-popover {
	font-size: 12px;
	right: -8px !important;
	width: 200px !important;

	.popover-content {
		max-height: 260px !important;
		padding: 0 20px !important;
	}

	.sharing-content {
		margin: 20px 0;
		text-align: left;

		.content-item {
			align-items: center;
			background: whitesmoke;
			border-radius: 4px;
			display: flex;
			font-size: 11px;
			margin: 6px 0;
			padding: 5px 10px;

			@include dark {
				background: #1b1b1b;
			}

			.item-text {
				flex: 1;
			}

			input {
				margin: 0;
			}
		}
	}

	.sharing-button {
		align-items: center;
		background: transparent;
		border: 1px solid #258cdb;
		border-radius: 4px;
		color: #258cdb;
		display: flex;
		font-size: 13px;
		height: 32px;
		justify-content: center;
		margin: 20px 0;
		text-decoration: none;
		width: 100%;

		@include dark {
			border: 1px solid #f27e02;
			color: #f27e02;
		}

		.sk-spinner {
			margin-right: 6px;
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
