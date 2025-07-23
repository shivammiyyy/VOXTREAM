const MessageBubble = ({ msg, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`px-4 py-2 rounded max-w-xs ${
          isOwn ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
        }`}
      >
        {msg.content}
        <div className="text-xs text-right mt-1 opacity-70">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
