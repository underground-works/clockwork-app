<template>
	<div class="sidebar-section">
		<div class="section-header">
			<div class="header-title" @click="toggle">
				<font-awesome-icon :icon="expanded ? 'angle-down' : 'angle-up'"></font-awesome-icon>
				{{title}}
			</div>

			<div class="header-group">
				<div class="header-search">
					<input type="search" v-model="filter.input" placeholder="Search...">
					<font-awesome-icon icon="search"></font-awesome-icon>
				</div>
			</div>
		</div>

		<slot name="content" :expanded="expanded">
			<div v-show="expanded">
				<slot name="above-table"></slot>
			</div>
			<slot name="table" :items="items" :filter="filter" :filter-example="filterExample" :expanded="expanded">
				<details-table :columns="['Key', 'Value']" :items="items" :filter="filter" :filter-example="filterExample" :no-header="true" :no-table-head="true" v-show="expanded">
					<template slot="body" slot-scope="{ items }">
						<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
							<td colspan="2">
								<div class="key">{{item.name}}</div>
								<div class="value"><pretty-print :data="item.value"></pretty-print></div>
							</td>
						</tr>
					</template>
				</details-table>
			</slot>
		</slot>
	</div>
</template>

<script>
import DetailsTable from './DetailsTable'
import PrettyPrint from './PrettyPrint'

import Filter from '../../features/filter'

export default {
	name: 'SidebarSection',
	components: { DetailsTable, PrettyPrint },
	props: [ 'title', 'name', 'filterExample', 'items' ],
	data: () => ({
		filter: new Filter([ { tag: 'name' } ])
	}),
	computed: {
		expanded() {
			return this.$settings.global.requestSidebarCollapsedSections[this.name] !== false
		}
	},
	methods: {
		toggle() {
			this.$settings.global.requestSidebarCollapsedSections[this.name] = ! this.expanded
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.sidebar-section {
	.section-header {
		align-items: center;
		background: #fff;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 8px 8px 0 0;
		display: flex;
		font-size: 14px;
		justify-content: space-between;
		padding: 8px 8px 8px 12px;

		.header-title {
			cursor: pointer;
			flex: 1;
			font-size: 13px;
			font-weight: 600;
			margin-right: 10px;

			.fa-angle-down, .fa-angle-up {
				color: #111;
				font-size: 85%;
				margin-right: 5px;
			}
		}

		.header-search {
			position: relative;

			input {
				background: #eee;
				border: 0;
				border-radius: 4px;
				font-size: 13px;
				height: 24px;
				padding-left: 30px;
				width: 180px;

				@include dark {
					background: rgb(93, 92, 91);
					color: rgb(233, 233, 233);

					&::placeholder {
						color: rgb(167, 166, 165);
						opacity: 1;
					}
				}
			}

			.fa-search {
				left: 7px;
				position: absolute;
				top: 5px;
			}
		}
	}

	.details-table {
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		border-radius: 0;
		box-shadow: none;
		margin-bottom: 0;
		padding-bottom: 0;

		td {
			vertical-align: top;

			.key {
				font-size: 11px;
				font-weight: 600;
				margin-bottom: 3px;
				white-space: nowrap;
			}

			.value {
				word-break: break-all;
			}
		}
	}
}
</style>
