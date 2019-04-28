import Vue from 'vue'

export default class TextFilters
{
	register () {
		Vue.filter('shortClass', this.shortClass)
	}

	shortClass (className) {
		return className.split('\\').pop()
	}
}
