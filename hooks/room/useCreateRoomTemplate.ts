import { useActiveOrganizationSession } from "@/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type tCreateRoomTemplate = {
    roomName: string;
    maxMemberCount: number;
    isPrivateRoom: boolean;
    savedAt: number;
};

const getStorageKey = (organizationId: number) => `flipsync:create-room-template:${organizationId}`;

const isValidTemplate = (value: Partial<tCreateRoomTemplate>): value is tCreateRoomTemplate =>
    typeof value.roomName === "string" &&
    typeof value.maxMemberCount === "number" &&
    value.maxMemberCount >= 1 &&
    value.maxMemberCount <= 10 &&
    typeof value.isPrivateRoom === "boolean" &&
    typeof value.savedAt === "number";

export const useCreateRoomTemplate = () => {
    const activeOrganization = useActiveOrganizationSession();
    const organizationId = activeOrganization?.id;
    const storageKey = organizationId ? getStorageKey(organizationId) : null;
    const [recentRoomTemplate, setRecentRoomTemplate] = useState<tCreateRoomTemplate | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadTemplate = async () => {
            if (!storageKey) {
                setRecentRoomTemplate(null);
                return;
            }

            try {
                const savedValue = await AsyncStorage.getItem(storageKey);
                const parsedValue = savedValue ? (JSON.parse(savedValue) as Partial<tCreateRoomTemplate>) : null;

                if (mounted) {
                    setRecentRoomTemplate(parsedValue && isValidTemplate(parsedValue) ? parsedValue : null);
                }
            } catch {
                if (mounted) {
                    setRecentRoomTemplate(null);
                }
            }
        };

        void loadTemplate();

        return () => {
            mounted = false;
        };
    }, [storageKey]);

    const saveRoomTemplate = useCallback(
        async (template: Omit<tCreateRoomTemplate, "savedAt">) => {
            if (!storageKey) {
                return;
            }

            const nextTemplate: tCreateRoomTemplate = {
                ...template,
                savedAt: Date.now()
            };

            setRecentRoomTemplate(nextTemplate);
            await AsyncStorage.setItem(storageKey, JSON.stringify(nextTemplate));
        },
        [storageKey]
    );

    return {
        recentRoomTemplate,
        saveRoomTemplate
    };
};
