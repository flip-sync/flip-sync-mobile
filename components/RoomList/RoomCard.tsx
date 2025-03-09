import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import DefaultImage from "../base/imgs/FlipImage";
import Assets from "@/common/assets";
import FlipStyles from "@/styles";
import DefaultText from "../base/Text";
import { useFlipTheme } from "@/common";
import { useCheckDevice } from "@/hooks/useCheckDevice";

export const RoomCard = ({
    title,
    description,
    onPressEvent
}: {
    title: string;
    description: string;
    onPressEvent: () => void;
}) => {
    const theme = useFlipTheme();
    const { isTablet } = useCheckDevice();
    const { width } = useWindowDimensions(); // 현재 화면 크기 가져오기
    const adjustedWidth = width * 0.5 - 8;
    return (
        <TouchableOpacity
            style={[
                styles.roomCard,
                FlipStyles.baseBoxShadow,
                {
                    maxWidth: isTablet ? adjustedWidth : width - 8,
                    backgroundColor: "#fff"
                }
            ]}
            onPress={onPressEvent}
        >
            <DefaultImage img="imgs-score-active" aspectRatio={2 / 1} />
            <DefaultText Title4 color={theme.gray2} style={styles.title}>
                {title}
            </DefaultText>
            <DefaultText Body2 color={theme.gray2}>
                {description}
            </DefaultText>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    roomCard: {
        maxHeight: FlipStyles.adjustScale(290),
        padding: FlipStyles.adjustScale(8),
        marginVertical: FlipStyles.adjustScale(5),
        marginHorizontal: FlipStyles.adjustScale(5),
        borderRadius: FlipStyles.adjustScale(8),
        flex: 1
    },
    title: {
        marginTop: FlipStyles.adjustScale(16),
        marginBottom: FlipStyles.adjustScale(4)
    }
});
