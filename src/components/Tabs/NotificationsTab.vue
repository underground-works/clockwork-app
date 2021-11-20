<template>
	<div v-if="active">
		<details-table title="Notifications" icon="mail" :columns="columns" :items="$request.notifications" :filter="filter" filter-example="&quot;User Registration&quot; to:its@underground.works" class="notifications-notifications">
			<template slot="body" slot-scope="{ items }">
				<template v-for="notification, index in items">
					<tr :key="`${$request.id}-notifications-${index}`">
						<td v-if="columns.includes('Type')">{{notification.type|title}}</td>
						<td>{{notification.to|join(', ')}}</td>
						<td class="notification-subject">
							<div class="subject-content">
								<div class="content-text">
									{{notification.subject}}
								</div>

								<stack-trace class="content-trace" :trace="notification.trace" :file="notification.file" :line="notification.line"></stack-trace>
							</div>
						</td>
						<td class="notification-actions">
							<a href="#" @click.prevent="showNotification = notification" title="Show message" v-if="notification.content">
								<icon name="search"></icon>
							</a>

							<a href="#" @click.prevent="notification.isShowingDetails = ! notification.isShowingDetails" title="Show details">
								<icon :name="notification.isShowingDetails ? 'chevron-up' : 'chevron-down'"></icon>
							</a>
						</td>
					</tr>

					<tr class="notifications-details" v-if="notification.isShowingDetails" :key="`${$request.id}-notifications-details-${index}`">
						<td :colspan="columns.length">
							<div class="details-row">
								<div class="row-group" v-if="notification.to">
									<h4>To</h4>
									<span>{{notification.to|join(', ')}}</span>
								</div>
								<div class="row-group" v-if="notification.data.cc">
									<h4>CC</h4>
									<span>{{notification.data.cc|join(', ')}}</span>
								</div>
								<div class="row-group" v-if="notification.data.bcc">
									<h4>BCC</h4>
									<span>{{notification.data.bcc|join(', ')}}</span>
								</div>
								<div class="row-group" v-if="notification.from">
									<h4>From</h4>
									<span>{{notification.from|join(', ')}}</span>
								</div>
								<div class="row-group" v-if="notification.data.replyTo">
									<h4>Reply To</h4>
									<span>{{notification.data.replyTo|join(', ')}}</span>
								</div>
							</div>
							<div class="details-row">
								<div class="row-group">
									<h4>Subject</h4>
									<pretty-print :data="notification.subject"></pretty-print>
								</div>
							</div>
							<div class="details-row" v-for="value, name in additionalData(notification.data)" v-if="value">
								<div class="row-group">
									<h4>{{name|title}}</h4>
									<pretty-print :data="value"></pretty-print>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</template>
		</details-table>

		<message-modal :message.sync="showNotification"></message-modal>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import DetailsTableFilterToggle from '../UI/DetailsTableFilterToggle'
import MessageModal from './Notifications/MessageModal'
import PrettyPrint from '../UI/PrettyPrint'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

import omit from 'just-omit'

export default {
	name: 'notificationsTab',
	components: { DetailsTable, DetailsTableFilterToggle, MessageModal, PrettyPrint, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'to' }
		]),

		showNotification: null
	}),
	computed: {
		columns() {
			let columns = [ 'To', 'Subject', '' ]

			let hasMultipleTypes = (new Set(this.$request.notifications.map(notification => notification.type))).size > 1

			if (hasMultipleTypes) columns.splice(1, 0, 'Type')

			return columns
		}
	},
	methods: {
		additionalData(data) { return omit(data, [ 'cc', 'bcc', 'replyTo' ]) }
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.notifications-notifications {
	.notification-subject {
		width: 100%;

		.subject-content {
			display: flex;
			flex-wrap: wrap;
			width: 100%;

			.content-trace {
				margin-left: auto;
			}
		}
	}

	.notification-actions {
		white-space: nowrap;

		a {
			margin-left: 5px;
		}
	}

	.notifications-details {
		td {
			padding: 0 20px 10px !important;
		}

		h4 {
			color: #333;
			font-size: 90%;
			font-weight: 600;
			margin: 0 0 3px;

			@include dark {
				color: #b2b2b2;
			}
		}

		.details-row {
			display: flex;
			margin-top: 12px;

			&:first-child {
				margin-top: 6px;
			}

			.row-group {
				margin-right: 15px;

				&:last-child { margin-right: 0; }

				&.group-query {
					flex: 1;
				}
			}
		}
	}

	tr {
		background: hsl(240, 20, 99) !important;
		@include dark { background: hsl(240, 2, 15) !important; }

		&:nth-child(4n), &:nth-child(4n-1) {
			background: hsl(240, 20, 96) !important;
			@include dark { background: hsl(240, 2, 13) !important; }
		}
	}
}
</style>
