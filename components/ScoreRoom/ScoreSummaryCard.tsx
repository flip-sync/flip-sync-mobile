import { memo } from "react";
import { Pressable, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useFlipTheme } from "@/common";
import FlipStyles from "@/styles";
import DefaultImage from "../base/imgs/FlipImage";
import ProfileAvatar from "../base/imgs/ProfileAvatar";
import DefaultText from "../base/Text";

type ScoreSummaryCardProps = {
    title: string;
    singer: string;
    code: string;
    uploadedUserName: string;
    uploadedUserProfileImageUrl?: string | null;
    thumbnail?: string;
    isMine?: boolean;
    showSharedAction?: boolean;
    onPress: () => void;
    onPressSharedAction?: () => void;
};

export const ScoreSummaryCard = memo(function ScoreSummaryCard({
    title,
    singer,
    code,
    uploadedUserName,
    uploadedUserProfileImageUrl,
    thumbnail,
    isMine = false,
    showSharedAction = false,
    onPress,
    onPressSharedAction
}: ScoreSummaryCardProps) {
    const theme = useFlipTheme();
    const { width } = useWindowDimensions();
    const hasSharedAction = showSharedAction && !!onPressSharedAction;
    const avatarIndent = FlipStyles.adjustScale(52);
    const sharedActionSpace = hasSharedAction ? FlipStyles.adjustScale(42) : 0;
    const cardWidth = Math.min(
        FlipStyles.adjustScale(320),
        Math.max(FlipStyles.adjustScale(236), width - FlipStyles.adjustScale(120) - sharedActionSpace)
    );

    return (
        <View style={[styles.row, { alignItems: isMine ? "flex-end" : "flex-start" }]}>
            <View style={styles.messageGroup}>
                <View
                    style={[
                        styles.headerRow,
                        {
                            flexDirection: isMine ? "row-reverse" : "row"
                        }
                    ]}
                >
                    <ProfileAvatar uri={uploadedUserProfileImageUrl} size={FlipStyles.adjustScale(44)} />
                    <DefaultText Body2 weight="500" color={theme.gray2} style={{ textAlign: isMine ? "right" : "left" }}>
                        {uploadedUserName}
                    </DefaultText>
                </View>

                <View
                    style={[
                        styles.messageBlock,
                        {
                            alignItems: isMine ? "flex-end" : "flex-start",
                            marginLeft: isMine ? 0 : avatarIndent,
                            marginRight: isMine ? avatarIndent : 0
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.cardRow,
                            {
                                flexDirection: isMine ? "row-reverse" : "row"
                            }
                        ]}
                    >
                        <Pressable
                            onPress={onPress}
                            style={[
                                styles.cardBody,
                                {
                                    width: cardWidth,
                                    backgroundColor: theme.white,
                                    borderColor: theme.gray7
                                }
                            ]}
                        >
                            <DefaultImage
                                style={[styles.thumbnail, { borderColor: theme.gray7 }]}
                                img={thumbnail ? undefined : "imgs-score-active"}
                                uri={thumbnail}
                                aspectRatio={16 / 9}
                                contentPosition="top center"
                                cachePolicy="memory-disk"
                                transition={120}
                                recyclingKey={thumbnail ?? `${title}-${uploadedUserName}`}
                            />
                            <View style={styles.textBlock}>
                                <DefaultText Title4 color={theme.gray2} weight="800" numberOfLines={2}>
                                    {title}
                                </DefaultText>
                                <View style={styles.metaRow}>
                                    <DefaultText Body2 color={theme.gray4} numberOfLines={1} style={styles.singerText}>
                                        {singer}
                                    </DefaultText>
                                    <DefaultText Button2 color={theme.primary} weight="700" numberOfLines={1}>
                                        {code}
                                    </DefaultText>
                                </View>
                            </View>
                        </Pressable>

                        {hasSharedAction && (
                            <TouchableOpacity onPress={onPressSharedAction} style={styles.sharedActionButton}>
                                <Image
                                    source={require("../../assets/icons/icon-room-shared.png")}
                                    contentFit="contain"
                                    style={styles.sharedActionIcon}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
});

ScoreSummaryCard.displayName = "ScoreSummaryCard";

const styles = StyleSheet.create({
    row: {
        width: "100%"
    },
    messageGroup: {
        maxWidth: "88%",
        gap: FlipStyles.adjustScale(6)
    },
    headerRow: {
        alignItems: "center",
        gap: FlipStyles.adjustScale(8)
    },
    messageBlock: {
        gap: FlipStyles.adjustScale(8),
        maxWidth: "100%"
    },
    cardRow: {
        alignItems: "flex-end",
        gap: FlipStyles.adjustScale(10)
    },
    cardBody: {
        maxWidth: "100%",
        gap: FlipStyles.adjustScale(12),
        borderRadius: FlipStyles.adjustScale(18),
        borderWidth: 1,
        padding: FlipStyles.adjustScale(10)
    },
    textBlock: {
        gap: FlipStyles.adjustScale(6),
        paddingHorizontal: FlipStyles.adjustScale(2),
        paddingBottom: FlipStyles.adjustScale(2)
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(12)
    },
    singerText: {
        flexShrink: 1
    },
    thumbnail: {
        width: "100%",
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(10)
    },
    sharedActionButton: {
        width: FlipStyles.adjustScale(32),
        height: FlipStyles.adjustScale(32),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: FlipStyles.adjustScale(10),
        padding: FlipStyles.adjustScale(2)
    },
    sharedActionIcon: {
        width: "100%",
        height: "100%"
    }
});
