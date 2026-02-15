'use client';

import { formatDate } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <p className="text-white/70 text-center py-8">No recent activity yet. Start uploading artwork!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-white/10 last:border-0 last:pb-0">
            {activity.user?.avatar && (
              <img
                src={activity.user.avatar}
                alt={activity.user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-white/50 mt-1">{formatDate(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
