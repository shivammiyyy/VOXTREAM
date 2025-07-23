const IntroBanner = () => {
  return (
    <div className="text-center max-w-md">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">
        Connect. Chat. Call.
      </h1>
      <p className="text-gray-700 mb-4">
        A real-time communication app to connect with friends through video,
        voice, and text chat — securely and privately.
      </p>
      <img
        src="/banner-illustration.svg"
        alt="App preview"
        className="w-full h-auto rounded"
      />
    </div>
  );
};

export default IntroBanner;
