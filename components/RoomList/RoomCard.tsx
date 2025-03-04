import { StyleSheet, TouchableOpacity, View } from "react-native";
import DefaultImage from "../base/imgs/FlipImage";
import Assets from "@/common/assets";
import FlipStyles from "@/styles";
import DefaultText from "../base/Text";
import { useFlipTheme } from "@/common";

export const RoomCard = ({ onPressEvent }: { onPressEvent: () => void }) => {
    const theme = useFlipTheme();
    return (
        <TouchableOpacity
            style={[
                styles.roomCard,
                FlipStyles.baseBoxShadow,
                {
                    backgroundColor: "#fff"
                }
            ]}
            onPress={onPressEvent}
        >
            <DefaultImage img="imgs-score-active" aspectRatio={2 / 1} />
            <DefaultText Title4 color={theme.gray2} style={styles.title}>
                악보 제목
            </DefaultText>
            <DefaultText Body2 color={theme.gray2}>
                설명
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
