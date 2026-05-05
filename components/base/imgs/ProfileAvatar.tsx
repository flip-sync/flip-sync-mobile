import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import FlipStyles from "@/styles";

type ProfileAvatarProps = {
    uri?: string | null;
    size?: number;
};

const DEFAULT_PROFILE_SOURCE = require("../../../assets/icons/icon-profile-default.png");

export default function ProfileAvatar({ uri, size = FlipStyles.adjustScale(44) }: ProfileAvatarProps) {
    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2
                }
            ]}
        >
            <Image
                source={uri ? { uri } : DEFAULT_PROFILE_SOURCE}
                contentFit="cover"
                transition={120}
                cachePolicy="memory-disk"
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden"
    }
});
