import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/Auth/LoginForm.jsx";
import SignupForm from "../components/Auth/SignupForm.jsx";
import IntroBanner from "../components/Shared/IntroBanner.jsx";

const LandingPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.isOnboarded ? "/home" : "/onboarding");
    }
  }, [user, loading, navigate]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Intro */}
      <div className="hidden md:flex bg-blue-50 items-center justify-center p-8">
        <IntroBanner />
      </div>

      {/* Right side: Auth Forms */}
      <div className="flex flex-col justify-center p-8 sm:px-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        {isSignup ? (
          <SignupForm switchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm switchToSignup={() => setIsSignup(true)} />
        )}

        <div className="mt-6 text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
