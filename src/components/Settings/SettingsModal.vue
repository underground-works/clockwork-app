<template>
	<transition name="settings">
		<div class="settings-modal" v-show="$settings.shown">
			<div class="settings-warning" v-if="! $settings.persistent">
				<div class="warning-text">
					<span class="warning-label">Warning</span>
					<span>Settings can't be saved.</span>
					<a href="#" @click.prevent="showPersistWarning = true">More info</a>
				</div>
				<div class="warning-details" v-if="showPersistWarning">
					Clockwork uses the "local storage" api to persist your settings. Please make sure the access to "local storage" is allowed for this app.
				</div>
			</div>

			<div class="controls-group">
				<label for="settings-editor">Appearance</label>

				<div class="controls">
					<div class="appearance-controls">
						<div class="option" :class="{'selected': $settings.global.appearance == 'auto'}" @click="setAppearance('auto')">
							<img src="img/appearance-auto-icon.png">
							Auto
						</div>

						<div class="option" :class="{'selected': $settings.global.appearance == 'light'}" @click="setAppearance('light')">
							<img src="img/appearance-light-icon.png">
							Light
						</div>

						<div class="option" :class="{'selected': $settings.global.appearance == 'dark'}" @click="setAppearance('dark')">
							<img src="img/appearance-dark-icon.png">
							Dark
						</div>
					</div>
				</div>
			</div>

			<div class="controls-group">
				<label for="settings-editor">Code editor</label>

				<div class="controls">
					<select id="settings-editor" v-model="$settings.global.editor" @change="save">
						<option value="atom">Atom</option>
						<option value="phpstorm">PhpStorm</option>
						<option value="sublime">Sublime Text</option>
						<option value="textmate">Textmate</option>
						<option value="vs-code">Visual Studio Code</option>
					</select>

					<div class="help-text" v-show="$settings.global.editor == 'atom'">
						Requires <a href="https://atom.io/packages/open" target="_blank">Atom Open</a> package.
					</div>
					<div class="help-text" v-show="$settings.global.editor == 'sublime'">
						Requires <a href="https://github.com/asuth/subl-handler" target="_blank">subl-handler</a>.
					</div>
				</div>
			</div>

			<div class="controls-group">
				<label for="settings-local-path-map">Code path</label>

				<div class="controls">
					<div class="controls-input-vgroup">
						<input type="text" name="settings-local-path-map-real" v-model="$settings.site.localPathMap.real" placeholder="/real/path" @change="save">
						<input type="text" name="settings-local-path-map-local" v-model="$settings.site.localPathMap.local" placeholder="/local/path" @change="save">
					</div>

					<div class="help-text">
						Map a remote path to a local path when developing on a remote server or a virtual machine.
					</div>
				</div>
			</div>

			<div class="controls-group">
				<label></label>

				<div class="controls">
					<label class="controls-checkbox">
						<input type="checkbox" v-model="$settings.global.showIncomingRequests" @change="save">
						Automatically show incoming requests
					</label>
				</div>
			</div>

			<div class="controls-group">
				<label></label>

				<div class="controls">
					<label class="controls-checkbox">
						<input type="checkbox" v-model="$settings.global.hideCommandTypeRequests" @change="save">
						Hide commands in requests list
					</label>
					<label class="controls-checkbox">
						<input type="checkbox" v-model="$settings.global.hideQueueJobTypeRequests" @change="save">
						Hide queue jobs in requests list
					</label>
					<label class="controls-checkbox">
						<input type="checkbox" v-model="$settings.global.hideTestTypeRequests" @change="save">
						Hide tests in requests list
					</label>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'SettingsModal',
	data: () => ({
		showPersistWarning: false
	}),
	methods: {
		setAppearance(appearance) {
			this.$settings.global.appearance = appearance
			this.save()
		},

		save() {
			this.$settings.save()
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.settings-modal {
	background: #fff;
	border: 1px solid rgb(209, 209, 209);
	border-radius: 5px;
	box-shadow: 0 0 4px #e5e5e5;
	font-size: 13px;
	left: 5%;
	max-width: 600px;
	padding: 30px 35px 1px;
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

	a {
		padding: 0;
	}

	.controls-group {
		display: flex;
		margin: 22px 0;

		.controls { flex: 1; }
	}

	.help-text {
		font-size: 90%;
		margin-top: 8px;
	}

	label {
		margin-right: 10px;
		margin-top: 5px;
		text-align: right;
		width: 25%;
	}

	input, select {
		border: 1px solid #ccc;
		font-size: 13px;
		height: 26px;

		@include dark {
			background: rgb(93, 92, 91);
			border-color: rgb(124, 122, 120);
			color: rgb(233, 233, 233);

			&::placeholder {
				color: rgb(167, 166, 165);
				opacity: 1;
			}
		}

		&[type="checkbox"] {
			height: auto;
			margin: 0 3px 0 0;
			vertical-align: middle;
		}
	}

	select {
		@include dark {
			background: rgb(106, 104, 102);
			border: 1px solid rgb(124, 122, 120);
			border-radius: 5px;
		}
	}

	.controls-input-vgroup {
		input {
			border: 1px solid #ccc;
			padding: 4px 8px;
			width: 100%;
		}

		input:first-child {
			border-radius: 4px 4px 0 0;
		}

		input:last-child {
			border-radius: 0 0 4px 4px;
			margin-top: -2px;
		}
	}

	.controls-checkbox {
		display: inline-block;
		margin-bottom: 10px;
		margin-top: 0;
		text-align: left;
		width: 100%;

		&:last-child {
			margin: 0;
		}
	}

	.appearance-controls {
		display: flex;

		.option {
			flex: 0;
			margin-right: 12px;
			text-align: center;

			&.selected {
				img {
					@include dark {
						border: 2px solid #f27e02;
						box-shadow: 0 0 2px #f27e02;
					}

					border: 2px solid #258cdb;
					box-shadow: 0 0 2px #258cdb;
				}
			}

			img {
				border: 1px solid #ccc;
				border-radius: 4px;
				height: 50px;
				width: 75px;

				@include dark {
					border: 1px solid #363636;
				}
			}
		}
	}

	.settings-warning {
		background: rgb(255, 235, 235);
		color: rgb(197, 31, 36);
		margin-left: -35px;
		padding: 10px 15px;
		width: calc(100% + 70px);

		.warning-text {
			display: flex;
		}

		.warning-details {
			font-size: 90%;
			margin-top: 5px;
		}

		.warning-label {
			border: 1px solid hsl(358, 55%, 70%);
			border-radius: 6px;
			color: hsl(358, 55%, 70%);
			font-size: 90%;
			font-weight: 500;
			margin-right: 5px;
			text-transform: uppercase;
			padding: 1px 3px;
		}

		a {
			color: hsl(358, 55%, 70%);
			margin-left: auto;
		}

		@include dark {
			background: hsl(0, 100%, 11%);
			color: rgb(237, 121, 122);

			.warning-label {
				border: 1px solid hsl(359, 38%, 62%);
				color: hsl(359, 38%, 62%);
			}

			a {
				color: hsl(359, 38%, 62%);
			}
		}
	}
}

.settings-enter-active, .settings-leave-active {
	transition: top .33s;
}

.settings-enter, .settings-leave-to {
	top: -500px;
}
</style>
