import { useFlipTheme } from "@/common";
import { getAppVersionPolicy, type AppVersionPolicy } from "@/common/api/app-version";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import Constants from "expo-constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Linking, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UpdatePolicy = "optional" | "required";
type UpdateStep = "idle" | "available" | "downloading" | "ready" | "restarting";
type RecordValue = Record<string, unknown>;
type ApplicationModule = {
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
    checkForUpdateAsync: () => Promise<UpdateResult>;
    fetchUpdateAsync: () => Promise<UpdateResult>;
    reloadAsync: () => Promise<void>;
    addUpdatesStateChangeListener?: (listener: (event: { context?: RecordValue }) => void) => { remove: () => void };
};

const DEFAULT_UPDATE_MESSAGE =
    "\uB354 \uC548\uC815\uC801\uC778 \uC0AC\uC6A9\uC744 \uC704\uD574 \uC0C8 \uC5C5\uB370\uC774\uD2B8\uAC00 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
const DEFAULT_UPDATE_ERROR_MESSAGE =
    "\uC5C5\uB370\uC774\uD2B8\uB97C \uC9C4\uD589\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C \uC0C1\uD0DC\uB97C \uD655\uC778\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.";
const DEFAULT_STORE_ERROR_MESSAGE =
    "\uC2A4\uD1A0\uC5B4\uB97C \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.";

