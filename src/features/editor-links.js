import Vue from 'vue'

export default class EditorLinks
{
	constructor(settings) {
		this.settings = settings
	}

	register() {
		Vue.filter('editorLink', this.filter())
	}

	filter() {
		return (file, line) => {
			let scheme = {
				'atom': (file, line) => `atom://open?url=file://${file}&line=${line}`,
				'phpstorm': (file, line) => `phpstorm://open?url=file://${file}&line=${line}`,
				'sublime': (file, line) => `subl://open?url=file://${file}&line=${line}`,
				'textmate': (file, line) => `txmt://open?url=file://${file}&line=${line}`,
				'vs-code': (file, line) => `vscode://file/${file}:${line}`
			}

			let editor = this.settings.editor

			if (! editor || ! scheme[editor]) return

			if (file && this.settings.localPathMapReal) {
				file = file.replace(this.settings.localPathMapReal, this.settings.localPathMapLocal)
			}

			return scheme[editor](file, line)
		}
	}
}
