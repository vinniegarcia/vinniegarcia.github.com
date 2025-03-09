import { feedPlugin } from "@11ty/eleventy-plugin-rss";

const metadata = {
    language: "en",
    title: "vinniegarcia.com",
    subtitle: "Vinnie Garcia's writings.",
    base: "https://vinniegarcia.com/",
    author: {
        name: "Vinnie Garcia",
        email: "", // Optional
    }
};

export default function (eleventyConfig) {
	// Output directory: _site
    eleventyConfig.setInputDirectory("src");
	eleventyConfig.addPassthroughCopy("src/assets/**");
    eleventyConfig.addPassthroughCopy("src/docs/**");
    eleventyConfig.addPassthroughCopy("CNAME");
    
    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom", // or "rss", "json"
        outputPath: "/feed.xml",
        collection: {
            name: "post", // iterate over `collections.posts`
            limit: 10,     // 0 means no limit
        },
        metadata,
    });
};

