module.exports = {
	publicPath: "./",
	outputDir: "build",
	configureWebpack: {
		"devtool": "inline-cheap-module-source-map"
	},
	chainWebpack: config => {
		const svgRule = config.module.rule('svg')

		svgRule.uses.clear()

		svgRule.use('vue-svg-loader')
			.loader('vue-svg-loader')
			.options({ svgo: { plugins: [{ removeDimensions: true }, { removeViewBox: false }] } })
	}
}