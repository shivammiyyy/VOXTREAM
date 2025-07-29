import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/Auth/LoginForm.jsx";
import SignupForm from "../components/Auth/SignupForm.jsx";
import Logo from "../assets/logo.png"; // optional logo import

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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-gray-800">
      {/* Left: Intro / Hero */}
      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-10 py-16">
        <h1 className="text-4xl font-bold leading-tight mb-4">
          VOXTREAM: Real-Time Conversations, Redefined
        </h1>
        <p className="text-lg mb-6">
          High-quality video, audio, and messaging between friends — powered by
          WebRTC and Socket.IO.
        </p>
        <ul className="mb-6 space-y-2 text-sm text-white/90">
          <li>✔ Lightning-fast real-time connections</li>
          <li>✔ Private 1:1 messaging and calling</li>
          <li>✔ Built with cutting-edge technology</li>
        </ul>
        <p className="text-sm text-white/70 mt-auto">
          No installs. No setup. Just connect.
        </p>
      </div>

      {/* Right: Auth Forms */}
      <div className="flex flex-col justify-center p-8 sm:px-12">
        <div className="mb-6 text-center">
          <img src={Logo} alt="VOXTREAM" className="w-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">
            {isSignup ? "Create Your VOXTREAM Account" : "Welcome Back to VOXTREAM"}
          </h2>
        </div>

        {isSignup ? (
          <SignupForm switchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm switchToSignup={() => setIsSignup(true)} />
        )}

        
      </div>
    </div>
  );
};

export default LandingPage;
