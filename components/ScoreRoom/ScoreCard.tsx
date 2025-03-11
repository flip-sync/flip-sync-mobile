import { useFlipTheme } from "@/common";
import RowView from "../base/RowView";
import FlipIcon from "../base/imgs/FlipIcon";
import DefaultText from "../base/Text";
import { StyleSheet, View } from "react-native";
import FlipStyles from "@/styles";
import DefaultImage from "../base/imgs/FlipImage";

const data = {
    title: "사랑은 늘 도망가",
    singer: "김수희",
    code: "C 코드",
    uploadedUserName: "장경태"
};
export const ScoreCard = () => {
    const theme = useFlipTheme();
    return (
        <View
            style={[
                styles.container,
                {
                    borderRadius: FlipStyles.adjustScale(8),
                    backgroundColor: theme.white
                }
            ]}
        >
            <DefaultImage
                style={{
                    borderWidth: 1,
                    borderColor: theme.gray7,
                    borderRadius: FlipStyles.adjustScale(8)
                }}
                uri="https://musescore.com/static/musescore/scoredata/g/ae663cf294545b6a16c139f73a84ea6c5a3e83eb/score_0.svg?no-cache=1715708300"
                aspectRatio={2 / 1}
            />
            <DefaultText Body2 color={theme.gray2} weight="600">
                {data.title}
            </DefaultText>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width: FlipStyles.adjustScale(200),
        paddingHorizontal: FlipStyles.adjustScale(8),
        paddingTop: FlipStyles.adjustScale(8),
        paddingBottom: FlipStyles.adjustScale(16),
        gap: FlipStyles.adjustScale(8)
    }
});
