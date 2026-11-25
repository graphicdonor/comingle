// The native app shares its content and logic with the website: prayers,
// meditations, verses, guides, sessions, Pali transliteration, pronunciation,
// search and the Hindi/English interface text all come from ../src/lib, so the
// CMS content and translations live in one place.
//
// Three redirects make those files work here:
//   1. "@/lib/…" (the website's alias) points at ../src/lib.
//   2. Their browser storage ("./local-store") becomes on-device storage.
//   3. Packages they import (react) come from this app's node_modules, so
//      there is only one copy of React.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const SHARED_ROOT = path.resolve(__dirname, "..", "src");
const SHARED_LIB = path.join(SHARED_ROOT, "lib");
const NATIVE_STORE = path.join(__dirname, "src", "lib", "local-store.ts");
const APP_ORIGIN = path.join(__dirname, "package.json");

const isShared = (file) => file.startsWith(SHARED_ROOT + path.sep);
const isBare = (name) => !name.startsWith(".") && !name.startsWith("/") && !name.startsWith("@/") && !name.startsWith("~/");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath;
  if (moduleName.startsWith("~/")) return context.resolveRequest(context, path.join(__dirname, "src", moduleName.slice(2)), platform);
  if (moduleName.startsWith("@/")) {
    if (moduleName === "@/lib/practice/local-store") return { type: "sourceFile", filePath: NATIVE_STORE };
    return context.resolveRequest(context, path.join(SHARED_ROOT, moduleName.slice(2)), platform);
  }
  if (isShared(origin)) {
    if (moduleName === "./local-store" && origin.startsWith(path.join(SHARED_LIB, "practice"))) {
      return { type: "sourceFile", filePath: NATIVE_STORE };
    }
    if (isBare(moduleName)) return context.resolveRequest({ ...context, originModulePath: APP_ORIGIN }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Metro only sees files in watched folders; the shared website code is one.
config.watchFolders = [...(config.watchFolders ?? []), SHARED_ROOT];

module.exports = config;
