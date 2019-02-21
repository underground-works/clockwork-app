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
		save () {
			this.$settings.save()
			this.show = false
		}
	}
}
</script>
