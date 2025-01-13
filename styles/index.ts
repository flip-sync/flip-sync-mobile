import { Dimensions, PixelRatio, Platform } from "react-native";

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
};

const { width, height } = Dimensions.get("window");
let windowWidth = width;
let windowHeight = height;
let widthScale = windowWidth / 375 > 1.2 ? 1.2 : windowWidth / 375;
let heightScale = windowHeight / 812;

const adjustScale: StylesType["adjustScale"] = dp => PixelRatio.roundToNearestPixel(dp * widthScale);
const adjustScaleHeight: StylesType["adjustScaleHeight"] = dp => PixelRatio.roundToNearestPixel(dp * heightScale);

const setNewDimension = (newWidth: number, newHeight: number) => {
    windowWidth = newWidth;
    windowHeight = newHeight;
    widthScale = newWidth / 375 > 1.2 ? 1.2 : newWidth / 375;
    heightScale = newHeight / 812;
};

const FlipStyles: StylesType = {
    windowHeight,
    windowWidth,
    navigationHeaderHeight: adjustScale(64),
    bottomButtonHeight: adjustScale(64),
    bottomTabBarHeight: adjustScale(56),
    adjustScale,
    adjustScaleHeight,
    setNewDimension,
    basePadding: adjustScale(20),
    baseBorderRadius: adjustScale(24),
    ...Platform.select({
        ios: {
            baseBoxShadow: {
                shadowRadius: adjustScale(2),
                shadowOffset: {
                    width: 0,
                    height: adjustScale(-2)
                },
                shadowOpacity: 1,
                shadowColor: "rgba(0, 0, 0, 0.1)"
            }
        },
        android: { baseBoxShadow: { elevation: adjustScale(3) } }
    })
};

export default FlipStyles;
