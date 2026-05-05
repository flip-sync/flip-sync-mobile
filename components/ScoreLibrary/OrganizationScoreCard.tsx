import DefaultImage from "@/components/base/imgs/FlipImage";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { Pressable, StyleSheet, View } from "react-native";

type OrganizationScoreCardProps = {
    title: string;
    singer: string;
    code: string;
    thumbnail: string;
    onPress: () => void;
    sendMode?: boolean;
    canDelete?: boolean;
    onPressDelete?: () => void;
};

export const OrganizationScoreCard = ({
    title,
    singer,
    code,
    thumbnail,
    onPress,
    canDelete = false,
    onPressDelete
}: OrganizationScoreCardProps) => {
    return (
        <Pressable onPress={onPress} style={styles.card}>
            <View style={styles.imageFrame}>
                <DefaultImage
                    uri={thumbnail}
                    fullWidth
                    aspectRatio={1.42}
                    style={styles.thumbnail}
                    cachePolicy="memory-disk"
                    recyclingKey={thumbnail}
                />
                {canDelete && onPressDelete ? (
                    <Pressable
                        onPress={event => {
                            event.stopPropagation();
                            onPressDelete();
                        }}
                        style={styles.deleteButton}
                    >
                        <DefaultText Button3 weight="700" color="#FFFFFF">
                            삭제
                        </DefaultText>
                    </Pressable>
                ) : null}
                <View style={styles.titleOverlay}>
                    <DefaultText Body1 weight="700" numberOfLines={1} color="#FFFFFF">
                        {title}
                    </DefaultText>
                </View>
            </View>

            <View style={styles.metaRow}>
                <DefaultText Body2 numberOfLines={1} color="#4F5562" style={styles.metaSinger}>
                    {singer}
                </DefaultText>
                <DefaultText Body2 numberOfLines={1} color="#4F5562">
                    {code}
                </DefaultText>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        minWidth: 0,
        gap: FlipStyles.adjustScale(10)
    },
    imageFrame: {
        position: "relative",
        overflow: "hidden",
        borderRadius: FlipStyles.adjustScale(12),
        backgroundColor: "#E8EEF4"
    },
    thumbnail: {
        width: "100%",
        borderRadius: FlipStyles.adjustScale(12),
        backgroundColor: "#E8EEF4"
    },
    deleteButton: {
        position: "absolute",
        top: FlipStyles.adjustScale(10),
        right: FlipStyles.adjustScale(10),
        zIndex: 4,
        minHeight: FlipStyles.adjustScale(26),
        paddingHorizontal: FlipStyles.adjustScale(10),
        borderRadius: FlipStyles.adjustScale(999),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(27, 31, 40, 0.72)"
    },
    titleOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(12),
        backgroundColor: "rgba(0, 0, 0, 0.28)"
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: FlipStyles.adjustScale(8),
        minHeight: FlipStyles.adjustScale(22)
    },
    metaSinger: {
        flex: 1,
        marginRight: FlipStyles.adjustScale(8)
    }
});
