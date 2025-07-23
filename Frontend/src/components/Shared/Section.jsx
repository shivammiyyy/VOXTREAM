const Section = ({ title, children }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">{title}</h3>
      <div className="space-y-3">
        {children.length === 0 ? <p className="text-gray-500">No users found.</p> : children}
      </div>
    </div>
  );
};

export default Section;
