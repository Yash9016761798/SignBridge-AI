import AuthLayout from '@/components/auth/AuthLayout';

export default function AuthPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout
      title="Welcome to SignBridge AI"
      subtitle="Sign in to continue your learning journey"
    >
      {children}
    </AuthLayout>
  );
}
