import fs from "fs";
import chalk from "chalk";
import { dirname, join, normalize } from "path";
import { fileURLToPath } from 'url';
import browsersync from "browser-sync";

// __dirName...

// This is a polyfill for  __dirname, which isn't supported when using esmodules.
function fileDirName(meta) {
    const __filename = fileURLToPath(meta.url);
    const __dirname = dirname(__filename);
    return __dirname;
}
const __dirname = fileDirName(import.meta);

// Command arguments...

// Server strategy.
const args = process.argv.length > 2 ? process.argv.slice(2) : [];
const serverStrategy = args.includes("release") ? "release" : "development";
console.log(chalk.black.bgWhiteBright("Browsersync server strategy:", serverStrategy));

// baseURL...

const fusion_json = JSON.parse(fs.readFileSync(join(__dirname, "fusion.json")));
let baseURL = "";
if (serverStrategy === "release") {
    baseURL = Object.hasOwn(fusion_json, "baseURL") ? fusion_json.baseURL : "";
}

// 404...

function _404() {
    try {
        const pathTo404html = join(__dirname, "build", baseURL, "404.html");
        return fs.readFileSync(pathTo404html);
    } catch (error) {
        console.log(chalk.yellowBright("Warning: this site is missing a 404.html doc - using default 404.html."));
        return "<html style=\"height: 100%;\"><body style=\"height: 100%; background-color: red;\"><div style=\"width: 100%; height: 100%; display: table; text-align: center;\"><div style=\"display: table-cell; vertical-align: middle;\"><p style=\"font-size: 4rem; color: white; margin-top: 0; font-weight: bold;\">Page Not Found!</p><p style=\"font-size: 2rem; color: black; margin-bottom: 0;\">Please create your own 404.html page for your project.</p></div></div></body></html>";
    }
}

// Options...

const defaultOptions = {
    server: "build",
    files: "build/**",
    watch: true
};

const pathToUserOptions = join(__dirname, "browsersync-options.json");
let configOptions = fs.existsSync(pathToUserOptions) && JSON.parse(fs.readFileSync(pathToUserOptions))?.[serverStrategy] || {};
configOptions = { ...defaultOptions, ...configOptions };
// If thee's a baseURL the site should be served from build/baseURL.
if (baseURL !== "") configOptions.startPath = normalize(`${baseURL}`);
console.log(chalk.black.bgWhiteBright("Browsersync configuration options:"), configOptions);

// Start the server...

const bs = browsersync.create();

bs.init(configOptions, (err, bs) => {
    bs.addMiddleware("*", (req, res) => {
        // Provides the 404 content without redirect.
        res.write(_404());
        res.end();
    });
});
