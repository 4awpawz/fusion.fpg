import cp from "child_process";
import chalk from "chalk";
import fs from "fs-extra";
import { join } from "path";
import fileDirName from "./lib/fileDirName.js";

export const newTypeScriptProjectGenerator = async function(folderName: string): Promise<void> {
    if (fs.existsSync(folderName)) {
        console.error(chalk.red(`Error: Folder "${folderName}" already exists!`));
        return;
    }
    console.log(chalk.blueBright(`creating project "${folderName}"...`));
    try {
        await fs.ensureDir(folderName);
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }
    const { __dirname } = fileDirName(import.meta);
    try {
        // Create src folder  and its subfolders.
        await fs.ensureDir(join(folderName, "src", "components"));
        const welcomeTSX = await fs.readFile(join(__dirname, "..", "assets", "Welcome.tsx"));
        await fs.promises.writeFile(join(folderName, "src", "components", "Welcome.tsx"), welcomeTSX);
        await fs.ensureDir(join(folderName, "src", "css", "libs", "pico"));
        const picoMinCSS = await fs.readFile(join(__dirname, "..", "assets", "pico.min.css"));
        await fs.promises.writeFile(join(folderName, "src", "css", "libs", "pico", "pico.min.css"), picoMinCSS);
        const picoMinCSSMap = await fs.readFile(join(__dirname, "..", "assets", "pico.min.css.map"));
        await fs.promises.writeFile(join(folderName, "src", "css", "libs", "pico", "pico.min.css.map"), picoMinCSSMap);
        const projectCSS = await fs.readFile(join(__dirname, "..", "assets", "project.css"));
        await fs.promises.writeFile(join(folderName, "src", "css", "project.css"), projectCSS);
        await fs.ensureDir(join(folderName, "src", "data"));
        await fs.ensureDir(join(folderName, "src", "etc"));
        await fs.ensureDir(join(folderName, "src", "includes"));
        await fs.ensureDir(join(folderName, "src", "media"));
        await fs.ensureDir(join(folderName, "src", "pages"));
        const defaultHTML = await fs.readFile(join(__dirname, "..", "assets", "default.html"));
        await fs.promises.writeFile(join(folderName, "src", "pages", "default.html"), defaultHTML);
        await fs.ensureDir(join(folderName, "src", "scripts"));
        await fs.ensureDir(join(folderName, "src", "templates", "posts"));
        const indexMD = await fs.readFile(join(__dirname, "..", "assets", "index.md"));
        await fs.promises.writeFile(join(folderName, "src", "templates", "index.md"), indexMD);
        // Create project root files.
        await fs.outputFile(join(folderName, ".eslintignore"), ".meta\nbuild\nlib\nnode_modules");
        await fs.outputJSON(join(folderName, ".eslintrc.json"), {
            "root": true,
            "env": {
                "browser": true,
                "node": true,
                "es2021": true
            },
            "parser": "@typescript-eslint/parser",
            "plugins": [
                "@typescript-eslint"
            ],
            "extends": [
                "eslint:recommended",
                "plugin:@typescript-eslint/eslint-recommended",
                "plugin:@typescript-eslint/recommended"
            ],
            "parserOptions": {
                "ecmaVersion": "latest",
                "sourceType": "module",
                "ecmaFeatures": {
                    "jsx": true,
                    "tsx": true
                }
            },
            "rules": {
                "semi": [
                    2,
                    "always"
                ]
            }
        }, { spaces: 2 });
        await fs.outputFile(join(folderName, ".gitignore"), ".meta\nbuild\nlib\nnode_modules\nassets.json");
        await fs.outputJSON(join(folderName, "fusion.json"), {});
        await fs.outputJSON(join(folderName, "package.json"), {
            "name": `${folderName}`,
            "type": "module",
            "version": "1.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
                "release:live-server": "live-server build --open=fusion.ssg.docs --quiet",
                "release:fusion": "fusion release",
                "release:build": "chokidar \"src/**/*\" \"fusion.json\" --silent true --initial true -c \"npm run release:fusion\"",
                "release": "npm run release:build & npm run release:live-server",
                "development:live-server": "live-server build --quiet",
                "development:fusion": "fusion build",
                "development:build": "chokidar \"src/**/*\" \"fusion.json\" --silent true --initial true -c \"npm run development:fusion\"",
                "development": "npm run development:build & npm run development:live-server"
            },
            "keywords": [],
            "author": "",
            "license": "ISC",
            "devDependencies": {
                "@tsconfig/node16-strictest-esm": "^1.0.3",
                "@types/node": "^18.11.7",
                "@types/react": "^18.0.28",
                "@typescript-eslint/eslint-plugin": "^5.41.0",
                "@typescript-eslint/parser": "^5.41.0",
                "chokidar-cli": "^3.0.0",
                "eslint": "^8.26.0",
                "eslint-plugin-import": "^2.26.0",
                "live-server": "^1.2.2",
                "preact": "^10.13.1"
            }
        }, { spaces: 2 });
        await fs.outputJSON(join(folderName, "tsconfig.json"), {
            "compilerOptions": {
                "module": "ES2022",
                "moduleResolution": "node",
                "rootDir": "src/components",
                "outDir": "lib/",
                "allowJs": true,
                "target": "es2021",
                "strict": true,
                "jsx": "preserve",
                "jsxImportSource": "preact",
                "noImplicitAny": true,
                "typeRoots": ["node_modules/@types"],
                "baseUrl": "./"
            },
            "include": ["./src/components/**/*", "./src/components/@types"]
        }, { spaces: 2 });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }
    console.log(chalk.blueBright("installing project dependencies..."));
    try {
        const runtimeCWD = join(process.cwd(), folderName);
        process.chdir(runtimeCWD);
        cp.execSync("npm install", { stdio: [0, 1, 2] });
    } catch (error) {
        console.error(chalk.red(`there was error: ${error}`));
        process.abort();
    }
    console.log(chalk.blueBright(`project "${folderName}" has been created along with all its dependencies`));
    console.log(chalk.blueBright(`you can now "cd ${folderName}; npm run development"`));
};
