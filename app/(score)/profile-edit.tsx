import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthSession, useFlipTheme } from "@/common";
import ProfileAvatar from "@/components/base/imgs/ProfileAvatar";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import { useUserProfile } from "@/hooks/user";
import FlipStyles from "@/styles";

const COPY = {
    title: "\ub0b4 \uc815\ubcf4 \uc218\uc815",
    save: "\uc800\uc7a5",
    name: "\ub2c9\ub124\uc784",
    organization: "\uc18c\uc18d(\uc120\ud0dd)",
    email: "\uc774\uba54\uc77c",
    changeEmail: "\uc774\uba54\uc77c \ubcc0\uacbd",
    password: "\ube44\ubc00\ubc88\ud638",
    changePassword: "\ube44\ubc00\ubc88\ud638 \ubcc0\uacbd",
    logout: "\ub85c\uadf8\uc544\uc6c3",
    leave: "\ud68c\uc6d0\ud0c8\ud1f4",
    saveSuccess: "\ud504\ub85c\ud544\uc774 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
    saveError: "\ud504\ub85c\ud544 \uc800\uc7a5 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.",
    imagePermissionTitle: "\uad8c\ud55c \ud544\uc694",
    imagePermissionMessage: "\ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \ubc14\uafb8\ub824\uba74 \uc0ac\uc9c4 \uc811\uadfc \uad8c\ud55c\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
    logoutTitle: "\ub85c\uadf8\uc544\uc6c3",
    logoutMessage: "\ud604\uc7ac \uacc4\uc815\uc5d0\uc11c \ub85c\uadf8\uc544\uc6c3\ud560\uae4c\uc694?",
    cancel: "\ucde8\uc18c",
    readyTitle: "\uc900\ube44 \uc911",
    readyMessage: "\ube44\ubc00\ubc88\ud638 \ubcc0\uacbd \uae30\ub2a5\uc740 \ub2e4\uc74c \ub2e8\uacc4\uc5d0\uc11c \uc5f0\uacb0\ud560 \uc608\uc815\uc785\ub2c8\ub2e4.",
    nameRequired: "\ub2c9\ub124\uc784\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
    namePlaceholder: "\ub2c9\ub124\uc784\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
    privacyPolicy: "\uac1c\uc778\uc815\ubcf4\ucc98\ub9ac\ubc29\uce68"
} as const;

