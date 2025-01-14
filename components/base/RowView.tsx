import React from "react";

import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

type RowViewProps = {
    justifyContent?: ViewStyle["justifyContent"];
    alignItems?: ViewStyle["alignItems"];
    style?: StyleProp<ViewStyle>;
} & ViewProps;

const RowView: React.FC<RowViewProps> = ({ justifyContent, alignItems, style, children, ...props }) => {
    return (
        <View
            style={[styles.container, justifyContent && { justifyContent }, alignItems && { alignItems }, style]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
});

export default RowView;
