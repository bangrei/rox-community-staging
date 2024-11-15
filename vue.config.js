module.exports = {
	devServer: {
		webSocketServer: "ws",
	},
	chainWebpack: (config) => {
		config.plugin("html").tap((args) => {
			args[0].title = "Recreational Outdoor Exchange";
			args[0].description = "Join, Experience,and Learn Outdoor Sports!";
			args[0].keyword = "Join, Experience,and Learn Outdoor Sports!";
			return args;
		});

		// Defining app version from package.json
		config.plugin("define").tap((args) => {
			let appVersion = JSON.stringify(require("./package.json").version);
			args[0]["process.env"]["VERSION"] = appVersion;
			return args;
		});

		config.optimization.delete("splitChunks");
	},
	pwa: {
		themeColor: "#FFFFFF",
		name: "Recreational Outdoor Exchange",
		iconPaths: {
			faviconSVG: "img/icons/rox-favicon.png",
			favicon32: "img/icons/rox-favicon.png",
			favicon16: "img/icons/rox-favicon.png",
			appleTouchIcon: "img/icons/rox-favicon.png",
			maskIcon: "img/icons/rox-favicon.png",
			msTileImage: "img/icons/rox-favicon.png",
		},
		manifestOptions: {
			icons: [
				{
					src: "img/icons/rox-favicon.png",
					sizes: "36x36",
					type: "image/png",
					density: "1",
				},
			],
		},
	},
	css: {
		loaderOptions: {
			sass: {
				additionalData: `@import "@/assets/scss/base/_variables.scss";`,
			},
		},
	},
};
