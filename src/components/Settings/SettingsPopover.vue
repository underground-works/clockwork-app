<template>
	<div class="popover-container settings-container" v-click-outside="close">
		<a href="#" title="Settings" @click.prevent="toggle">
			<font-awesome-icon icon="cog"></font-awesome-icon>
		</a>
		<div class="popover right-aligned" v-show="show">
			<div class="popover-content">
				<div class="controls-group">
					<label for="settings-editor">Code editor</label>

					<select id="settings-editor" v-model="$settings.editor">
						<option value="atom">Atom</option>
						<option value="phpstorm">PhpStorm</option>
						<option value="sublime">Sublime Text</option>
						<option value="textmate">Textmate</option>
						<option value="vs-code">Visual Studio Code</option>
					</select>

					<div class="help-text" v-show="$settings.editor == 'atom'">
						Requires <a href="https://atom.io/packages/open" target="_blank">Atom Open</a> package.
					</div>
					<div class="help-text" v-show="$settings.editor == 'sublime'">
						Requires <a href="https://github.com/asuth/subl-handler" target="_blank">subl-handler</a>.
					</div>
				</div>

				<div class="controls-group">
					<label for="settings-local-path-map">Local path map</label>

					<div class="controls-input-vgroup">
						<input type="text" name="settings-local-path-map-real" v-model="$settings.localPathMapReal" placeholder="/real/path">
						<input type="text" name="settings-local-path-map-local" v-model="$settings.localPathMapLocal" placeholder="/local/path">
					</div>

					<div class="help-text">
						Map real to local path for the code editor links.
					</div>
				</div>

				<div class="controls-group">
					<label>
						<input type="checkbox" v-model="$settings.showIncomingRequests">
						Automatically show incoming requests
					</label>
				</div>

				<div class="controls-group settings-save">
					<button @click="save">
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SettingsPopover',
	data: () => ({
		show: false
	}),
	methods: {
		close() {
			this.show = false
		},
		toggle() {
			if (! this.show) this.$settings.reload()
			this.show = ! this.show
		},
		save() {
			this.$settings.save()
			this.show = false
		}
	}
}
</script>

<style lang="scss">
.settings-container {
	.popover {
		right: -11px !important;
		top: 14px;

    	.popover-content {
		    padding: 6px 18px;
		    text-align: left;

	    	a {
				padding: 0;
			}
		}
	}

	.controls-group {
		margin: 8px 0 14px;
	}

	.controls-input-vgroup {
		font-size: 90%;

		input {
			border: 1px solid #ccc;
			padding: 1px 4px;
		}

		input:first-child {
			border-radius: 4px 4px 0 0;
		}

		input:last-child {
			border-radius: 0 0 4px 4px;
		    margin-top: -2px;
		}
	}

	.help-text {
		font-size: 80%;
		margin-top: 8px;
	}

	label {
		display: block;
		font-size: 90%;
		margin-bottom: 6px;
	}

	input, select {
		font-size: 90%;
		margin: 0 -6px;
		width: calc(100% + 12px);

		body.dark & { color: rgb(233, 233, 233); }

		&[type="checkbox"] {
			margin-right: 3px;
			width: auto;
		}
	}

	input {
		body.dark & {
			background: rgb(113, 112, 111);
			border-color: rgb(124, 122, 120);

			&::placeholder {
				color: rgb(147, 146, 145);
				opacity: 1;
			}
		}
	}

	select {
		body.dark & {
			background: rgb(106, 104, 102);
			border: 1px solid rgb(124, 122, 120);
			border-radius: 5px;
		}
	}

	.settings-save {
		text-align: center;
	}

	button {
		background: transparent;
		border: none;
		color: #258cdb;
		font-size: 90%;

		body.dark & {
			color: #f27e02;
		}
	}
}
</style>
