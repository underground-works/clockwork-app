import Vue from 'vue'

export default class TextFilters
{
	register () {
		Vue.filter('shortClass', this.shortClass)
	}

	shortClass (className) {
		return className && className.split('\\').pop()
	}
}
