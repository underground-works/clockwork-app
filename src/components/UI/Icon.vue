<template>
	<div class="ui-icon">
		<component :is="component"></component>
	</div>
</template>

<script>
import AlertCircleIcon from 'feather-icons/dist/icons/alert-circle.svg'
import AlertTriangleIcon from 'feather-icons/dist/icons/alert-triangle.svg'
import ArrowDownCircleIcon from 'feather-icons/dist/icons/arrow-down-circle.svg'
import ChevronDownIcon from 'feather-icons/dist/icons/chevron-down.svg'
import ChevronLeftIcon from 'feather-icons/dist/icons/chevron-left.svg'
import ChevronRightIcon from 'feather-icons/dist/icons/chevron-right.svg'
import ChevronUpIcon from 'feather-icons/dist/icons/chevron-up.svg'
import ClockIcon from 'feather-icons/dist/icons/clock.svg'
import CpuIcon from 'feather-icons/dist/icons/cpu.svg'
import DatabaseIcon from 'feather-icons/dist/icons/database.svg'
import ImageIcon from 'feather-icons/dist/icons/image.svg'
import LayersIcon from 'feather-icons/dist/icons/layers.svg'
import LinkIcon from 'feather-icons/dist/icons/link.svg'
import LockIcon from 'feather-icons/dist/icons/lock.svg'
import MailIcon from 'feather-icons/dist/icons/mail.svg'
import MenuIcon from 'feather-icons/dist/icons/menu.svg'
import PaperclipIcon from 'feather-icons/dist/icons/paperclip.svg'
import PercentIcon from 'feather-icons/dist/icons/percent.svg'
import SearchIcon from 'feather-icons/dist/icons/search.svg'
import SettingsIcon from 'feather-icons/dist/icons/settings.svg'
import SlashIcon from 'feather-icons/dist/icons/slash.svg'
import UserIcon from 'feather-icons/dist/icons/user.svg'
import XCircleIcon from 'feather-icons/dist/icons/x-circle.svg'
import ZapIcon from 'feather-icons/dist/icons/zap.svg'

export default {
	name: 'Icon',
	components: {
		AlertCircleIcon, AlertTriangleIcon, ArrowDownCircleIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
		ChevronUpIcon, ClockIcon, CpuIcon, DatabaseIcon, ImageIcon, LayersIcon, LinkIcon, LockIcon, MailIcon, MenuIcon,
		PaperclipIcon, PercentIcon, SearchIcon, SettingsIcon, SlashIcon, UserIcon, XCircleIcon, ZapIcon
	},
	props: [ 'name' ],
	computed: {
		component() { return this.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Icon' }
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
		height: 100%;
		width: 100%;
	}
}
</style>