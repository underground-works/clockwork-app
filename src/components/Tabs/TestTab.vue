<template>
	<div class="request-tab test-tab">
		<div class="test-status-message" :class="{'error': $request.isTestError(), 'warning': $request.isTestWarning()}" v-if="$request.testStatusMessage">
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
								<div class="assert-name">
									<div class="assert-name-content" :class="{'assert-failed': ! item.passed}">{{item.name}}</div>
									<div class="assert-name-trace">
										<stack-trace :trace="item.trace"></stack-trace>
									</div>
								</div>
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
	    padding: 12px 10px;
	    font-size: 13px;

		@include dark { border-bottom: 1px solid rgb(54, 54, 54); }

		&.error {
			background: rgb(255, 235, 235);
			color: rgb(197, 31, 36);

			@include dark {
				background: hsl(0, 100%, 11%);
				color: rgb(237, 121, 122);
			}
		}

		&.warning {
			background: rgb(255, 250, 226);
			color: rgb(168, 89, 25);

			@include dark {
				background: hsl(50, 100%, 11%);
				color: rgb(250, 216, 159);
			}
		}
	}

	.test-assert {
		.assert-name {
			display: flex;
			flex-wrap: wrap;

			.assert-name-content {
				flex: 1 0 auto;
			    font-size: 11px;
			    font-weight: 600;
			    margin-bottom: 3px;
				max-width: 100%;
			    white-space: nowrap;
			    margin-bottom: 5px;
			    color: hsla(75, 65%, 30%, 1);

			    @include dark { color: hsl(75, 76%, 70%); }

			    &.assert-failed {
			    	color: #c51f24;

			    	@include dark { color: #ed797a; }
			    }
			}

			.assert-name-trace {
				flex: 0;
			}
		}

		.pretty-jason {
			font-size: 11px;
		}
	}
}
</style>