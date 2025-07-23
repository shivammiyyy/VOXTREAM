const UserCard = ({
  user,
  onClick,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div
      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {actionLabel && (
          <button
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && (
          <button
            className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryAction?.();
            }}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
