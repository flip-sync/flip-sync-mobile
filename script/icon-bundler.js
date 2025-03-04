const iconFolder = "assets/icons";
const imgFolder = "assets/images";
const iconBundleFilePath = "common/assets.ts";
const fs = require("fs");

const ICONS = [];
const IMGS = [];
const ANIMATIONS = [];

const writeResultFile = data => {
    fs.writeFileSync(iconBundleFilePath, data, { flag: "a" });
};

const findAssetsDepth = async (rootPath, type) => {
    fs.readdirSync(rootPath, { withFileTypes: true }).forEach(children => {
        if (children.name === ".DS_Store") return;

        if (children.isDirectory()) {
            findAssetsDepth(`${rootPath}/${children.name}`, type);
        } else {
            const relativePath = `${rootPath}/${children.name}`.replace("src/", "");
            const fileName = relativePath.substring(relativePath.lastIndexOf("/") + 1, relativePath.lastIndexOf("."));

            const imageRaw = `    "${fileName}": require("../${relativePath}"),`;

            switch (type) {
                case "icons":
                    ICONS.push(imageRaw);
                    break;
                case "imgs":
                    IMGS.push(imageRaw);
                    break;
            }
        }
    });
};

(async () => {
    const originFileContents = fs.readFileSync(iconBundleFilePath);

    fs.writeFileSync(iconBundleFilePath, "");

    try {
        await findAssetsDepth(iconFolder, "icons");
        await findAssetsDepth(imgFolder, "imgs");

        // warning comment
        writeResultFile("// Do not edit this code.\n// Please run 'yarn bundle-icons'.\n\n");

        // generate icon path
        writeResultFile("export const icon = {\n");
        ICONS.forEach(icon => {
            writeResultFile(`${icon}\n`);
        });
        writeResultFile("};\n");

        // generate image path
        writeResultFile("export const image = {\n");
        IMGS.forEach(img => {
            writeResultFile(`${img}\n`);
        });
        writeResultFile("};\n");

        writeResultFile("const Assets = { icon, image };\nexport default Assets;\n");

        console.log(`${ICONS.length} icons, ${IMGS.length} images, ${ANIMATIONS.length} animations generated.`);
    } catch (e) {
        writeResultFile(originFileContents);
        console.log(`generate failed. origin contents restored.`);
    }
})();
