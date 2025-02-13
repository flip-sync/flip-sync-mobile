import { authApi } from "@/api/auth";
import { tSignIn, tSignUp, tVerifyEmail } from "@/api/auth/types";
import { useMutation } from "@tanstack/react-query";

export const useAuth = () => {
    const { mutateAsync: checkVerifyEmail } = useMutation({
        mutationFn: async (props: tVerifyEmail) => await authApi.checkVerifyEmail(props)
    });
    const { mutateAsync: signUp } = useMutation({
        mutationFn: async (props: tSignUp) => await authApi.signUp(props)
    });
    const { mutateAsync: signIn } = useMutation({
        mutationFn: async (props: tSignIn) => await authApi.signIn(props)
    });
    return {
        checkVerifyEmail,
        signUp,
        signIn
    };
};
