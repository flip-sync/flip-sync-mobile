import { useFlipTheme } from "@/common";
import FlipStyles from "@/styles";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import FlipIcon from "./imgs/FlipIcon";
import DefaultText from "./Text";

type CompactHeaderProps = {
    title: string;
};

export const CompactHeader = ({ title }: CompactHeaderProps) => {
    const router = useRouter();
    const theme = useFlipTheme();

    return (
        <View style={[styles.header, { backgroundColor: theme.white, borderBottomColor: theme.gray6 }]}>
            <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
                <FlipIcon icon="icon-back" size={24} />
            </TouchableOpacity>
            <DefaultText Button1 weight="700" color={theme.gray2}>
                {title}
            </DefaultText>
            <View style={styles.headerSpacer} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: FlipStyles.adjustScale(48),
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: FlipStyles.adjustScale(8)
    },
    backButton: {
        width: FlipStyles.adjustScale(40),
        height: FlipStyles.adjustScale(40),
        alignItems: "center",
        justifyContent: "center"
    },
    headerSpacer: {
        width: FlipStyles.adjustScale(40)
    }
});
