<template>
	<div v-show="active">
		<details-table title="Emails" icon="mail" :columns="['To', 'Subject', '']" :items="$request.emails" :filter="filter" filter-example="&quot;User Registration&quot; to:its@underground.works" class="emails-emails">
			<template slot="body" slot-scope="{ items }">
				<template v-for="email, index in items">
					<tr :key="`${$request.id}-emails-${index}`">
						<td>{{email.to.join(', ')}}</td>
						<td class="email-subject">
							<div class="subject-content">
								<div class="content-text">
									{{email.subject}}
								</div>

								<stack-trace class="content-trace" :trace="email.trace" :file="email.file" :line="email.line"></stack-trace>
							</div>
						</td>
						<td>
							<a href="#" @click.prevent="email.isShowingDetails = ! email.isShowingDetails" title="Show details">
								<icon :name="email.isShowingDetails ? 'chevron-up' : 'chevron-down'"></icon>
							</a>
						</td>
					</tr>

					<tr class="emails-details" v-show="email.isShowingDetails" :key="`${$request.id}-emails-details-${index}`">
						<td colspan="3">
							<div class="details-row">
								<div class="row-group" v-if="email.to">
									<h4>To</h4>
									<span>{{email.to.join(', ')}}</span>
								</div>
								<div class="row-group" v-if="email.cc">
									<h4>CC</h4>
									<span>{{email.cc.join(', ')}}</span>
								</div>
								<div class="row-group" v-if="email.bcc">
									<h4>BCC</h4>
									<span>{{email.bcc.join(', ')}}</span>
								</div>
								<div class="row-group" v-if="email.from">
									<h4>From</h4>
									<span>{{email.from.join(', ')}}</span>
								</div>
								<div class="row-group" v-if="email.replyTo">
									<h4>Reply To</h4>
									<span>{{email.replyTo.join(', ')}}</span>
								</div>
							</div>
							<div class="details-row">
								<div class="row-group">
									<h4>Subject</h4>
									<pretty-print :data="email.subject"></pretty-print>
								</div>
							</div>
							<div class="details-row" v-if="email.mailable">
								<div class="row-group">
									<h4>Mailable</h4>
									<pretty-print :data="email.mailable"></pretty-print>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</template>
		</details-table>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import DetailsTableFilterToggle from '../UI/DetailsTableFilterToggle'
import PrettyPrint from '../UI/PrettyPrint'
import StackTrace from '../UI/StackTrace'

import Filter from '../../features/filter'

export default {
	name: 'EmailsTab',
	components: { DetailsTable, DetailsTableFilterToggle, PrettyPrint, StackTrace },
	props: [ 'active' ],
	data: () => ({
		filter: new Filter([
			{ tag: 'to' }
		])
	})
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.emails-emails {
	.email-subject {
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

	.emails-details {
		td {
			padding: 0 14px 10px;
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
			margin-bottom: 8px;

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
		@include dark { background: hsl(240, 2, 14) !important; }

		&:nth-child(4n), &:nth-child(4n-1) {
			background: hsl(240, 20, 97) !important;
			@include dark { background: hsl(240, 2, 13) !important; }
		}
	}
}
</style>
