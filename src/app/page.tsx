// Use static rendering for the homepage
export const dynamic = 'force-static';

// Simple homepage that uses links instead of client-side redirects
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-pink-500 mb-4">VeeMatch</h1>
        <p className="text-gray-500 mb-8">Find your perfect match</p>
        
        <div className="flex flex-col space-y-3">
          <a href="/login" className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 inline-block">
            Sign In
          </a>
          <a href="/sign-up" className="bg-white border border-pink-500 text-pink-500 px-6 py-3 rounded-xl hover:bg-pink-50 inline-block">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
