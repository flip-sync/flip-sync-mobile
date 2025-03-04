import { Dimensions, PixelRatio, Platform } from "react-native";
import * as Device from "expo-device";

type StylesType = {
    windowWidth: number;
    windowHeight: number;
    navigationHeaderHeight: number;
    bottomButtonHeight: number;
    bottomTabBarHeight: number;
    adjustScale: (dp: number) => number;
    adjustScaleHeight: (dp: number) => number;
    setNewDimension: (newWidth: number, newHeight: number) => void;
    basePadding: number;
    baseBorderRadius: number;
    baseBoxShadow?:
        | {
              shadowRadius: number;
              shadowOffset: {
                  width: number;
                  height: number;
              };
              shadowOpacity: number;
              shadowColor: string;
          }
        | {
              elevation: number;
          };
    isTablet: boolean;
};

const { width, height } = Dimensions.get("window");
let windowWidth = width;
let windowHeight = height;

// 태블릿 여부 판별 (기본적으로 false, expo-device로 확인)
let isTablet = Device.deviceType === Device.DeviceType.TABLET ? true : windowWidth >= 768;
// 태블릿과 모바일에 따라 스케일 조정
let widthScale = isTablet ? windowWidth / 600 : windowWidth / 375;
let heightScale = isTablet ? windowHeight / 1024 : windowHeight / 812;

// 스케일 조정 함수
const adjustScale: StylesType["adjustScale"] = dp => PixelRatio.roundToNearestPixel(dp * widthScale);
const adjustScaleHeight: StylesType["adjustScaleHeight"] = dp => PixelRatio.roundToNearestPixel(dp * heightScale);

// 새로운 크기 설정 (화면 회전 대응)
const setNewDimension = (newWidth: number, newHeight: number) => {
    windowWidth = newWidth;
    windowHeight = newHeight;
    isTablet = Device.deviceType === Device.DeviceType.TABLET ? true : newWidth >= 768;
    widthScale = isTablet ? newWidth / 600 : newWidth / 375;
    heightScale = isTablet ? newHeight / 1024 : newHeight / 812;
};

const FlipStyles: StylesType = {
    windowHeight,
    windowWidth,
    isTablet,
    navigationHeaderHeight: adjustScale(isTablet ? 80 : 64),
    bottomButtonHeight: adjustScale(isTablet ? 72 : 64),
    bottomTabBarHeight: adjustScale(isTablet ? 64 : 56),
    adjustScale,
    adjustScaleHeight,
    setNewDimension,
    basePadding: adjustScale(isTablet ? 24 : 20),
    baseBorderRadius: adjustScale(isTablet ? 28 : 24),
    ...Platform.select({
        ios: {
            baseBoxShadow: {
                shadowRadius: adjustScale(isTablet ? 4 : 2),
                shadowOffset: {
                    width: 0,
                    height: adjustScale(isTablet ? -4 : -2)
                },
                shadowOpacity: 1,
                shadowColor: "rgba(0, 0, 0, 0.1)"
            }
        },
        android: { baseBoxShadow: { elevation: adjustScale(isTablet ? 5 : 3) } }
    })
};

export default FlipStyles;
