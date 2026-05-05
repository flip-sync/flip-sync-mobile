import { useFlipTheme } from "@/common";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

type RoomQuickActionMenuProps = {
    visible: boolean;
    onToggle: () => void;
    onOpenArchive: () => void;
    onOpenImageUpload: () => void;
    onOpenScoreRegister: () => void;
    onOpenScoreSend: () => void;
};

type QuickActionItem = {
    key: string;
    label: string;
    icon: "icon-score" | "icon-profile" | "icon-score-add" | "icon-plus";
    onPress: () => void;
    primary?: boolean;
};

export const RoomQuickActionMenu = ({
    visible,
    onToggle,
    onOpenArchive,
    onOpenImageUpload,
    onOpenScoreRegister,
    onOpenScoreSend
}: RoomQuickActionMenuProps) => {
    const theme = useFlipTheme();

    const actions: QuickActionItem[] = [
        {
            key: "archive",
            label: "악보 창고",
            icon: "icon-score",
            onPress: onOpenArchive
        },
        {
            key: "library",
            label: "내 이미지",
            icon: "icon-profile",
            onPress: onOpenImageUpload
        },
        {
            key: "register",
            label: "악보 등록",
            icon: "icon-score-add",
            onPress: onOpenScoreRegister
        },
        {
            key: "send",
            label: "악보 보내기",
            icon: "icon-plus",
            onPress: onOpenScoreSend,
            primary: true
        }
    ];

    return (
        <>
            {visible && <Pressable style={styles.overlay} onPress={onToggle} />}

            <View style={styles.root} pointerEvents="box-none">
                {visible && (
                    <View style={styles.actionList} pointerEvents="box-none">
                        {actions.map(action => (
                            <TouchableOpacity
                                key={action.key}
                                activeOpacity={0.9}
                                onPress={action.onPress}
                                style={[
                                    styles.actionButton,
                                    {
                                        backgroundColor: action.primary ? theme.primary : theme.primaryLight,
                                        borderColor: action.primary ? theme.primary : theme.gray7
                                    }
                                ]}
                            >
                                <FlipIcon
                                    icon={action.icon}
                                    size={16}
                                    color={action.primary ? theme.white : theme.primary}
                                />
                                <DefaultText Button2 color={action.primary ? theme.white : theme.primary} weight="700">
                                    {action.label}
                                </DefaultText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onToggle}
                    style={[
                        styles.fab,
                        {
                            backgroundColor: theme.primary
                        }
                    ]}
                >
                    <FlipIcon
                        icon="icon-plus"
                        size={18}
                        color={theme.white}
                        style={visible ? styles.fabIconOpen : undefined}
                    />
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#00000012"
    },
    root: {
        position: "absolute",
        right: FlipStyles.adjustScale(20),
        bottom: FlipStyles.adjustScale(20),
        alignItems: "flex-end",
        zIndex: 40
    },
    actionList: {
        gap: FlipStyles.adjustScale(12),
        marginBottom: FlipStyles.adjustScale(16),
        alignItems: "flex-end"
    },
    actionButton: {
        minWidth: FlipStyles.adjustScale(154),
        height: FlipStyles.adjustScale(46),
        borderRadius: FlipStyles.adjustScale(12),
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(8),
        paddingHorizontal: FlipStyles.adjustScale(16),
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4
    },
    fab: {
        width: FlipStyles.adjustScale(60),
        height: FlipStyles.adjustScale(60),
        borderRadius: FlipStyles.adjustScale(30),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 6
    },
    fabIconOpen: {
        transform: [{ rotate: "45deg" }]
    }
});
