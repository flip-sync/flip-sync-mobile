import { useFlipTheme } from "@/common";
import type { ScoreCodeOption } from "@/common/scoreCodes";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    TextInput,
    View,
    ViewStyle
} from "react-native";

type ScoreCodeDropdownProps = {
    value: string;
    onChange: (value: string) => void;
    options: ScoreCodeOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    noResultsText?: string;
    allowReset?: boolean;
    triggerStyle?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    dropdownWidth?: number;
};

export const ScoreCodeDropdown = ({
    value,
    onChange,
    options,
    placeholder = "코드",
    searchPlaceholder = "검색하기",
    emptyLabel = "전체",
    noResultsText = "검색 결과가 없습니다.",
    allowReset = false,
    triggerStyle,
    containerStyle,
    dropdownWidth
}: ScoreCodeDropdownProps) => {
    const theme = useFlipTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return options;
        }

        return options.filter(option => {
            const label = option.label.toLowerCase();
            const optionValue = option.value.toLowerCase();
            return label.includes(normalizedQuery) || optionValue.includes(normalizedQuery);
        });
    }, [options, query]);

    const selectedLabel = useMemo(
        () => options.find(option => option.value === value)?.label ?? "",
        [options, value]
    );

    const handleSelect = (nextValue: string) => {
        onChange(nextValue);
        setQuery("");
        setIsOpen(false);
    };

    return (
        <View style={[styles.container, isOpen && styles.containerOpen, containerStyle]}>
            <Pressable
                onPress={() => setIsOpen(current => !current)}
                style={[
                    styles.trigger,
                    {
                        borderColor: isOpen ? theme.primary : theme.gray7,
                        backgroundColor: theme.white
                    },
                    triggerStyle
                ]}
            >
                <DefaultText Button2 color={selectedLabel ? theme.gray2 : theme.gray5}>
                    {selectedLabel || placeholder}
                </DefaultText>
                <DefaultText
                    Button3
                    color={isOpen ? theme.primary : theme.gray5}
                    style={isOpen ? styles.chevronOpen : undefined}
                >
                    ⌄
                </DefaultText>
            </Pressable>

            {isOpen && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: theme.white,
                            borderColor: theme.gray7,
                            width: dropdownWidth ?? undefined
                        }
                    ]}
                >
                    <View style={[styles.searchBox, { borderColor: theme.gray7, backgroundColor: theme.gray8 }]}>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={theme.gray5}
                            style={[styles.searchInput, { color: theme.gray2 }]}
                        />
                        <DefaultText Button3 color={theme.gray5}>
                            ⌕
                        </DefaultText>
                    </View>

                    <ScrollView
                        nestedScrollEnabled
                        style={styles.optionScroll}
                        contentContainerStyle={styles.optionScrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {allowReset && (
                            <Pressable style={styles.optionItem} onPress={() => handleSelect("")}>
                                <DefaultText Body2 color={!value ? theme.primary : theme.gray2}>
                                    {emptyLabel}
                                </DefaultText>
                            </Pressable>
                        )}

                        {filteredOptions.map(option => (
                            <Pressable
                                key={option.value}
                                style={styles.optionItem}
                                onPress={() => handleSelect(option.value)}
                            >
                                <DefaultText Body2 color={value === option.value ? theme.primary : theme.gray2}>
                                    {option.label}
                                </DefaultText>
                            </Pressable>
                        ))}

                        {filteredOptions.length === 0 && (
                            <View style={styles.emptyState}>
                                <DefaultText Body2 color={theme.gray5}>
                                    {noResultsText}
                                </DefaultText>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        zIndex: 1
    },
    containerOpen: {
        zIndex: 120,
        elevation: 120
    },
    trigger: {
        minHeight: FlipStyles.adjustScale(42),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(8),
        paddingHorizontal: FlipStyles.adjustScale(14),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(10)
    },
    chevronOpen: {
        transform: [{ rotate: "180deg" }]
    },
    dropdown: {
        position: "absolute",
        top: FlipStyles.adjustScale(48),
        left: 0,
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(12),
        padding: FlipStyles.adjustScale(12),
        zIndex: 140,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 24
    },
    searchBox: {
        minHeight: FlipStyles.adjustScale(38),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(8),
        paddingHorizontal: FlipStyles.adjustScale(12),
        marginBottom: FlipStyles.adjustScale(10),
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(8)
    },
    searchInput: {
        flex: 1,
        fontSize: FlipStyles.adjustScale(14),
        fontFamily: "Pretendard-Regular",
        paddingVertical: 0
    },
    optionScroll: {
        maxHeight: FlipStyles.adjustScale(220)
    },
    optionScrollContent: {
        paddingBottom: FlipStyles.adjustScale(4)
    },
    optionItem: {
        minHeight: FlipStyles.adjustScale(38),
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(4)
    },
    emptyState: {
        minHeight: FlipStyles.adjustScale(92),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(8)
    }
});
