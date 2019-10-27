<template>
	<transition name="settings">
		<div class="settings-modal" v-show="$settings.shown">
			<div class="controls-group">
				<label for="settings-editor">Code editor</label>

				<div class="controls">
					<select id="settings-editor" v-model="$settings.global.editor">
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
						<input type="text" name="settings-local-path-map-real" v-model="$settings.site.localPathMap.real" placeholder="/real/path">
						<input type="text" name="settings-local-path-map-local" v-model="$settings.site.localPathMap.local" placeholder="/local/path">
					</div>

					<div class="help-text">
						Map a remote path to a local path when developing on a remote server or a virtual machine.
					</div>
				</div>
			</div>

			<div class="controls-group">
				<label></label>

				<div class="controls">
					<label>
						<input type="checkbox" v-model="$settings.global.showIncomingRequests">
						Automatically show incoming requests
					</label>
				</div>
			</div>

			<div class="actions">
				<button @click="save">
					Save
				</button>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'SettingsModal',
	data: () => ({
	}),
	methods: {
		close() {
			this.$settings.shown = false
		},
		save() {
			this.$settings.save()
			this.$settings.shown = false
		}
	}
}
</script>

<style lang="scss">
.settings-modal {
	background: #fff;
	border: 1px solid rgb(209, 209, 209);
	border-radius: 5px;
	box-shadow: 0 0 4px #e5e5e5;
	font-size: 13px;
	left: 5%;
	padding: 32px 35px 1px;
	position: absolute;
	text-align: left;
	top: 0;
	width: 90%;
	z-index: 300;

	body.dark & {
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

		body.dark & {
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
			margin-right: 3px;
		}
	}

	select {
		body.dark & {
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

	.actions {
		margin: 22px 0;
		text-align: right;

		button {
			background: transparent;
			border: 1px solid #258cdb;
			border-radius: 4px;
			color: #258cdb;
			font-size: 100%;
			padding: 5px 30px;

			body.dark & {
				border: 1px solid #f27e02;
				border-radius: 4px;
				color: #f27e02;
			}
		}
	}
}

.settings-enter-active, .settings-leave-active {
	transition: top .5s;
}

.settings-enter, .settings-leave-to {
	top: -350px;
}
</style>
