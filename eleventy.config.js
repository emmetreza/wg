import path from "node:path";
import * as sass from "sass";
import browserslist from "browserslist";
import { transform, browserslistToTargets } from "lightningcss";
import { HtmlBasePlugin } from "@11ty/eleventy";
import { config } from 'dotenv';
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
config();

export default function (eleventyConfig) {
	eleventyConfig.setInputDirectory("src");
	eleventyConfig.setOutputDirectory("public");
	eleventyConfig.addWatchTarget("./src/css");
	eleventyConfig.addPassthroughCopy("./src/css");
	eleventyConfig.setOutputDirectory("public");
	eleventyConfig.addWatchTarget("./src/scripts");
	eleventyConfig.addPassthroughCopy("./src/scripts");
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(eleventyImageTransformPlugin);
	eleventyConfig.addPassthroughCopy("./src/img");
	eleventyConfig.addGlobalData('env', process.env);

  eleventyConfig.addTemplateFormats("scss");

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		useLayouts: false,
		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			if(parsed.name.startsWith("_")) {
				return;
			}

			let result = sass.compileString(inputContent, {
				loadPaths: [
					parsed.dir || ".",
					this.config.dir.includes,
				]
			});

			this.addDependencies(inputPath, result.loadedUrls);

			let targets = browserslistToTargets(browserslist("> 0.2% and not dead"));

      return async () => {
        let { code } = await transform({
          code: Buffer.from(result.css),
          minify: true,
          sourceMap: false,
          targets,
        });
        return code;
      };
		},
	});
};
