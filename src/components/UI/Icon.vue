<template>
	<div class="ui-icon">
		<component :is="component"></component>
	</div>
</template>

<script>
import ActivityIcon from 'feather-icons/dist/icons/activity.svg'
import AlertCircleIcon from 'feather-icons/dist/icons/alert-circle.svg'
import AlertTriangleIcon from 'feather-icons/dist/icons/alert-triangle.svg'
import ArrowDownCircleIcon from 'feather-icons/dist/icons/arrow-down-circle.svg'
import CheckCircleIcon from 'feather-icons/dist/icons/check-circle.svg'
import ChevronDownIcon from 'feather-icons/dist/icons/chevron-down.svg'
import ChevronLeftIcon from 'feather-icons/dist/icons/chevron-left.svg'
import ChevronRightIcon from 'feather-icons/dist/icons/chevron-right.svg'
import ChevronUpIcon from 'feather-icons/dist/icons/chevron-up.svg'
import ClockIcon from 'feather-icons/dist/icons/clock.svg'
import CpuIcon from 'feather-icons/dist/icons/cpu.svg'
import DatabaseIcon from 'feather-icons/dist/icons/database.svg'
import DiscIcon from 'feather-icons/dist/icons/disc.svg'
import Edit2Icon from 'feather-icons/dist/icons/edit-2.svg'
import HashIcon from 'feather-icons/dist/icons/hash.svg'
import HelpCircleIcon from 'feather-icons/dist/icons/help-circle.svg'
import ImageIcon from 'feather-icons/dist/icons/image.svg'
import InfoIcon from 'feather-icons/dist/icons/info.svg'
import LayersIcon from 'feather-icons/dist/icons/layers.svg'
import LinkIcon from 'feather-icons/dist/icons/link.svg'
import LockIcon from 'feather-icons/dist/icons/lock.svg'
import MailIcon from 'feather-icons/dist/icons/mail.svg'
import MapIcon from 'feather-icons/dist/icons/map.svg'
import MenuIcon from 'feather-icons/dist/icons/menu.svg'
import PaperclipIcon from 'feather-icons/dist/icons/paperclip.svg'
import PercentIcon from 'feather-icons/dist/icons/percent.svg'
import PieChartIcon from 'feather-icons/dist/icons/pie-chart.svg'
import SearchIcon from 'feather-icons/dist/icons/search.svg'
import SettingsIcon from 'feather-icons/dist/icons/settings.svg'
import ShareIcon from 'feather-icons/dist/icons/share.svg'
import SlashIcon from 'feather-icons/dist/icons/slash.svg'
import SmileIcon from 'feather-icons/dist/icons/smile.svg'
import StarIcon from 'feather-icons/dist/icons/star.svg'
import TerminalIcon from 'feather-icons/dist/icons/terminal.svg'
import Trash2Icon from 'feather-icons/dist/icons/trash-2.svg'
import UserIcon from 'feather-icons/dist/icons/user.svg'
import UsersIcon from 'feather-icons/dist/icons/users.svg'
import XIcon from 'feather-icons/dist/icons/x.svg'
import XCircleIcon from 'feather-icons/dist/icons/x-circle.svg'
import ZapIcon from 'feather-icons/dist/icons/zap.svg'

export default {
	name: 'Icon',
	components: {
		ActivityIcon, AlertCircleIcon, AlertTriangleIcon, ArrowDownCircleIcon, CheckCircleIcon, ChevronDownIcon,
		ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ClockIcon, CpuIcon, DatabaseIcon, DiscIcon, Edit2Icon,
		HashIcon, HelpCircleIcon, ImageIcon, InfoIcon, LayersIcon, LinkIcon, LockIcon, MailIcon, MapIcon, MenuIcon,
		PaperclipIcon, PercentIcon, PieChartIcon, SearchIcon, SettingsIcon, ShareIcon, SlashIcon, SmileIcon, StarIcon,
		TerminalIcon, Trash2Icon, UserIcon, UsersIcon, XIcon, XCircleIcon, ZapIcon
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
		display: block;
		height: 100%;
		width: 100%;
	}
}
</style>