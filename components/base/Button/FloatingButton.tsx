import { StyleSheet, TouchableOpacity } from "react-native";
import FlipIcon from "../imgs/FlipIcon";
import { useTheme } from "@react-navigation/native";
import { useFlipTheme } from "@/common";

export const FloatingButton = ({ onPress }: { onPress: () => void }) => {
    const theme = useFlipTheme();
    return (
        <TouchableOpacity
            style={[
                styles.fab,
                {
                    backgroundColor: theme.primary
                }
            ]}
            onPress={onPress}
        >
            <FlipIcon icon="icon-plus" size={18} color="white" />
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        zIndex: 20,
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    }
});
