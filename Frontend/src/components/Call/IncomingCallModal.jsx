const IncomingCallModal = ({ callerId, callType, onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded shadow-lg text-center w-80">
        <h2 className="text-xl font-semibold mb-2">Incoming {callType} Call</h2>
        <p className="mb-4">User {callerId} is calling you...</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onAccept}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
