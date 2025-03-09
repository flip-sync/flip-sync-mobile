import { useFlipTheme } from "@/common";
import FlipStyles from "@/styles";
import RowView from "../base/RowView";
import DefaultText from "../base/Text";
import FlipIcon from "../base/imgs/FlipIcon";
import { StyleSheet } from "react-native";

export const UserProfileCard = () => {
    const theme = useFlipTheme();
    return (
        <RowView
            style={[
                styles.container,
                {
                    borderWidth: 1,
                    boxSizing: "border-box",
                    borderColor: theme.gray7,
                    borderStyle: "solid"
                }
            ]}
        >
            <FlipIcon icon="icon-profile" size={24} />
            <DefaultText Body2 color={theme.gray2}>
                사용자
            </DefaultText>
        </RowView>
    );
};
const styles = StyleSheet.create({
    container: {
        paddingVertical: FlipStyles.adjustScale(8),
        paddingLeft: FlipStyles.adjustScale(14),
        paddingRight: FlipStyles.adjustScale(18),
        display: "flex",
        borderRadius: FlipStyles.adjustScale(8),
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(8)
    }
});