export default function ProfileEditScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const {
        profile,
        isLoadingProfile,
        updateProfile,
        isUpdatingProfile,
        updateProfileImage,
        isUpdatingProfileImage
    } = useUserProfile();

    const [name, setName] = useState("");

    const profileData = profile?.data;
    const maskedPassword = useMemo(() => "\u2022".repeat(8), []);

    useEffect(() => {
        if (!profileData) {
            return;
        }

        setName(profileData.name ?? "");
    }, [profileData]);

    const canSave = name.trim().length > 0 && !isUpdatingProfile && !isUpdatingProfileImage;

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(COPY.saveError, COPY.nameRequired);
            return;
        }

        try {
            await updateProfile({
                name: name.trim()
            });
            Alert.alert(COPY.saveSuccess);
            router.back();
        } catch (error) {
            Alert.alert(COPY.saveError, error instanceof Error ? error.message : COPY.saveError);
        }
    };

    const handlePickProfileImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(COPY.imagePermissionTitle, COPY.imagePermissionMessage);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1]
        });

        if (result.canceled || !result.assets[0]) {
            return;
        }

        const asset = result.assets[0];
        const formData = new FormData();
        formData.append(
            "file",
            {
                uri: asset.uri,
                name: asset.fileName ?? `profile-${Date.now()}.jpg`,
                type: asset.mimeType ?? "image/jpeg"
            } as any
        );

        try {
            await updateProfileImage(formData);
        } catch (error) {
            Alert.alert(COPY.saveError, error instanceof Error ? error.message : COPY.saveError);
        }
    };

    const handleLogout = () => {
        Alert.alert(COPY.logoutTitle, COPY.logoutMessage, [
            {
                text: COPY.cancel,
                style: "cancel"
            },
            {
                text: COPY.logout,
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem("token");
                    clearAuthSession();
                    queryClient.clear();
                    router.replace("/(auth)");
                }
            }
        ]);
    };

    const handlePressPassword = () => {
        Alert.alert(COPY.readyTitle, COPY.readyMessage);
    };

    const handlePressLeave = () => {
        router.push("/legal/account-deletion");
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.white }]}>
            <Stack.Screen
                options={{
                    title: COPY.title,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <Pressable disabled={!canSave} onPress={handleSave}>
                            <DefaultText Button2 weight="700" color={canSave ? theme.gray2 : theme.gray6}>
                                {COPY.save}
                            </DefaultText>
                        </Pressable>
                    )
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarFrame}>
                            <ProfileAvatar uri={profileData?.profileImageUrl} size={FlipStyles.adjustScale(88)} />
                            <Pressable
                                onPress={handlePickProfileImage}
                                style={[styles.cameraButton, { backgroundColor: theme.gray2 }]}
                            >
                                {isUpdatingProfileImage ? (
                                    <ActivityIndicator size="small" color={theme.white} />
                                ) : (
                                    <FlipIcon icon="icon-plus" size={12} color={theme.white} />
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {isLoadingProfile ? (
                        <View style={styles.loadingSection}>
                            <ActivityIndicator color={theme.primary} />
                        </View>
                    ) : (
                        <View style={styles.formSection}>
                            <FormTextInput
                                value={name}
                                label={COPY.name}
                                placeholder={COPY.namePlaceholder}
                                onChangeText={setName}
                                containerStyle={styles.fieldGap}
                            />
                            <FormTextInput
                                value={profileData?.email ?? ""}
                                label={COPY.email}
                                disabled
                                hasValidButton
                                validText={COPY.changeEmail}
                                onValidPress={() => router.push("/(score)/email-change")}
                                containerStyle={styles.fieldGap}
                            />
                            <FormTextInput
                                value={maskedPassword}
                                label={COPY.password}
                                disabled
                                hasValidButton
                                validText={COPY.changePassword}
                                onValidPress={handlePressPassword}
                            />
                        </View>
                    )}

                    <View style={styles.bottomActionRow}>
                        <Pressable onPress={handleLogout} style={styles.bottomActionButton}>
                            <DefaultText Button3 color={theme.gray4}>
                                {COPY.logout}
                            </DefaultText>
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: theme.gray7 }]} />
                        <Pressable onPress={handlePressLeave} style={styles.bottomActionButton}>
                            <DefaultText Button3 color={theme.gray4}>
                                {COPY.leave}
                            </DefaultText>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => router.push("/legal/privacy-policy")} style={styles.privacyLink}>
                        <DefaultText Button3 weight="700" color={theme.gray4}>
                            {COPY.privacyPolicy}
                        </DefaultText>
                    </Pressable>

                    {isUpdatingProfile && (
                        <View style={styles.savingRow}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    flex: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: FlipStyles.adjustScale(24),
        paddingTop: FlipStyles.adjustScale(18),
        paddingBottom: FlipStyles.adjustScale(32)
    },
    avatarSection: {
        alignItems: "center",
        marginTop: FlipStyles.adjustScale(6),
        marginBottom: FlipStyles.adjustScale(24)
    },
    avatarFrame: {
        position: "relative"
    },
    cameraButton: {
        position: "absolute",
        right: FlipStyles.adjustScale(-2),
        bottom: FlipStyles.adjustScale(-2),
        width: FlipStyles.adjustScale(24),
        height: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center"
    },
    loadingSection: {
        minHeight: FlipStyles.adjustScale(220),
        alignItems: "center",
        justifyContent: "center"
    },
    formSection: {
        marginHorizontal: FlipStyles.adjustScale(10)
    },
    fieldGap: {
        marginBottom: FlipStyles.adjustScale(14)
    },
    bottomActionRow: {
        marginTop: FlipStyles.adjustScale(30),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bottomActionButton: {
        paddingHorizontal: FlipStyles.adjustScale(18),
        paddingVertical: FlipStyles.adjustScale(8)
    },
    divider: {
        width: 1,
        height: FlipStyles.adjustScale(12)
    },
    privacyLink: {
        marginTop: FlipStyles.adjustScale(14),
        alignItems: "center"
    },
    savingRow: {
        marginTop: FlipStyles.adjustScale(18),
        alignItems: "center"
    }
});
