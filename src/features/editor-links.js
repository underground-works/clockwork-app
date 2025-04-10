import { shallowReactive } from 'vue'

export class EditorLinks
{
	constructor(settings) {
		this.settings = settings
	}

	register(app) {
 		app.mixin({ methods: { $editorLink: this.filter() } })
 	}

	filter() {
		return (file, line) => {
			let scheme = {
				'atom': (file, line) => `atom://open?url=file://${file}&line=${line}`,
				'phpstorm': (file, line) => `phpstorm://open?file=${file}&line=${line}`,
				'sublime': (file, line) => `subl://open?url=file://${file}&line=${line}`,
				'textmate': (file, line) => `txmt://open?url=file://${file}&line=${line}`,
				'vs-code': (file, line) => `vscode://file/${file}:${line}`,
				'netbeans': (file, line) => `netbeans://open/?f=${file}:${line}`,
        			'cursor': (file, line) => `cursor://file/${file}:${line}`
			}

			let editor = this.settings.global.editor

			if (! editor || ! scheme[editor]) return

			if (file && this.settings.site.localPathMap.real) {
				file = file.replace(this.settings.site.localPathMap.real, this.settings.site.localPathMap.local)
			}

			return scheme[editor](file, line)
		}
	}
}

export default (...args) => shallowReactive(new EditorLinks(...args))
