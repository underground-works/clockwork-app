<template>
	<div class="ui-icon" :data-name="name" v-html="content"></div>
</template>

<script>
import ActivityIcon from 'feather-icons/dist/icons/activity.svg?raw'
import AlertCircleIcon from 'feather-icons/dist/icons/alert-circle.svg?raw'
import AlertTriangleIcon from 'feather-icons/dist/icons/alert-triangle.svg?raw'
import ArrowDownCircleIcon from 'feather-icons/dist/icons/arrow-down-circle.svg?raw'
import CheckCircleIcon from 'feather-icons/dist/icons/check-circle.svg?raw'
import ChevronDownIcon from 'feather-icons/dist/icons/chevron-down.svg?raw'
import ChevronLeftIcon from 'feather-icons/dist/icons/chevron-left.svg?raw'
import ChevronRightIcon from 'feather-icons/dist/icons/chevron-right.svg?raw'
import ChevronUpIcon from 'feather-icons/dist/icons/chevron-up.svg?raw'
import ClockIcon from 'feather-icons/dist/icons/clock.svg?raw'
import CompassIcon from 'feather-icons/dist/icons/compass.svg?raw'
import CpuIcon from 'feather-icons/dist/icons/cpu.svg?raw'
import DatabaseIcon from 'feather-icons/dist/icons/database.svg?raw'
import DiscIcon from 'feather-icons/dist/icons/disc.svg?raw'
import DownloadCloudIcon from 'feather-icons/dist/icons/download-cloud.svg?raw'
import Edit2Icon from 'feather-icons/dist/icons/edit-2.svg?raw'
import GithubIcon from 'feather-icons/dist/icons/github.svg?raw'
import HashIcon from 'feather-icons/dist/icons/hash.svg?raw'
import HeartIcon from 'feather-icons/dist/icons/heart.svg?raw'
import HelpCircleIcon from 'feather-icons/dist/icons/help-circle.svg?raw'
import ImageIcon from 'feather-icons/dist/icons/image.svg?raw'
import InfoIcon from 'feather-icons/dist/icons/info.svg?raw'
import LayersIcon from 'feather-icons/dist/icons/layers.svg?raw'
import LinkIcon from 'feather-icons/dist/icons/link.svg?raw'
import ListIcon from 'feather-icons/dist/icons/list.svg?raw'
import LockIcon from 'feather-icons/dist/icons/lock.svg?raw'
import MailIcon from 'feather-icons/dist/icons/mail.svg?raw'
import MapIcon from 'feather-icons/dist/icons/map.svg?raw'
import MenuIcon from 'feather-icons/dist/icons/menu.svg?raw'
import PaperclipIcon from 'feather-icons/dist/icons/paperclip.svg?raw'
import PercentIcon from 'feather-icons/dist/icons/percent.svg?raw'
import PieChartIcon from 'feather-icons/dist/icons/pie-chart.svg?raw'
import SearchIcon from 'feather-icons/dist/icons/search.svg?raw'
import SettingsIcon from 'feather-icons/dist/icons/settings.svg?raw'
import ShareIcon from 'feather-icons/dist/icons/share.svg?raw'
import SlashIcon from 'feather-icons/dist/icons/slash.svg?raw'
import SmileIcon from 'feather-icons/dist/icons/smile.svg?raw'
import StarIcon from 'feather-icons/dist/icons/star.svg?raw'
import TerminalIcon from 'feather-icons/dist/icons/terminal.svg?raw'
import Trash2Icon from 'feather-icons/dist/icons/trash-2.svg?raw'
import TwitterIcon from 'feather-icons/dist/icons/twitter.svg?raw'
import UploadCloudIcon from 'feather-icons/dist/icons/upload-cloud.svg?raw'
import UserIcon from 'feather-icons/dist/icons/user.svg?raw'
import UsersIcon from 'feather-icons/dist/icons/users.svg?raw'
import XIcon from 'feather-icons/dist/icons/x.svg?raw'
import XCircleIcon from 'feather-icons/dist/icons/x-circle.svg?raw'
import ZapIcon from 'feather-icons/dist/icons/zap.svg?raw'

let icons = {
	ActivityIcon, AlertCircleIcon, AlertTriangleIcon, ArrowDownCircleIcon, CheckCircleIcon, ChevronDownIcon,
	ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ClockIcon, CompassIcon, CpuIcon, DatabaseIcon, DiscIcon,
	DownloadCloudIcon, Edit2Icon, GithubIcon, HashIcon, HeartIcon, HelpCircleIcon, ImageIcon, InfoIcon, LayersIcon,
	LinkIcon, ListIcon, LockIcon, MailIcon, MapIcon, MenuIcon, PaperclipIcon, PercentIcon, PieChartIcon, SearchIcon,
	SettingsIcon, ShareIcon, SlashIcon, SmileIcon, StarIcon, TerminalIcon, Trash2Icon, TwitterIcon, UploadCloudIcon,
	UserIcon, UsersIcon, XIcon, XCircleIcon, ZapIcon
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