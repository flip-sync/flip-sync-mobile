import { Linking } from "react-native";

export const FLIPSYNC_SUPPORT_EMAIL = "flipsync.score@gmail.com";
export const FLIPSYNC_PRIVACY_POLICY_EFFECTIVE_DATE = "2026-05-04";

const createMailtoUrl = (subject: string, body?: string) => {
    const query = [`subject=${encodeURIComponent(subject)}`];

    if (body) {
        query.push(`body=${encodeURIComponent(body)}`);
    }

    return `mailto:${FLIPSYNC_SUPPORT_EMAIL}?${query.join("&")}`;
};

export const openSupportMail = async (subject: string, body?: string) => {
    await Linking.openURL(createMailtoUrl(subject, body));
};
