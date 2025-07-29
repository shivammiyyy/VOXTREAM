const UserCard = ({
  user,
  onClick,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer group">
      {/* Left: Profile Info */}
      <div
        className="flex items-center gap-4 flex-1"
        onClick={onClick}
      >
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover border border-gray-300"
        />
        <div>
          <p className="font-semibold text-gray-900 leading-tight">
            {user.fullName}
          </p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-4">
        {actionLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
            className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryAction?.();
            }}
            className="px-3 py-1 text-sm font-medium bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
