# Phase 2 SafeArea And Keyboard Checklist

## Current Layout Rule

- App root owns the top safe area through `app/_layout.tsx`.
- Screen-level `SafeAreaView` should include bottom safe area when the screen has fixed bottom actions or input flows.
- Input-heavy screens should wrap scrollable content with `KeyboardAvoidingView`.
- iOS should use `behavior="padding"`.
- Android should use `behavior="height"`.

## Screens Checked

- `app/(auth)/index.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/reset-password.tsx`
- `app/(auth)/organization-select.tsx`
- `app/(score)/createRoomModal.tsx`
- `app/(score)/createScoreModal.tsx`
- `app/(score)/modal.tsx`
- `app/(score)/email-change.tsx`
- `app/(score)/profile-edit.tsx`
- `app/legal/account-deletion.tsx`
- `components/ScoreRoom/OrganizationScoreSendModal.tsx`

## Input Component Rule

`components/base/TextInput/FormTextInput.tsx` currently keeps single-line inputs vertically centered through:

- `height`
- `lineHeight`
- `paddingVertical: 0`
- `textAlignVertical: "center"`
- `includeFontPadding: false`
- `numberOfLines={1}` for non-multiline inputs

This is the preferred input component for forms.

## Device QA Cases

- Android gesture navigation: bottom CTA must not overlap the gesture/nav area.
- Android 3-button navigation: bottom CTA must stay above the nav bar.
- iOS small screen: password confirmation field must scroll above keyboard on signup.
- iOS/Android room creation: member count/password inputs must remain visible while focused.
- Modal forms: the card should remain visually centered when keyboard is closed and scrollable when keyboard opens.

## Follow-up

If a new form screen is added, prefer this structure:

```tsx
<SafeAreaView style={styles.safeArea}>
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
    <ScrollView keyboardShouldPersistTaps="handled">
      {/* form */}
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

