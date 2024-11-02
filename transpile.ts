import { bundle } from "jsr:@deno/emit";
import { generateDtsBundle } from "npm:dts-bundle-generator";

const getFilePath = (path: string) => `${import.meta.dirname!}/${path}`;

// Transpilation file paths
const tsFilePath = getFilePath("ts/mod.ts");
const tsConfigPath = getFilePath("js/tsconfig.json");
const jsFilePath = getFilePath("js/mod.js");
const dtsFilePath = getFilePath("js/mod.d.ts");

// Package meta file paths
const rootMetaFilePath = getFilePath("deno.json");
const jsrMetaFilePath = getFilePath("ts/deno.json");
const npmMetaFilePath = getFilePath("js/package.json");

// Plain copy file paths
const copyFilenames = ["LICENSE", "NOTICE", "README.md"];
const copyRootFilePaths = copyFilenames.map(getFilePath);
const copyTsFilePaths = copyFilenames.map((filename) =>
  getFilePath(`ts/${filename}`)
);
const copyJsFilePaths = copyFilenames.map((filename) =>
  getFilePath(`js/${filename}`)
);

const [js, dts, rootMeta, jsrMeta, npmMeta, ...copyRootFiles] = await Promise
  .all([
    bundle(tsFilePath).then(({ code }) => code),
    generateDtsBundle([{ filePath: tsFilePath }], {
      preferredConfigPath: tsConfigPath,
    }).join("").replace(/^[/\w\s-.]+(?=declare)/g, ""),
    Deno.readTextFile(rootMetaFilePath).then(JSON.parse),
    Deno.readTextFile(jsrMetaFilePath).then(JSON.parse),
    Deno.readTextFile(npmMetaFilePath).then(JSON.parse),
    ...copyRootFilePaths.map((path) => Deno.readFile(path)),
  ]);

// Copy all relevant fields from root meta to jsr and npm metas
for (const key of Object.keys(rootMeta)) {
  if (jsrMeta[key] !== undefined) {
    jsrMeta[key] = rootMeta[key];
  }
  if (npmMeta[key] !== undefined) {
    npmMeta[key] = rootMeta[key];
  }
}

await Promise.all([
  Deno.writeTextFile(jsFilePath, js),
  Deno.writeTextFile(dtsFilePath, dts),
  Deno.writeTextFile(jsrMetaFilePath, JSON.stringify(jsrMeta)),
  Deno.writeTextFile(npmMetaFilePath, JSON.stringify(npmMeta)),
  ...copyTsFilePaths.map((path, idx) =>
    Deno.writeFile(path, copyRootFiles[idx])
  ),
  ...copyJsFilePaths.map((path, idx) =>
    Deno.writeFile(path, copyRootFiles[idx])
  ),
]);
