import FlipStyles from "@/styles";
import RowView from "./RowView";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import FlipIcon from "./imgs/FlipIcon";
import DefaultText from "./Text";
import { useRouter } from "expo-router";
import { useFlipTheme } from "@/common";

export const Header = ({
    children,
    title,
    subtitle
}: {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
}) => {
    const theme = useFlipTheme();
    const router = useRouter();
    return (
        <RowView style={{ backgroundColor: theme.white, borderBottomWidth: 1, borderColor: theme.gray6 }}>
            <RowView
                justifyContent="flex-start"
                style={{
                    gap: FlipStyles.adjustScale(20)
                }}
            >
                {router.canGoBack() && (
                    <TouchableOpacity
                        style={{
                            display: "flex",
                            width: FlipStyles.adjustScale(48),
                            height: FlipStyles.adjustScale(48),
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onPress={() => router.back()}
                    >
                        <FlipIcon icon="icon-back" size={24} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleBlock}>
                    <DefaultText
                        Title4
                        style={{
                            paddingVertical: subtitle ? 0 : FlipStyles.adjustScale(16)
                        }}
                    >
                        {title}
                    </DefaultText>
                    {!!subtitle && (
                        <DefaultText Button3 color={theme.gray4}>
                            {subtitle}
                        </DefaultText>
                    )}
                </View>
            </RowView>
            {children}
        </RowView>
    );
};

const styles = StyleSheet.create({
    titleBlock: {
        justifyContent: "center",
        paddingVertical: FlipStyles.adjustScale(10)
    }
});
