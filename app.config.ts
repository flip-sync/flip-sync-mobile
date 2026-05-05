import type { ConfigContext, ExpoConfig } from "expo/config";

const photoLibraryPermission =
  "프로필 사진과 악보 이미지를 업로드하려면 사진 보관함 접근 권한이 필요합니다.";

export default ({ config }: ConfigContext): ExpoConfig => {
  const owner = process.env.EXPO_OWNER?.trim() || config.owner || "jangkt";
  const projectId =
    process.env.EXPO_PROJECT_ID?.trim() ||
    config.extra?.eas?.projectId ||
    "ee0a9280-f5d5-45dc-b5b9-9c30d4ed1f2f";

  return {
    ...config,
    name: config.name ?? "Flipsync",
    slug: "flipsync",
    owner,
    extra: {
      ...config.extra,
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
