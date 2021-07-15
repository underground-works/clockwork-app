<template>
	<vue-prism :code="code" :language="language" class="highlighted-code"></vue-prism>
</template>

<script>
import VuePrism from 'vue-prismjs'

export default {
	name: 'HighlightedCode',
	components: { VuePrism },
	props: [ 'code', 'language' ]
}
</script>

<style lang="scss">
.highlighted-code {
	line-height: 1.4;
	margin: 0;
	white-space: pre-wrap;

	.language-sql {
		.keyword {
			font-weight: 600;
			text-transform: uppercase;
		}

		.function {
			color: rgb(136, 18, 128);
		}

		.number {
			color: rgb(28, 0, 207);
		}

		.string {
		    color: rgb(196, 26, 22);
		}

		.punctuation {
			color: rgb(128, 128, 128);
		}

		.boolean,
		.operator {
			color: rgb(19, 43, 162);
		}
	}
}

.application.dark {
	.language-sql {
		.function {
			color: rgb(227, 110, 236);
		}

		.number {
			color: rgb(153, 127, 255);
		}

		.string {
			color: rgb(227, 62, 58);
		}

		.punctuation {
			color: rgb(127, 127, 127);
		}

		.boolean,
		.operator {
			color: rgb(130, 150, 255);
		}
	}
}
</style>