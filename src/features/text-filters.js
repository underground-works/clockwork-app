import { format as formatDate } from 'date-fns'
import Vue from 'vue'

export default class TextFilters
{
	register(app) {
 		app.mixin({ methods: {
 			$date: this.date,
 			$join: this.join,
 			$round: this.round,
 			$shortClass: this.shortClass,
 			$title: this.title
 		} })
 	}

	date(input, format) {
		return formatDate(new Date(input), format)
	}

	join(input, glue = ', ') {
		return (input instanceof Array) ? input.join(glue) : input
	}

	round(input, precision = 0) {
		return parseFloat(parseFloat(input).toFixed(precision))
	}

	shortClass(className) {
		return className ? className.split('\\').pop() : ''
	}

	title(input) {
		if (typeof input != 'string') return input

		return input.replace(/(\w)([A-Z])/, '$1 $2')
			.split(' ')
			.map(i => i[0].toUpperCase() + i.substr(1).toLowerCase())
			.join(' ')
	}
}
