import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data', message = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-gray-800/50 mb-4">
        <Icon className="text-gray-500" size={32} />
      </div>
      <h3 className="text-lg font-medium text-gray-400">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
    </div>
  );
};

export default EmptyState;
