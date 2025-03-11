import FlipStyles from "@/styles";
import RowView from "./RowView";
import { TouchableOpacity } from "react-native";
import FlipIcon from "./imgs/FlipIcon";
import DefaultText from "./Text";
import { useRouter } from "expo-router";
import { useFlipTheme } from "@/common";

export const Header = ({ children, title }: { children?: React.ReactNode; title?: string }) => {
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
                <DefaultText
                    Title4
                    style={{
                        paddingVertical: FlipStyles.adjustScale(16)
                    }}
                >
                    {title}
                </DefaultText>
            </RowView>
            {children}
        </RowView>
    );
};
