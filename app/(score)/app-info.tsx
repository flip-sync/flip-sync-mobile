import { useFlipTheme } from "@/common";
import { getAppVersionPolicy, type AppVersionPolicy } from "@/common/api/app-version";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

type RecordValue = Record<string, unknown>;
type ApplicationModule = {
    nativeApplicationVersion?: string | null;
    nativeBuildVersion?: string | null;
};
type UpdateResult = {
    manifest?: unknown;
    isAvailable?: boolean;
    isRollBackToEmbedded?: boolean;
    isNew?: boolean;
};
type UpdatesModule = {
    isEnabled?: boolean;
    updateId?: string | null;
    channel?: string | null;
    runtimeVersion?: string | null;
    checkForUpdateAsync: () => Promise<UpdateResult>;
    fetchUpdateAsync: () => Promise<UpdateResult>;
    reloadAsync: () => Promise<void>;
    addUpdatesStateChangeListener?: (listener: (event: { context?: RecordValue }) => void) => { remove: () => void };
};
type UpdateStatus =
    | "idle"
    | "disabled"
    | "checking"
    | "available"
    | "downloading"
    | "restarting"
    | "storeOpening"
    | "latest"
    | "error";
type VersionInfo = {
    version: string;
    buildCode: string;
    label: string;
    id: string | null;
};

const COPY = {
    title: "\uC571 \uC815\uBCF4",
    version: "\uC571 \uBC84\uC804",
    runtime: "\uB7F0\uD0C0\uC784 \uBC84\uC804",
    channel: "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110",
    currentVersion: "\uD604\uC7AC \uBC84\uC804",
    latestVersion: "\uCD5C\uC2E0 \uBC84\uC804",
    checkButton: "\uCD5C\uC2E0 \uD655\uC778",
    updateButton: "\uC5C5\uB370\uC774\uD2B8",
    storeUpdateButton: "\uC2A4\uD1A0\uC5B4 \uC774\uB3D9",
    checking: "\uCD5C\uC2E0 \uBC84\uC804 \uD655\uC778 \uC911...",
    downloading: "\uC5C5\uB370\uC774\uD2B8 \uB2E4\uC6B4\uB85C\uB4DC \uC911...",
    restarting: "\uC571 \uB2E4\uC2DC \uC2DC\uC791 \uC911...",
    storeOpening: "\uC2A4\uD1A0\uC5B4\uB85C \uC774\uB3D9 \uC911...",
    storeOpenError: "\uC2A4\uD1A0\uC5B4\uB97C \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.",
    latest: "\uD604\uC7AC \uCD5C\uC2E0 \uBC84\uC804\uC785\uB2C8\uB2E4.",
    available: "\uC0C8 \uC5C5\uB370\uC774\uD2B8\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uBC84\uC804 \uC606\uC758 \uC5C5\uB370\uC774\uD2B8 \uBC84\uD2BC\uC73C\uB85C \uC801\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.",
    disabled: "\uD604\uC7AC \uBE4C\uB4DC\uC5D0\uC11C\uB294 EAS Update\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    error: "\uC5C5\uB370\uC774\uD2B8\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C\uB97C \uD655\uC778\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.",
    notChecked: "\uD655\uC778 \uC804",
    unknown: "-"
} as const;

const APP_INFO_LINKS: {
    label: string;
    description: string;
    href: "/legal/privacy-policy" | "/legal/account-deletion" | "/support";
}[] = [
    {
        label: "개인정보처리방침",
        description: "수집 정보와 이용 목적을 확인할 수 있어요.",
        href: "/legal/privacy-policy"
    },
    {
        label: "계정삭제 안내",
        description: "계정 삭제 전 확인사항과 삭제 요청을 볼 수 있어요.",
        href: "/legal/account-deletion"
    },
    {
        label: "고객 지원",
        description: "문제가 있을 때 문의할 수 있는 지원 정보를 볼 수 있어요.",
        href: "/support"
    }
];

