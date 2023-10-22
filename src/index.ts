import cp from "child_process";
import chalk from "chalk";
import fs from "fs-extra";
import { join } from "path";
import fileDirName from "./lib/fileDirName.js";

export const projectGenerator = async function(targetFolder: string, options: { bare: boolean }): Promise<void> {

    const { __dirname } = fileDirName(import.meta);

    // Show version.
    try {
        const packageJson = await fs.readJson(join(__dirname, "..", "package.json"));
        const version = packageJson.version;
        console.log(chalk.blueBright(`fusion.ssg generator v${version}`));
    } catch (error) {
        console.error(chalk.red(`Error: reading fpg::package.json!`));
        return;
    }

    // Prompt for target folder name if missing.
    if (typeof targetFolder === "undefined") {
        console.error(chalk.red(`Error: Please provide the name of the target folder.`));
        return;
    }

    // Guard against tergeting an existing folder.
    if (fs.existsSync(targetFolder)) {
        console.error(chalk.red(`Error: The target folder "${targetFolder}" already exists!`));
        return;
    }

    // Create the target folder.
    console.log(chalk.blueBright(`creating project "${targetFolder}"...`));
    try {
        await fs.ensureDir(targetFolder);
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    // Create the pject.

    try {
        // Components

        await fs.ensureDir(join(targetFolder, "src", "components"));
        if (!options.bare) {
            const welcomeTSX = await fs.readFile(join(__dirname, "..", "assets", "Welcome.tsx"));
            await fs.promises.writeFile(join(targetFolder, "src", "components", "Welcome.tsx"), welcomeTSX);
        }

        // CSS
        await fs.ensureDir(join(targetFolder, "src", "css"));

        if (!options.bare) {
            // projectCSS
            const projectCSS = await fs.readFile(join(__dirname, "..", "assets", "project.css"));
            await fs.promises.writeFile(join(targetFolder, "src", "css", "project.css"), projectCSS);
        }

        // src folders

        // src/data
        await fs.ensureDir(join(targetFolder, "src", "data"));
        // src/etc
        await fs.ensureDir(join(targetFolder, "src", "etc"));
        // src/includes
        await fs.ensureDir(join(targetFolder, "src", "includes"));
        // src/media
        await fs.ensureDir(join(targetFolder, "src", "media"));
        // src/pages
        await fs.ensureDir(join(targetFolder, "src", "pages"));
        // src/pages/default.html
        const defaultHTML = await (!options.bare ? fs.readFile(join(__dirname, "..", "assets", "default.html")) : fs.readFile(join(__dirname, "..", "assets", "defaultBare.html")));
        await fs.promises.writeFile(join(targetFolder, "src", "pages", "default.html"), defaultHTML);
        // src/scripts
        await fs.ensureDir(join(targetFolder, "src", "scripts"));
        // src/templates && src/templates/posts
        await fs.ensureDir(join(targetFolder, "src", "templates", "posts"));
        if (!options.bare) {
            // src/templates/index.md
            const indexMD = await fs.readFile(join(__dirname, "..", "assets", "index.md"));
            await fs.promises.writeFile(join(targetFolder, "src", "templates", "index.md"), indexMD);
            const fourzerofourHTML = await fs.readFile(join(__dirname, "..", "assets", "404template.html"));
            await fs.promises.writeFile(join(targetFolder, "src", "templates", "404.html"), fourzerofourHTML);
        }

        // Project root files.

        // browsersync-options.json
        const browsersyncJSON = await fs.readJson(join(__dirname, "..", "assets", "browsersync-options.json"));
        await fs.outputJSON(join(targetFolder, "browsersync-options.json"), browsersyncJSON, { spaces: 4 });
        // browsersync.js
        const browsersyncJS = await fs.readFile(join(__dirname, "..", "assets", "browsersync.js"));
        await fs.promises.writeFile(join(targetFolder, "browsersync.js"), browsersyncJS);
        // .eslintignore
        const eslintignore = await fs.readFile(join(__dirname, "..", "assets", ".eslintignore"));
        await fs.promises.writeFile(join(targetFolder, ".eslintignore"), eslintignore);
        // .eslintrc.json
        const eslintrcjson = await fs.readJson(join(__dirname, "..", "assets", ".eslintrc.json"));
        await fs.outputJSON(join(targetFolder, ".eslintrc.json"), eslintrcjson, { spaces: 4 });
        // .gitignore
        const gitignore = await fs.readFile(join(__dirname, "..", "assets", "gi"));
        await fs.promises.writeFile(join(targetFolder, ".gitignore"), gitignore);
        // fusion.json
        await fs.outputJSON(join(targetFolder, "fusion.json"), {});
        // package.json
        let packagejson = await fs.readJson(join(__dirname, "..", "assets", "package.json"));
        packagejson = { ...packagejson, ...{ name: `${targetFolder}`, description: `${targetFolder}` } };
        await fs.outputJSON(join(targetFolder, "package.json"), packagejson, { spaces: 4 });
        // tsconfig.json
        const tsconfigjson = await fs.readJson(join(__dirname, "..", "assets", "tsconfig.json"));
        await fs.outputJSON(join(targetFolder, "tsconfig.json"), tsconfigjson, { spaces: 4 });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    // Install Project Dependencies.

    console.log(chalk.blueBright("installing project dependencies..."));
    try {
        const runtimeCWD = join(process.cwd(), targetFolder);
        process.chdir(runtimeCWD);
        cp.execSync("npm install", { stdio: [0, 1, 2] });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    //  Done!

    console.log(chalk.blueBright(`project "${targetFolder}" has been created, and all its dependencies have been installed`));
    console.log(chalk.blueBright(`you can now "cd ${targetFolder}; npm run development"`));
};
