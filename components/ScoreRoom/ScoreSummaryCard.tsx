import { memo } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
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
    const hasSharedAction = showSharedAction && !!onPressSharedAction;
    const avatarIndent = FlipStyles.adjustScale(52);

    return (
        <View style={[styles.row, { alignItems: isMine ? "flex-start" : "flex-end" }]}>
            <View style={styles.messageGroup}>
                <View
                    style={[
                        styles.headerRow,
                        {
                            flexDirection: isMine ? "row" : "row-reverse"
                        }
                    ]}
                >
                    <ProfileAvatar uri={uploadedUserProfileImageUrl} size={FlipStyles.adjustScale(44)} />
                    <DefaultText Body2 weight="500" color={theme.gray2} style={{ textAlign: isMine ? "left" : "right" }}>
                        {uploadedUserName}
                    </DefaultText>
                </View>

                <View
                    style={[
                        styles.messageBlock,
                        {
                            alignItems: isMine ? "flex-start" : "flex-end",
                            marginLeft: isMine ? avatarIndent : 0,
                            marginRight: isMine ? 0 : avatarIndent
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.cardRow,
                            {
                                flexDirection: isMine ? "row" : "row-reverse"
                            }
                        ]}
                    >
                        <Pressable
                            onPress={onPress}
                            style={[
                                styles.cardBody,
                                {
                                    backgroundColor: theme.white,
                                    borderColor: theme.gray7
                                }
                            ]}
                        >
                            <DefaultImage
                                style={[styles.thumbnail, { borderColor: theme.gray7 }]}
                                img={thumbnail ? undefined : "imgs-score-active"}
                                uri={thumbnail}
                                aspectRatio={2 / 1}
                                cachePolicy="memory-disk"
                                transition={120}
                                recyclingKey={thumbnail ?? `${title}-${uploadedUserName}`}
                            />
                            <View style={styles.textBlock}>
                                <DefaultText Body2 color={theme.gray2} weight="700">
                                    {title}
                                </DefaultText>
                                <DefaultText Title4 color={theme.gray2} weight="700" numberOfLines={2}>
                                    {singer}
                                </DefaultText>
                                <DefaultText Body2 color={theme.gray2} numberOfLines={2}>
                                    {code}
                                </DefaultText>
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
        width: FlipStyles.adjustScale(250),
        maxWidth: "100%",
        gap: FlipStyles.adjustScale(10),
        borderRadius: FlipStyles.adjustScale(18),
        borderWidth: 1,
        padding: FlipStyles.adjustScale(12)
    },
    textBlock: {
        gap: FlipStyles.adjustScale(4)
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
