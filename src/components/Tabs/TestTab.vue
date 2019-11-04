<template>
	<div class="request-tab test-tab">
		<div class="test-status-message" v-if="$request.testStatusMessage">
			{{$request.testStatusMessage}}
		</div>

		<sidebar-section title="Asserts" name="asserts" :items="asserts" filter-example="text/html name:Accept" v-show="asserts.length">
			<template slot="table" slot-scope="{ items, filter, filterExample, expanded }">
				<details-table :columns="['Assert']" :items="items" :filter="filter" :filter-example="filterExample" :no-header="true" v-show="expanded">
					<template slot="header" slot-scope="{ filter }">
					</template>
					<template slot="body" slot-scope="{ items }">
						<tr v-for="item, index in items" :key="`${$request.id}-${index}`">
							<td class="value test-assert">
								<div class="test-assert-name" :class="{'assert-failed': ! item.passed}">{{item.name}}</div>
								<pretty-print :data="item.arguments"></pretty-print>
							</td>
						</tr>
					</template>
				</details-table>
			</template>
		</sidebar-section>
	</div>
</template>

<script>
import DetailsTable from '../UI/DetailsTable'
import PrettyPrint from '../UI/PrettyPrint'
import SidebarSection from '../UI/SidebarSection'
import StackTrace from '../UI/StackTrace'

export default {
	name: 'TestTab',
	components: { DetailsTable, PrettyPrint, SidebarSection, StackTrace },
	computed: {
		asserts() {
			return this.$request.testAsserts.reverse()
		}
	}
}
</script>

<style lang="scss">
@import '../../mixins.scss';

.test-tab {
	.test-status-message {
		border-bottom: 1px solid rgb(209, 209, 209);
		background: rgb(255, 235, 235);
		color: rgb(197, 31, 36);
	    padding: 12px 10px;
	    font-size: 13px;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }
	}

	.test-assert-name {
	    font-size: 11px;
	    font-weight: 600;
	    margin-bottom: 3px;
	    white-space: nowrap;
	    margin-bottom: 5px;
	    color: #586336;

	    &.assert-failed {
	    	color: #c51f24;
	    }
	}

	.test-assert {
		.pretty-jason {
			font-size: 11px;
		}
	}
}
</style>