import { getStoredAuthSession } from "@/common";
import { getApiBaseUrl, refreshAccessToken } from "@/common/api/client";
import { tConnectedRoomMember, tSharedScoreViewMessage } from "@/api/score/types";
import { useEffect, useMemo, useRef, useState } from "react";

const HEARTBEAT_INTERVAL_MS = 15000;
const HEARTBEAT_TIMEOUT_MS = 35000;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 8000;

const getRealtimeBaseUrl = () => getApiBaseUrl().replace(/^http/i, protocol => (protocol === "https" ? "wss" : "ws"));

const getStoredAccessToken = async () => {
    const session = await getStoredAuthSession();
    if (!session?.accessToken) {
        return null;
    }

    try {
        const refreshedSession = await refreshAccessToken();
        return refreshedSession.accessToken;
    } catch {
        const latestSession = await getStoredAuthSession();
        return latestSession?.accessToken ?? null;
    }
};

export const useSharedScoreSync = (props?: { groupId?: number; enabled?: boolean }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const lastServerActivityAtRef = useRef(0);
    const manualCloseRef = useRef(false);
    const cancelledRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<tSharedScoreViewMessage | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<tConnectedRoomMember[]>([]);

    const socketUrl = useMemo(() => {
        if (!props?.groupId || !props.enabled) {
            return null;
        }

        return `${getRealtimeBaseUrl()}/webchatws/group/${props.groupId}`;
    }, [props?.enabled, props?.groupId]);

    const clearHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    const clearReconnectTimer = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    };

    useEffect(() => {
        cancelledRef.current = false;
        manualCloseRef.current = false;

        const closeSocket = () => {
            clearHeartbeat();
            if (socketRef.current) {
                try {
                    socketRef.current.close();
                } catch {}
            }
            socketRef.current = null;
        };

        const scheduleReconnect = (connect: () => Promise<void>) => {
            if (cancelledRef.current || manualCloseRef.current || !socketUrl) {
                return;
            }

            clearReconnectTimer();
            const delay = Math.min(
                RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptRef.current),
                RECONNECT_MAX_DELAY_MS
            );
            reconnectAttemptRef.current += 1;

            reconnectTimerRef.current = setTimeout(() => {
                void connect();
            }, delay);
        };

        const startHeartbeat = () => {
            clearHeartbeat();
            heartbeatIntervalRef.current = setInterval(() => {
                const socket = socketRef.current;
                if (!socket || socket.readyState !== WebSocket.OPEN) {
                    return;
                }

                const now = Date.now();
                if (lastServerActivityAtRef.current && now - lastServerActivityAtRef.current > HEARTBEAT_TIMEOUT_MS) {
                    try {
                        socket.close();
                    } catch {}
                    return;
                }

                socket.send(JSON.stringify({
                    type: "CLIENT_PING",
                    clientTimestamp: now
                } satisfies tSharedScoreViewMessage));
            }, HEARTBEAT_INTERVAL_MS);
        };

        const connect = async () => {
            if (!socketUrl || cancelledRef.current) {
                return;
            }

            const accessToken = await getStoredAccessToken();
            if (!accessToken || cancelledRef.current) {
                return;
            }

            closeSocket();
            const websocket = new WebSocket(`${socketUrl}?token=${encodeURIComponent(accessToken)}`);
            socketRef.current = websocket;

            websocket.onopen = () => {
                if (cancelledRef.current) {
                    return;
                }

                reconnectAttemptRef.current = 0;
                lastServerActivityAtRef.current = Date.now();
                setIsConnected(true);
                startHeartbeat();
            };

            websocket.onclose = () => {
                if (cancelledRef.current) {
                    return;
                }

                setIsConnected(false);
                clearHeartbeat();
                scheduleReconnect(connect);
            };

            websocket.onerror = () => {
                if (cancelledRef.current) {
                    return;
                }

                setIsConnected(false);
            };

            websocket.onmessage = event => {
                if (cancelledRef.current) {
                    return;
                }

                lastServerActivityAtRef.current = Date.now();

                try {
                    const parsedMessage = JSON.parse(event.data) as tSharedScoreViewMessage;

                    if (parsedMessage.type === "SERVER_PONG") {
                        return;
                    }

                    if (parsedMessage.type === "PRESENCE_SYNC") {
                        setConnectedUsers(parsedMessage.connectedUsers ?? []);
                        return;
                    }

                    setLastMessage(parsedMessage);
                } catch (error) {
                    console.warn("Failed to parse shared score sync payload.", error);
                }
            };
        };

        if (socketUrl) {
            void connect();
        }

        return () => {
            cancelledRef.current = true;
            manualCloseRef.current = true;
            setIsConnected(false);
            setConnectedUsers([]);
            clearHeartbeat();
            clearReconnectTimer();
            closeSocket();
        };
    }, [socketUrl]);

    const sendSharedViewMessage = (message: tSharedScoreViewMessage) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            return false;
        }

        socketRef.current.send(JSON.stringify(message));
        return true;
    };

    return {
        isSharedScoreSocketConnected: isConnected,
        connectedUsers,
        lastSharedScoreMessage: lastMessage,
        sendSharedViewMessage
    };
};
