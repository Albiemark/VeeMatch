import { headers } from 'next/headers';
import LoginForm from '@/components/features/auth/LoginForm';

// Make the page a Server Component to properly handle headers
export default async function LoginPage() {
  // Properly await headers
  const headersList = await headers();
  
  return (
    <div className="bg-gradient-to-b from-pink-100 to-white font-sans flex flex-col items-center min-h-screen">
      <LoginForm />
    </div>
  );
}
