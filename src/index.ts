import cp from "child_process";
import chalk from "chalk";
import fs from "fs-extra";
import { join } from "path";
import fileDirName from "./lib/fileDirName.js";

export const newTypeScriptProjectGenerator = async function(folderName: string): Promise<void> {

    const { __dirname } = fileDirName(import.meta);

    // Show version.
    try {
        const packageJson = await fs.readJson(join(__dirname, "..", "package.json"));
        const version = packageJson.version;
        console.log(chalk.blueBright(`fusion.ssg generator ${version}`));
    } catch (error) {
        console.error(chalk.red(`Error: reading package.json!`));
        return;
    }

    // Guard against tergeting an existing folder.

    if (fs.existsSync(folderName)) {
        console.error(chalk.red(`Error: Folder "${folderName}" already exists!`));
        return;
    }

    // Create the project folder.

    console.log(chalk.blueBright(`creating project "${folderName}"...`));
    try {
        await fs.ensureDir(folderName);
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    // Create the pject.

    try {
        // Components

        await fs.ensureDir(join(folderName, "src", "components"));
        const welcomeTSX = await fs.readFile(join(__dirname, "..", "assets", "Welcome.tsx"));
        await fs.promises.writeFile(join(folderName, "src", "components", "Welcome.tsx"), welcomeTSX);

        // CSS

        // picoMinCSS
        await fs.ensureDir(join(folderName, "src", "css", "libs", "pico"));
        const picoMinCSS = await fs.readFile(join(__dirname, "..", "assets", "pico.min.css"));
        await fs.promises.writeFile(join(folderName, "src", "css", "libs", "pico", "pico.min.css"), picoMinCSS);
        // picoMinCSSMap
        const picoMinCSSMap = await fs.readFile(join(__dirname, "..", "assets", "pico.min.css.map"));
        await fs.promises.writeFile(join(folderName, "src", "css", "libs", "pico", "pico.min.css.map"), picoMinCSSMap);
        // projectCSS
        const projectCSS = await fs.readFile(join(__dirname, "..", "assets", "project.css"));
        await fs.promises.writeFile(join(folderName, "src", "css", "project.css"), projectCSS);

        // src folders

        // src/data
        await fs.ensureDir(join(folderName, "src", "data"));
        // src/etc
        await fs.ensureDir(join(folderName, "src", "etc"));
        // src/etc/404.html
        const fourzerofourHTML = await fs.readFile(join(__dirname, "..", "assets", "404.html"));
        await fs.promises.writeFile(join(folderName, "src", "etc", "404.html"), fourzerofourHTML);
        // src/includes
        await fs.ensureDir(join(folderName, "src", "includes"));
        // src/media
        await fs.ensureDir(join(folderName, "src", "media"));
        // src/pages
        await fs.ensureDir(join(folderName, "src", "pages"));
        // src/pages/default.html
        const defaultHTML = await fs.readFile(join(__dirname, "..", "assets", "default.html"));
        await fs.promises.writeFile(join(folderName, "src", "pages", "default.html"), defaultHTML);
        // src/scripts
        await fs.ensureDir(join(folderName, "src", "scripts"));
        // src/templates/posts
        await fs.ensureDir(join(folderName, "src", "templates", "posts"));
        // src/templates/index.md
        const indexMD = await fs.readFile(join(__dirname, "..", "assets", "index.md"));
        await fs.promises.writeFile(join(folderName, "src", "templates", "index.md"), indexMD);

        // Project root files.

        // .eslintignore
        const eslintignore = await fs.readFile(join(__dirname, "..", "assets", ".eslintignore"));
        await fs.promises.writeFile(join(folderName, ".eslintignore"), eslintignore);
        // .eslintrc.json
        const eslintrcjson = await fs.readJson(join(__dirname, "..", "assets", ".eslintrc.json"));
        await fs.outputJSON(join(folderName, ".eslintrc.json"), eslintrcjson, { spaces: 4 });
        // .gitignore
        const gitignore = await fs.readFile(join(__dirname, "..", "assets", "gi"));
        await fs.promises.writeFile(join(folderName, ".gitignore"), gitignore);
        // fusion.json
        await fs.outputJSON(join(folderName, "fusion.json"), {});
        // package.json
        let packagejson = await fs.readJson(join(__dirname, "..", "assets", "package.json"));
        packagejson = { ...packagejson, ...{ name: `${folderName}`, description: `${folderName}` } };
        await fs.outputJSON(join(folderName, "package.json"), packagejson, { spaces: 4 });
        // tsconfig.json
        const tsconfigjson = await fs.readJson(join(__dirname, "..", "assets", "tsconfig.json"));
        await fs.outputJSON(join(folderName, "tsconfig.json"), tsconfigjson, { spaces: 4 });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    // Install Project Dependencies.

    console.log(chalk.blueBright("installing project dependencies..."));
    try {
        const runtimeCWD = join(process.cwd(), folderName);
        process.chdir(runtimeCWD);
        cp.execSync("npm install", { stdio: [0, 1, 2] });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }

    //  Done!

    console.log(chalk.blueBright(`project "${folderName}" has been created along with all its dependencies`));
    console.log(chalk.blueBright(`you can now "cd ${folderName}; npm run development"`));
};
