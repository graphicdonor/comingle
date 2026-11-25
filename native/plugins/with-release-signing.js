// Signs release builds with the WePray Google Play upload key.
//
// The keystore path and passwords are read from WEPRAY_UPLOAD_* properties in
// ~/.gradle/gradle.properties, never from this repository. Without them, a
// release build falls back to the debug key (fine for local testing, rejected
// by Play).
const { withAppBuildGradle } = require("expo/config-plugins");

const SIGNING = `
        release {
            if (project.hasProperty("WEPRAY_UPLOAD_STORE_FILE")) {
                storeFile file(WEPRAY_UPLOAD_STORE_FILE)
                storePassword WEPRAY_UPLOAD_STORE_PASSWORD
                keyAlias WEPRAY_UPLOAD_KEY_ALIAS
                keyPassword WEPRAY_UPLOAD_KEY_PASSWORD
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes("WEPRAY_UPLOAD_STORE_FILE")) {
      // Add a release signing config next to the template's debug one.
      gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${SIGNING}`);
      // Use it for release builds when the upload key is configured.
      gradle = gradle.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
        `$1signingConfig project.hasProperty("WEPRAY_UPLOAD_STORE_FILE") ? signingConfigs.release : signingConfigs.debug`,
      );
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