function asRecord(value: unknown): RecordValue | undefined {
    return value && typeof value === "object" ? (value as RecordValue) : undefined;
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function toShortId(value?: string | null) {
    return value ? value.slice(0, 8) : null;
}

function getManifestId(manifest: unknown) {
    const record = asRecord(manifest);
    return asString(record?.id) ?? null;
}

function getManifestAppVersion(manifest: unknown, fallbackVersion: string) {
    const record = asRecord(manifest);
    const extra = asRecord(record?.extra);
    const expoClient = asRecord(extra?.expoClient);
    return asString(expoClient?.version) ?? fallbackVersion;
}

function getManifestBuildCode(manifest: unknown, fallbackBuildCode: string) {
    const record = asRecord(manifest);
    const extra = asRecord(record?.extra);
    const expoClient = asRecord(extra?.expoClient);
    const android = asRecord(expoClient?.android);
    const ios = asRecord(expoClient?.ios);
    const androidVersionCode = android?.versionCode;
    const iosBuildNumber = ios?.buildNumber;

    if (typeof androidVersionCode === "number" || typeof androidVersionCode === "string") {
        return String(androidVersionCode);
    }

    if (typeof iosBuildNumber === "number" || typeof iosBuildNumber === "string") {
        return String(iosBuildNumber);
    }

    return fallbackBuildCode;
}

function toVersionInfo(appVersion: string, buildCode: string, updateId?: string | null): VersionInfo {
    return {
        version: appVersion,
        buildCode,
        id: updateId ?? null,
        label: `v${appVersion} (${buildCode})`
    };
}

function toManifestVersionInfo(manifest: unknown, appVersion: string, buildCode: string): VersionInfo {
    const version = getManifestAppVersion(manifest, appVersion);
    const nextBuildCode = getManifestBuildCode(manifest, buildCode);
    const id = getManifestId(manifest);
    return toVersionInfo(version, nextBuildCode, id);
}

function toErrorMessage(error: unknown) {
    return error instanceof Error && error.message ? error.message : COPY.error;
}

function getConfigAppVersion() {
    return Constants.expoConfig?.version ?? COPY.unknown;
}

function getConfigBuildCode() {
    if (Platform.OS === "android") {
        return String(Constants.platform?.android?.versionCode ?? COPY.unknown);
    }

    return Constants.platform?.ios?.buildNumber ?? COPY.unknown;
}

function toBuildNumber(buildCode: string) {
    const parsed = Number.parseInt(buildCode, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

export default function AppInfoScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const updatesRef = useRef<UpdatesModule | null>(null);
    const autoCheckedVersionRef = useRef<string | null>(null);
    const fallbackAppVersion = getConfigAppVersion();
    const fallbackBuildCode = getConfigBuildCode();
    const [status, setStatus] = useState<UpdateStatus>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [latestManifest, setLatestManifest] = useState<unknown>(null);
    const [versionPolicy, setVersionPolicy] = useState<AppVersionPolicy | null>(null);
    const [appVersion, setAppVersion] = useState(fallbackAppVersion);
    const [buildCode, setBuildCode] = useState(fallbackBuildCode);
    const [updateInfo, setUpdateInfo] = useState<{
        channel: string;
        runtimeVersion: string;
        currentVersion: VersionInfo;
        latestVersion: VersionInfo | null;
    }>(() => {
        return {
            channel: COPY.unknown,
            runtimeVersion: Constants.expoRuntimeVersion ?? COPY.unknown,
            currentVersion: toVersionInfo(appVersion, buildCode, null),
            latestVersion: null
        };
    });
    const currentBuildNumber = toBuildNumber(buildCode);
    const storeLatestVersion = versionPolicy
        ? toVersionInfo(versionPolicy.latestVersion, String(versionPolicy.latestBuildVersion), null)
        : null;
    const hasStoreUpdate = Boolean(
        versionPolicy && currentBuildNumber !== null && currentBuildNumber < versionPolicy.latestBuildVersion
    );
    const hasRequiredStoreUpdate = Boolean(
        versionPolicy && currentBuildNumber !== null && currentBuildNumber < versionPolicy.minimumBuildVersion
    );
    const isBusy =
        status === "checking" || status === "downloading" || status === "restarting" || status === "storeOpening";
    const hasEasUpdate =
        !hasStoreUpdate &&
        status === "available" &&
        Boolean(latestManifest) &&
        Boolean(
            updateInfo.latestVersion &&
                (updateInfo.latestVersion.version !== updateInfo.currentVersion.version ||
                    updateInfo.latestVersion.buildCode !== updateInfo.currentVersion.buildCode ||
                    updateInfo.latestVersion.id !== updateInfo.currentVersion.id)
        );
    const hasAvailableUpdate = hasStoreUpdate || hasEasUpdate;
    const progressPercent = Math.max(0, Math.min(100, Math.round(progress * 100)));
    const storeStatusMessage =
        hasRequiredStoreUpdate
            ? versionPolicy?.forceUpdateMessage
            : hasStoreUpdate
              ? versionPolicy?.optionalUpdateMessage
              : null;
    const latestVersionLabel =
        hasStoreUpdate && storeLatestVersion
            ? storeLatestVersion.label
            : updateInfo.latestVersion?.label ?? updateInfo.currentVersion.label;
    const statusMessage =
        status === "storeOpening"
            ? COPY.storeOpening
            : storeStatusMessage
              ? storeStatusMessage
              : status === "disabled"
            ? COPY.disabled
            : status === "latest"
              ? COPY.latest
              : status === "available"
                ? COPY.available
                : status === "error"
                  ? errorMessage ?? COPY.error
                  : status === "checking"
                    ? COPY.checking
                    : status === "downloading"
                      ? `${COPY.downloading} ${progressPercent}%`
                      : status === "restarting"
                        ? COPY.restarting
                        : null;

    const checkLatest = useCallback(
        async (UpdatesOverride?: UpdatesModule) => {
            const Updates = UpdatesOverride ?? updatesRef.current;
            if (!Updates) {
                return;
            }

            setErrorMessage(null);
            setProgress(0);
            setStatus("checking");

            try {
                const checkResult = await Updates.checkForUpdateAsync();
                if (!checkResult.isAvailable || !checkResult.manifest) {
                    setLatestManifest(null);
                    setUpdateInfo(current => ({
                        ...current,
                        latestVersion: current.currentVersion
                    }));
                    setStatus("latest");
                    return;
                }

                setLatestManifest(checkResult.manifest);
                setUpdateInfo(current => ({
                    ...current,
                    latestVersion: toManifestVersionInfo(checkResult.manifest, appVersion, buildCode)
                }));
                setStatus("available");
            } catch (error) {
                setStatus("error");
                setLatestManifest(null);
                setErrorMessage(toErrorMessage(error));
            }
        },
        [appVersion, buildCode]
    );

    useEffect(() => {
        let isMounted = true;

        const loadVersionPolicy = async () => {
            try {
                const policy = await getAppVersionPolicy();
                if (isMounted) {
                    setVersionPolicy(policy);
                }
            } catch {
                // Version policy is a server-side convenience. EAS Update can still work without it.
            }
        };

        void loadVersionPolicy();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadApplicationInfo = async () => {
            try {
                const Application = (await import("expo-application")) as ApplicationModule;
                if (!isMounted) {
                    return;
                }

                const nextAppVersion = Application.nativeApplicationVersion ?? fallbackAppVersion;
                const nextBuildCode = Application.nativeBuildVersion ?? fallbackBuildCode;

                setAppVersion(nextAppVersion);
                setBuildCode(nextBuildCode);
                setUpdateInfo(current => ({
                    ...current,
                    currentVersion: toVersionInfo(nextAppVersion, nextBuildCode, current.currentVersion.id)
                }));
            } catch {
                // Existing binaries may not include this native module until the next AAB is installed.
            }
        };

        void loadApplicationInfo();

        return () => {
            isMounted = false;
        };
    }, [fallbackAppVersion, fallbackBuildCode]);

    useEffect(() => {
        let isMounted = true;
        let subscription: { remove: () => void } | undefined;
        const currentVersionKey = `${appVersion}:${buildCode}`;

        const loadUpdates = async () => {
            if (Platform.OS === "web" || __DEV__) {
                setStatus("disabled");
                return;
            }

            try {
                const Updates = (await import("expo-updates")) as UpdatesModule;
                if (!isMounted || !Updates.isEnabled) {
                    setStatus("disabled");
                    return;
                }

                updatesRef.current = Updates;
                setUpdateInfo(current => ({
                    ...current,
                    channel: Updates.channel ?? COPY.unknown,
                    runtimeVersion: Updates.runtimeVersion ?? Constants.expoRuntimeVersion ?? COPY.unknown,
                    currentVersion: toVersionInfo(appVersion, buildCode, Updates.updateId)
                }));

                subscription = Updates.addUpdatesStateChangeListener?.(event => {
                    const nativeProgress = event.context?.downloadProgress;
                    if (isMounted && typeof nativeProgress === "number") {
                        setProgress(nativeProgress);
                    }
                });

                if (autoCheckedVersionRef.current !== currentVersionKey) {
                    autoCheckedVersionRef.current = currentVersionKey;
                    await checkLatest(Updates);
                }
            } catch (error) {
                if (isMounted) {
                    setStatus("error");
                    setErrorMessage(toErrorMessage(error));
                }
            }
        };

        void loadUpdates();

        return () => {
            isMounted = false;
            subscription?.remove();
        };
    }, [appVersion, buildCode, checkLatest]);

    useEffect(() => {
        if (status !== "downloading") {
            return;
        }

        const interval = setInterval(() => {
            setProgress(current => Math.min(0.92, current + 0.04));
        }, 450);

        return () => clearInterval(interval);
    }, [status]);

    const handleCheckLatest = () => {
        const Updates = updatesRef.current;
        if (!Updates || isBusy) {
            return;
        }

        void checkLatest(Updates);
    };

    const handleOpenStore = async () => {
        if (!versionPolicy || isBusy) {
            return;
        }

        setErrorMessage(null);
        setStatus("storeOpening");

        try {
            await Linking.openURL(versionPolicy.storeUrl);
            setStatus("idle");
        } catch {
            setStatus("error");
            setErrorMessage(COPY.storeOpenError);
        }
    };

    const handleApplyUpdate = async () => {
        const Updates = updatesRef.current;
        if (!Updates || !latestManifest || isBusy) {
            return;
        }

        setErrorMessage(null);
        setStatus("downloading");
        setProgress(0.08);

        try {
            const fetchResult = await Updates.fetchUpdateAsync();
            if (!fetchResult.isNew && !fetchResult.isRollBackToEmbedded) {
                setStatus("latest");
                return;
            }

            setProgress(1);
            setStatus("restarting");
            await Updates.reloadAsync();
        } catch (error) {
            setStatus("error");
            setProgress(0);
            setErrorMessage(toErrorMessage(error));
        }
    };

    const handleUpdatePress = () => {
        if (hasStoreUpdate) {
            void handleOpenStore();
            return;
        }

        void handleApplyUpdate();
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: theme.white }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.heroCard, { backgroundColor: theme.primaryLight }]}>
                <DefaultText Title3 weight="800" color={theme.gray1}>
                    {COPY.title}
                </DefaultText>
                <DefaultText Body2 color={theme.gray4} style={styles.heroDescription}>
                    {"\uBA3C\uC800 \uCD5C\uC2E0 \uBC84\uC804\uC744 \uD655\uC778\uD558\uACE0, \uD604\uC7AC \uBC84\uC804\uACFC \uB2E4\uB97C \uB54C\uB9CC \uC218\uB3D9\uC73C\uB85C \uC5C5\uB370\uC774\uD2B8\uD560 \uC218 \uC788\uC5B4\uC694."}
                </DefaultText>
            </View>

            <View style={[styles.infoCard, { borderColor: theme.gray7 }]}>
                <InfoRow label={COPY.runtime} value={updateInfo.runtimeVersion} />
                <InfoRow label={COPY.channel} value={updateInfo.channel} />
                <InfoRow
                    label={COPY.latestVersion}
                    value={latestVersionLabel}
                    action={
                        <SmallButton
                            disabled={isBusy || status === "disabled" || hasStoreUpdate}
                            label={status === "checking" ? "\uD655\uC778 \uC911" : COPY.checkButton}
                            onPress={handleCheckLatest}
                            variant="outline"
                        />
                    }
                />
                <InfoRow
                    label={COPY.currentVersion}
                    value={updateInfo.currentVersion.label}
                    action={
                        <SmallButton
                            disabled={!hasAvailableUpdate || isBusy}
                            label={
                                status === "storeOpening"
                                    ? "\uC774\uB3D9 \uC911"
                                    : hasStoreUpdate
                                      ? COPY.storeUpdateButton
                                      : status === "downloading"
                                        ? "\uB2E4\uC6B4\uB85C\uB4DC"
                                        : COPY.updateButton
                            }
                            onPress={handleUpdatePress}
                            variant="primary"
                        />
                    }
                />
            </View>

            <View style={[styles.linkCard, { borderColor: theme.gray7 }]}>
                <DefaultText Button2 weight="800" color={theme.gray2}>
                    안내 및 지원
                </DefaultText>
                {APP_INFO_LINKS.map(item => (
                    <Pressable
                        key={item.href}
                        onPress={() => router.push(item.href)}
                        style={[styles.linkRow, { borderTopColor: theme.gray7 }]}
                    >
                        <View style={styles.linkTextGroup}>
                            <DefaultText Body2 weight="800" color={theme.gray2}>
                                {item.label}
                            </DefaultText>
                            <DefaultText Button3 color={theme.gray5}>
                                {item.description}
                            </DefaultText>
                        </View>
                        <DefaultText Button3 weight="800" color={theme.primary}>
                            보기
                        </DefaultText>
                    </Pressable>
                ))}
            </View>

            {(status === "downloading" || status === "restarting") && (
                <View style={[styles.progressTrack, { backgroundColor: theme.gray8 }]}>
                    <View
                        style={[
                            styles.progressValue,
                            {
                                width: `${Math.max(4, progressPercent)}%`,
                                backgroundColor: theme.primary
                            }
                        ]}
                    />
                </View>
            )}

            {statusMessage && (
                <DefaultText Button3 color={status === "error" ? theme.red : theme.gray4} style={styles.statusMessage}>
                    {statusMessage}
                </DefaultText>
            )}
        </ScrollView>
    );
}

