import { tRoomDetail } from "@/api/room";
import { tConnectedRoomMember } from "@/api/score/types";
import { useFlipTheme } from "@/common";
import ProfileAvatar from "@/components/base/imgs/ProfileAvatar";
import DefaultText from "@/components/base/Text";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import FlipStyles from "@/styles";
import Modal from "react-native-modal";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type RoomSidebarProps = {
    groupId: number;
    roomTitle: string;
    creatorId?: number;
    visible: boolean;
    connectedMembers: tConnectedRoomMember[];
    groupMembers: tRoomDetail[];
    onClose: () => void;
    onInvite: () => void;
};

export const RoomSidebar = ({
    groupId,
    roomTitle,
    creatorId,
    visible,
    connectedMembers,
    groupMembers,
    onClose,
    onInvite
}: RoomSidebarProps) => {
    const theme = useFlipTheme();

    const fallbackMembers = groupMembers.map(member => ({
        userId: member.id,
        userName: member.name,
        isCreator: member.id === creatorId,
        profileImageUrl: member.profileImageUrl
    }));
    const visibleMembers = connectedMembers.length > 0 ? connectedMembers : fallbackMembers;

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            backdropOpacity={0.32}
            style={styles.modal}
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <View style={[styles.panel, { backgroundColor: theme.white }]}> 
                <View style={styles.headerSection}>
                    <View style={styles.headerCopy}>
                        <DefaultText Title4 weight="700" color={theme.gray2}>
                            채팅방 정보
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray4}>
                            {roomTitle}
                        </DefaultText>
                        <DefaultText Button3 color={theme.gray5}>
                            방 번호 {groupId}
                        </DefaultText>
                    </View>
                    <TouchableOpacity
                        style={[styles.closeButton, { borderColor: theme.gray7 }]}
                        onPress={onClose}
                    >
                        <FlipIcon icon="icon-close" size={16} color={theme.gray3} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onInvite}
                    style={[styles.inviteButton, { backgroundColor: theme.primaryLight }]}
                >
                    <DefaultText Button2 weight="700" color={theme.primary}>
                        초대하기
                    </DefaultText>
                </TouchableOpacity>

                <View style={styles.section}>
                    <DefaultText Body1 weight="700" color={theme.gray2}>
                        접속 중 멤버
                    </DefaultText>
                    <DefaultText Button3 color={theme.gray4}>
                        {connectedMembers.length}명 접속 중
                    </DefaultText>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.memberList}>
                    {visibleMembers.map(member => (
                        <View
                            key={`${member.userId}-${member.userName}`}
                            style={[styles.memberRow, { borderBottomColor: theme.gray7 }]}
                        >
                            <ProfileAvatar uri={member.profileImageUrl} size={FlipStyles.adjustScale(36)} />
                            <View style={styles.memberCopy}>
                                <DefaultText Body2 weight="700" color={theme.gray2}>
                                    {member.userName}
                                </DefaultText>
                                <DefaultText Button3 color={theme.gray4}>
                                    {connectedMembers.length > 0 ? "현재 접속 중" : "참여 멤버"}
                                </DefaultText>
                            </View>
                            {member.isCreator && (
                                <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}> 
                                    <DefaultText Button3 weight="700" color={theme.primary}>
                                        방장
                                    </DefaultText>
                                </View>
                            )}
                        </View>
                    ))}

                    {visibleMembers.length === 0 && (
                        <View style={styles.emptyState}>
                            <DefaultText Body2 color={theme.gray5}>
                                현재 표시할 멤버가 없습니다.
                            </DefaultText>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        alignItems: "flex-end",
        justifyContent: "flex-start"
    },
    panel: {
        width: "78%",
        maxWidth: FlipStyles.adjustScale(360),
        height: "100%",
        paddingTop: FlipStyles.adjustScale(24),
        paddingHorizontal: FlipStyles.adjustScale(20)
    },
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(16)
    },
    headerCopy: {
        gap: FlipStyles.adjustScale(4),
        flex: 1
    },
    closeButton: {
        width: FlipStyles.adjustScale(36),
        height: FlipStyles.adjustScale(36),
        borderRadius: FlipStyles.adjustScale(18),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    inviteButton: {
        height: FlipStyles.adjustScale(44),
        borderRadius: FlipStyles.adjustScale(12),
        marginTop: FlipStyles.adjustScale(20),
        alignItems: "center",
        justifyContent: "center"
    },
    section: {
        gap: FlipStyles.adjustScale(4),
        marginTop: FlipStyles.adjustScale(24),
        marginBottom: FlipStyles.adjustScale(8)
    },
    memberList: {
        paddingBottom: FlipStyles.adjustScale(40)
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(12),
        borderBottomWidth: 1
    },
    memberCopy: {
        flex: 1
    },
    badge: {
        minWidth: FlipStyles.adjustScale(42),
        height: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(8)
    },
    emptyState: {
        paddingVertical: FlipStyles.adjustScale(24),
        alignItems: "center"
    }
});

