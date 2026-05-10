import type { ConfigContext, ExpoConfig } from "expo/config";

const photoLibraryPermission =
  "\uD504\uB85C\uD544 \uC0AC\uC9C4\uACFC \uC545\uBCF4 \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uB824\uBA74 \uC0AC\uC9C4 \uBCF4\uAD00\uD568 \uC811\uADFC \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";
const defaultUpdateMessage =
  "\uB354 \uC548\uC815\uC801\uC778 \uC0AC\uC6A9\uC744 \uC704\uD574 \uC0C8 \uC5C5\uB370\uC774\uD2B8\uAC00 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
const defaultApiUrl = "https://fliplyze.com/mob";

export default ({ config }: ConfigContext): ExpoConfig => {
  const owner = process.env.EXPO_OWNER?.trim() || config.owner || "jangkt";
  const projectId =
    process.env.EXPO_PROJECT_ID?.trim() ||
    config.extra?.eas?.projectId ||
    "ee0a9280-f5d5-45dc-b5b9-9c30d4ed1f2f";
  const updatePolicy = process.env.EAS_UPDATE_POLICY?.trim().toLowerCase() === "required" ? "required" : "optional";
  const updateMessage = process.env.EAS_UPDATE_MESSAGE?.trim();
  const apiUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    defaultApiUrl;

  return {
    ...config,
    name: config.name ?? "Flipsync",
    slug: "flipsync",
    owner,
    extra: {
      ...config.extra,
      updatePolicy: {
        policy: updatePolicy,
        message: updateMessage || defaultUpdateMessage
      },
      apiUrl,
      eas: {
        ...config.extra?.eas,
        ...(projectId ? { projectId } : {})
      }
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-image",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          photosPermission: photoLibraryPermission,
          // The app currently selects images from the media library only.
          cameraPermission: false,
          microphonePermission: false
        }
      ]
    ]
  };
};