function InfoRow({
    label,
    value,
    action
}: {
    label: string;
    value: string;
    action?: React.ReactNode;
}) {
    const theme = useFlipTheme();

    return (
        <View style={styles.infoRow}>
            <View style={styles.infoTextGroup}>
                <DefaultText Button3 color={theme.gray5}>
                    {label}
                </DefaultText>
                <DefaultText Body2 weight="700" color={theme.gray2} numberOfLines={1}>
                    {value}
                </DefaultText>
            </View>
            {action}
        </View>
    );
}

function SmallButton({
    disabled,
    label,
    onPress,
    variant
}: {
    disabled: boolean;
    label: string;
    onPress: () => void;
    variant: "outline" | "primary";
}) {
    const theme = useFlipTheme();
    const isPrimary = variant === "primary";

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[
                styles.smallButton,
                {
                    backgroundColor: disabled ? theme.gray8 : isPrimary ? theme.primary : theme.white,
                    borderColor: disabled ? theme.gray7 : isPrimary ? theme.primary : theme.primaryLight
                }
            ]}
        >
            <DefaultText Button3 weight="800" color={disabled ? theme.gray5 : isPrimary ? theme.white : theme.primary}>
                {label}
            </DefaultText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: FlipStyles.basePadding,
        gap: FlipStyles.adjustScale(14)
    },
    heroCard: {
        borderRadius: FlipStyles.adjustScale(24),
        padding: FlipStyles.adjustScale(20)
    },
    heroDescription: {
        marginTop: FlipStyles.adjustScale(8)
    },
    infoCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(18),
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(8)
    },
    infoRow: {
        minHeight: FlipStyles.adjustScale(52),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(12)
    },
    infoTextGroup: {
        flex: 1,
        minWidth: 0,
        gap: FlipStyles.adjustScale(2)
    },
    linkCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(18),
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingTop: FlipStyles.adjustScale(14)
    },
    linkRow: {
        minHeight: FlipStyles.adjustScale(62),
        borderTopWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(12)
    },
    linkTextGroup: {
        flex: 1,
        minWidth: 0,
        gap: FlipStyles.adjustScale(4)
    },
    smallButton: {
        minHeight: FlipStyles.adjustScale(30),
        minWidth: FlipStyles.adjustScale(72),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(999),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(10)
    },
    progressTrack: {
        height: FlipStyles.adjustScale(8),
        borderRadius: FlipStyles.adjustScale(999),
        overflow: "hidden"
    },
    progressValue: {
        height: "100%",
        borderRadius: FlipStyles.adjustScale(999)
    },
    statusMessage: {
        textAlign: "center"
    }
});
