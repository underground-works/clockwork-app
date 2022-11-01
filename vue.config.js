module.exports = {
	publicPath: "./",
	pluginOptions: {
		webpackBundleAnalyzer: {
			openAnalyzer: false
		}
	},
	chainWebpack: config => {
	    config.module
			.rule('raw')
			.merge({
				resourceQuery: /raw/,
				type: 'asset/source'
			})
	}
}