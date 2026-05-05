import { userApi } from "@/api/user";
import { tDeleteMyAccount, tUpdateUserEmail, tUpdateUserProfile } from "@/api/user/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUserProfile = () => {
    const queryClient = useQueryClient();

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ["me"],
        queryFn: () => userApi.getMyProfile()
    });

    const invalidateProfileRelatedQueries = async () => {
        await queryClient.invalidateQueries({ queryKey: ["me"] });
        await queryClient.invalidateQueries({ queryKey: ["score"] });
        await queryClient.invalidateQueries({ queryKey: ["room-summary"] });
        await queryClient.invalidateQueries({ queryKey: ["room"] });
        await queryClient.invalidateQueries({ queryKey: ["my-rooms"] });
    };

    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: (payload: tUpdateUserProfile) => userApi.updateMyProfile(payload),
        onSuccess: async response => {
            queryClient.setQueryData(["me"], response);
            await invalidateProfileRelatedQueries();
        }
    });

    const { mutateAsync: updateProfileImage, isPending: isUpdatingProfileImage } = useMutation({
        mutationFn: (formData: FormData) => userApi.updateMyProfileImage(formData),
        onSuccess: async response => {
            queryClient.setQueryData(["me"], response);
            await invalidateProfileRelatedQueries();
        }
    });

    const { mutateAsync: updateEmail, isPending: isUpdatingEmail } = useMutation({
        mutationFn: (payload: tUpdateUserEmail) => userApi.updateMyEmail(payload)
    });

    const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useMutation({
        mutationFn: (payload: tDeleteMyAccount) => userApi.deleteMyAccount(payload)
    });

    return {
        profile,
        isLoadingProfile,
        updateProfile,
        isUpdatingProfile,
        updateProfileImage,
        isUpdatingProfileImage,
        updateEmail,
        isUpdatingEmail,
        deleteAccount,
        isDeletingAccount
    };
};
