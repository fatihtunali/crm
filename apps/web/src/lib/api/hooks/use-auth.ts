import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../endpoints/auth';
import { LoginRequest } from '../types';
import { useAuth } from '@/lib/auth/auth-context';

export function useLogin(locale: string) {
  const router = useRouter();
  const { login: setAuth } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      // Set authentication state
      await setAuth(response.accessToken, response.refreshToken);

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
}