function asRecord(value: unknown): RecordValue | undefined {
    return value && typeof value === "object" ? (value as RecordValue) : undefined;
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function readPolicyFromRecord(record?: RecordValue): UpdatePolicy | undefined {
    const rawPolicy = asString(record?.policy ?? record?.mode ?? record?.type)?.toLowerCase();
    return rawPolicy === "required" ? "required" : rawPolicy === "optional" ? "optional" : undefined;
}

function readUpdatePolicy(manifest: unknown): UpdatePolicy {
    const manifestRecord = asRecord(manifest);
    const extra = asRecord(manifestRecord?.extra);
    const expoClient = asRecord(extra?.expoClient);
    const expoClientExtra = asRecord(expoClient?.extra);

    return (
        readPolicyFromRecord(asRecord(extra?.updatePolicy)) ??
        readPolicyFromRecord(asRecord(extra?.update)) ??
        readPolicyFromRecord(asRecord(expoClientExtra?.updatePolicy)) ??
        readPolicyFromRecord(asRecord(expoClientExtra?.update)) ??
        "optional"
    );
}

function readUpdateMessage(manifest: unknown): string {
    const manifestRecord = asRecord(manifest);
    const extra = asRecord(manifestRecord?.extra);
    const expoClient = asRecord(extra?.expoClient);
    const expoClientExtra = asRecord(expoClient?.extra);
    const directMessage =
        asString(asRecord(extra?.updatePolicy)?.message) ??
        asString(asRecord(extra?.update)?.message) ??
        asString(asRecord(expoClientExtra?.updatePolicy)?.message) ??
        asString(asRecord(expoClientExtra?.update)?.message);

    return directMessage?.trim() || DEFAULT_UPDATE_MESSAGE;
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return DEFAULT_UPDATE_ERROR_MESSAGE;
}

function getConfigBuildVersion() {
    if (Platform.OS === "android") {
        return String(Constants.platform?.android?.versionCode ?? "");
    }

    return Constants.platform?.ios?.buildNumber ?? "";
}

function toBuildNumber(buildVersion?: string | null) {
    const parsed = Number.parseInt(buildVersion ?? "", 10);
    return Number.isFinite(parsed) ? parsed : null;
}

export default function AppUpdateGate() {
    const theme = useFlipTheme();
    const updatesRef = useRef<UpdatesModule | null>(null);
    const isMountedRef = useRef(true);
    const [availableManifest, setAvailableManifest] = useState<unknown>(undefined);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [step, setStep] = useState<UpdateStep>("idle");
    const [actionError, setActionError] = useState<string | null>(null);
    const [isModuleReady, setIsModuleReady] = useState(false);
    const [storePolicy, setStorePolicy] = useState<AppVersionPolicy | null>(null);
    const [currentBuildVersion, setCurrentBuildVersion] = useState<number | null>(null);
    const [isOpeningStore, setIsOpeningStore] = useState(false);
    const easUpdatePolicy = useMemo(() => readUpdatePolicy(availableManifest), [availableManifest]);
    const easUpdateMessage = useMemo(() => readUpdateMessage(availableManifest), [availableManifest]);
    const isEasRequired = easUpdatePolicy === "required";
    const isStoreRequired = Boolean(
        storePolicy && currentBuildVersion !== null && currentBuildVersion < storePolicy.minimumBuildVersion
    );
    const isBusy = isOpeningStore || step === "downloading" || step === "restarting";
    const visible = isStoreRequired || (isModuleReady && isEasRequired && step !== "idle");
    const progress = Math.max(
        0,
        Math.min(1, step === "ready" || step === "restarting" ? 1 : step === "downloading" ? downloadProgress : 0)
    );
    const buttonLabel =
        isStoreRequired
            ? isOpeningStore
                ? "\uC2A4\uD1A0\uC5B4 \uC774\uB3D9 \uC911..."
                : "\uC2A4\uD1A0\uC5B4\uB85C \uC774\uB3D9"
            : step === "restarting"
            ? "\uC571 \uB2E4\uC2DC \uC2DC\uC791 \uC911..."
            : step === "downloading"
              ? "\uC5C5\uB370\uC774\uD2B8 \uC911..."
              : "\uC5C5\uB370\uC774\uD2B8\uD558\uAE30";
    const statusLabel =
        isStoreRequired
            ? "\uC2A4\uD1A0\uC5B4\uC5D0\uC11C \uC0C8 \uBC84\uC804\uC744 \uC124\uCE58\uD574\uC57C \uC571\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694."
            : step === "restarting"
            ? "\uC571\uC744 \uB2E4\uC2DC \uC2DC\uC791\uD558\uB294 \uC911\uC785\uB2C8\uB2E4."
            : step === "ready"
              ? "\uC5C5\uB370\uC774\uD2B8 \uC801\uC6A9 \uC900\uBE44\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
              : step === "downloading"
                ? `\uC5C5\uB370\uC774\uD2B8 \uB2E4\uC6B4\uB85C\uB4DC \uC911 ${Math.round(progress * 100)}%`
                : isEasRequired
                  ? "\uC5C5\uB370\uC774\uD2B8\uB97C \uC644\uB8CC\uD574\uC57C \uC571\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694."
                  : "\uC9C0\uAE08 \uBC18\uC601\uD558\uAC70\uB098 \uB098\uC911\uC5D0 \uC5C5\uB370\uC774\uD2B8\uD560 \uC218 \uC788\uC5B4\uC694.";
    const updateMessage = isStoreRequired ? storePolicy?.forceUpdateMessage ?? DEFAULT_UPDATE_MESSAGE : easUpdateMessage;

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === "web" || __DEV__) {
            return;
        }

        let subscription: { remove: () => void } | undefined;

        const checkForUpdate = async () => {
            const Updates = updatesRef.current;
            if (!Updates) {
                return;
            }

            try {
                const result = await Updates.checkForUpdateAsync();
                if (
                    result.isAvailable &&
                    result.manifest &&
                    readUpdatePolicy(result.manifest) === "required" &&
                    isMountedRef.current
                ) {
                    setAvailableManifest(result.manifest);
                    setStep("available");
                }
            } catch {
                // Update checks can be rate-limited or offline; keep the app usable.
            }
        };

        const loadUpdates = async () => {
            try {
                const Updates = (await import("expo-updates")) as UpdatesModule;
                if (!isMountedRef.current || !Updates.isEnabled) {
                    return;
                }

                updatesRef.current = Updates;
                setIsModuleReady(true);

                subscription = Updates.addUpdatesStateChangeListener?.(event => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    const context = event.context;
                    const nativeProgress = typeof context?.downloadProgress === "number" ? context.downloadProgress : undefined;
                    const nativeDownloadedManifest = context?.downloadedManifest;
                    const nativeLatestManifest = context?.latestManifest;

                    if (nativeProgress !== undefined) {
                        setDownloadProgress(nativeProgress);
                    }

                    if (nativeDownloadedManifest && readUpdatePolicy(nativeDownloadedManifest) === "required") {
                        setAvailableManifest(nativeDownloadedManifest);
                        setStep("ready");
                        return;
                    }

                    if (nativeLatestManifest && readUpdatePolicy(nativeLatestManifest) === "required") {
                        setAvailableManifest(nativeLatestManifest);
                    }
                });

                await checkForUpdate();
            } catch {
                // Updating is a convenience layer. If the native module is unavailable,
                // never block app launch.
                updatesRef.current = null;
                if (isMountedRef.current) {
                    setIsModuleReady(false);
                }
            }
        };

        void loadUpdates();

        const appStateSubscription = AppState.addEventListener("change", nextState => {
            if (nextState === "active") {
                void checkForUpdate();
            }
        });

        return () => {
            subscription?.remove();
            appStateSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === "web") {
            return;
        }

        let isMounted = true;

        const loadStorePolicy = async () => {
            try {
                const Application = (await import("expo-application")) as ApplicationModule;
                const buildVersion = Application.nativeBuildVersion ?? getConfigBuildVersion();
                const policy = await getAppVersionPolicy();

                if (isMounted) {
                    setCurrentBuildVersion(toBuildNumber(buildVersion));
                    setStorePolicy(policy);
                }
            } catch {
                // Store update checks should never prevent app launch.
            }
        };

        void loadStorePolicy();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (step !== "downloading") {
            return;
        }

        const interval = setInterval(() => {
            setDownloadProgress(current => Math.min(0.92, current + 0.04));
        }, 450);

        return () => clearInterval(interval);
    }, [step]);

    const handleUpdate = async () => {
        if (isStoreRequired && storePolicy) {
            setActionError(null);
            setIsOpeningStore(true);

            try {
                await Linking.openURL(storePolicy.storeUrl);
            } catch {
                setActionError(DEFAULT_STORE_ERROR_MESSAGE);
            } finally {
                setIsOpeningStore(false);
            }

            return;
        }

        const Updates = updatesRef.current;
        if (!Updates || isBusy) {
            return;
        }

        setActionError(null);
        setStep("downloading");
        setDownloadProgress(current => Math.max(current, 0.08));

        try {
            const result = await Updates.fetchUpdateAsync();
            if (!result.isNew && !result.isRollBackToEmbedded) {
                throw new Error(
                    "\uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uB294 \uC5C5\uB370\uC774\uD2B8\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
                );
            }

            if (result.manifest) {
                setAvailableManifest(result.manifest);
            }

            setDownloadProgress(1);
            setStep("restarting");
            await Updates.reloadAsync();
        } catch (error) {
            setActionError(toErrorMessage(error));
            setStep("available");
            setDownloadProgress(0);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            animationType="fade"
            onRequestClose={() => undefined}
            statusBarTranslucent
            transparent
            visible={visible}
        >
            <View style={styles.backdrop}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={[styles.card, { backgroundColor: theme.white }]}>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: isStoreRequired || isEasRequired ? theme.red : theme.primaryLight }
                            ]}
                        >
                            <DefaultText
                                Button3
                                weight="800"
                                color={isStoreRequired || isEasRequired ? theme.white : theme.primary}
                            >
                                {isStoreRequired || isEasRequired
                                    ? "\uD544\uC218 \uC5C5\uB370\uC774\uD2B8"
                                    : "\uC120\uD0DD \uC5C5\uB370\uC774\uD2B8"}
                            </DefaultText>
                        </View>

                        <DefaultText Title3 weight="800" color={theme.gray1} style={styles.title}>
                            {isStoreRequired
                                ? "\uC571 \uC5C5\uB370\uC774\uD2B8\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4"
                                : isEasRequired
                                ? "\uC5C5\uB370\uC774\uD2B8\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4"
                                : "\uC0C8 \uC5C5\uB370\uC774\uD2B8\uAC00 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4"}
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray3} style={styles.description}>
                            {updateMessage}
                        </DefaultText>
                        <DefaultText Button3 color={theme.gray4} style={styles.statusText}>
                            {statusLabel}
                        </DefaultText>

                        {!isStoreRequired && (progress > 0 || isBusy) && (
                            <View style={[styles.progressTrack, { backgroundColor: theme.gray8 }]}>
                                <View
                                    style={[
                                        styles.progressValue,
                                        {
                                            width: `${Math.max(4, Math.round(progress * 100))}%`,
                                            backgroundColor: theme.primary
                                        }
                                    ]}
                                />
                            </View>
                        )}

                        {actionError && (
                            <View style={styles.errorBox}>
                                <DefaultText Button3 color={theme.red}>
                                    {actionError}
                                </DefaultText>
                            </View>
                        )}

                        <Pressable
                            disabled={isBusy}
                            onPress={() => void handleUpdate()}
                            style={[
                                styles.primaryButton,
                                {
                                    backgroundColor: isBusy ? theme.gray6 : theme.primary
                                }
                            ]}
                        >
                            <DefaultText Button1 weight="800" color={theme.white}>
                                {buttonLabel}
                            </DefaultText>
                        </Pressable>

                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(17, 24, 39, 0.48)",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(20)
    },
    safeArea: {
        flex: 1,
        justifyContent: "center"
    },
    card: {
        borderRadius: FlipStyles.adjustScale(28),
        padding: FlipStyles.adjustScale(24),
        ...FlipStyles.baseBoxShadow
    },
    badge: {
        alignSelf: "flex-start",
        borderRadius: FlipStyles.adjustScale(999),
        marginBottom: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(7)
    },
    title: {
        marginBottom: FlipStyles.adjustScale(10)
    },
    description: {
        marginBottom: FlipStyles.adjustScale(10)
    },
    statusText: {
        marginBottom: FlipStyles.adjustScale(16)
    },
    progressTrack: {
        borderRadius: FlipStyles.adjustScale(999),
        height: FlipStyles.adjustScale(8),
        marginBottom: FlipStyles.adjustScale(16),
        overflow: "hidden"
    },
    progressValue: {
        borderRadius: FlipStyles.adjustScale(999),
        height: "100%"
    },
    errorBox: {
        backgroundColor: "#FFF3F1",
        borderRadius: FlipStyles.adjustScale(12),
        marginBottom: FlipStyles.adjustScale(14),
        padding: FlipStyles.adjustScale(12)
    },
    primaryButton: {
        alignItems: "center",
        borderRadius: FlipStyles.adjustScale(14),
        justifyContent: "center",
        paddingVertical: FlipStyles.adjustScale(14)
    },
});
