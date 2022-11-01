<template>
	<div class="ui-icon" :data-name="name" v-html="content"></div>
</template>

<script>
let icons = {
	'ActivityIcon': require('feather-icons/dist/icons/activity.svg?raw'),
	'AlertCircleIcon': require('feather-icons/dist/icons/alert-circle.svg?raw'),
	'AlertTriangleIcon': require('feather-icons/dist/icons/alert-triangle.svg?raw'),
	'ArrowDownCircleIcon': require('feather-icons/dist/icons/arrow-down-circle.svg?raw'),
	'CheckCircleIcon': require('feather-icons/dist/icons/check-circle.svg?raw'),
	'ChevronDownIcon': require('feather-icons/dist/icons/chevron-down.svg?raw'),
	'ChevronLeftIcon': require('feather-icons/dist/icons/chevron-left.svg?raw'),
	'ChevronRightIcon': require('feather-icons/dist/icons/chevron-right.svg?raw'),
	'ChevronUpIcon': require('feather-icons/dist/icons/chevron-up.svg?raw'),
	'ClockIcon': require('feather-icons/dist/icons/clock.svg?raw'),
	'CpuIcon': require('feather-icons/dist/icons/cpu.svg?raw'),
	'DatabaseIcon': require('feather-icons/dist/icons/database.svg?raw'),
	'DiscIcon': require('feather-icons/dist/icons/disc.svg?raw'),
	'Edit2Icon': require('feather-icons/dist/icons/edit-2.svg?raw'),
	'GithubIcon': require('feather-icons/dist/icons/github.svg?raw'),
	'HashIcon': require('feather-icons/dist/icons/hash.svg?raw'),
	'HeartIcon': require('feather-icons/dist/icons/heart.svg?raw'),
	'HelpCircleIcon': require('feather-icons/dist/icons/help-circle.svg?raw'),
	'ImageIcon': require('feather-icons/dist/icons/image.svg?raw'),
	'InfoIcon': require('feather-icons/dist/icons/info.svg?raw'),
	'LayersIcon': require('feather-icons/dist/icons/layers.svg?raw'),
	'LinkIcon': require('feather-icons/dist/icons/link.svg?raw'),
	'ListIcon': require('feather-icons/dist/icons/list.svg?raw'),
	'LockIcon': require('feather-icons/dist/icons/lock.svg?raw'),
	'MailIcon': require('feather-icons/dist/icons/mail.svg?raw'),
	'MapIcon': require('feather-icons/dist/icons/map.svg?raw'),
	'MenuIcon': require('feather-icons/dist/icons/menu.svg?raw'),
	'PaperclipIcon': require('feather-icons/dist/icons/paperclip.svg?raw'),
	'PercentIcon': require('feather-icons/dist/icons/percent.svg?raw'),
	'PieChartIcon': require('feather-icons/dist/icons/pie-chart.svg?raw'),
	'SearchIcon': require('feather-icons/dist/icons/search.svg?raw'),
	'SettingsIcon': require('feather-icons/dist/icons/settings.svg?raw'),
	'ShareIcon': require('feather-icons/dist/icons/share.svg?raw'),
	'SlashIcon': require('feather-icons/dist/icons/slash.svg?raw'),
	'SmileIcon': require('feather-icons/dist/icons/smile.svg?raw'),
	'StarIcon': require('feather-icons/dist/icons/star.svg?raw'),
	'TerminalIcon': require('feather-icons/dist/icons/terminal.svg?raw'),
	'Trash2Icon': require('feather-icons/dist/icons/trash-2.svg?raw'),
	'TwitterIcon': require('feather-icons/dist/icons/twitter.svg?raw'),
	'UserIcon': require('feather-icons/dist/icons/user.svg?raw'),
	'UsersIcon': require('feather-icons/dist/icons/users.svg?raw'),
	'XIcon': require('feather-icons/dist/icons/x.svg?raw'),
	'XCircleIcon': require('feather-icons/dist/icons/x-circle.svg?raw'),
	'ZapIcon': require('feather-icons/dist/icons/zap.svg?raw')
}

export default {
	name: 'Icon',
	props: [ 'name' ],
	computed: {
		content() {
			return icons[this.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Icon']
        }
	}
}
</script>

<style lang="scss">
.ui-icon {
	display: inline-block;
	height: 1em;
	width: 1em;
	vertical-align: -0.125em;

	svg {
		display: block;
		height: 100%;
		width: 100%;
	}
}
</style>