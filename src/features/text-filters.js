import Vue from 'vue'

export default class TextFilters
{
	register() {
		Vue.filter('round', this.round)
		Vue.filter('shortClass', this.shortClass)
	}

	round(input, precision = 0) {
		return Number.parseFloat(input).toFixed(precision)
	}

	shortClass(className) {
		return className ? className.split('\\').pop() : ''
	}
}
