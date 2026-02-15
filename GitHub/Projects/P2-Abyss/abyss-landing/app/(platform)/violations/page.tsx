import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { violationReports, artworks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getViolationReports(userId: string) {
  try {
    const reports = await db
      .select({
        report: violationReports,
        artwork: artworks,
      })
      .from(violationReports)
      .leftJoin(artworks, eq(violationReports.artworkId, artworks.id))
      .where(eq(violationReports.reportedBy, userId))
      .orderBy(desc(violationReports.createdAt));

    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'yellow',
    label: 'Pending Review',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-yellow-500/50',
    textClass: 'text-yellow-400',
  },
  investigating: {
    icon: AlertTriangle,
    color: 'blue',
    label: 'Investigating',
    bgClass: 'bg-blue-500/20',
    borderClass: 'border-blue-500/50',
    textClass: 'text-blue-400',
  },
  resolved: {
    icon: CheckCircle,
    color: 'green',
    label: 'Resolved',
    bgClass: 'bg-green-500/20',
    borderClass: 'border-green-500/50',
    textClass: 'text-green-400',
  },
  dismissed: {
    icon: XCircle,
    color: 'gray',
    label: 'Dismissed',
    bgClass: 'bg-gray-500/20',
    borderClass: 'border-gray-500/50',
    textClass: 'text-gray-400',
  },
};

const VIOLATION_LABELS: Record<string, string> = {
  unauthorized_use: 'Unauthorized Use',
  copyright_infringement: 'Copyright Infringement',
  ai_training: 'AI Training Dataset',
  trademark: 'Trademark Violation',
  impersonation: 'Impersonation',
  other: 'Other',
};

export default async function ViolationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const reports = await getViolationReports(userId);

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.report.status === 'pending').length,
    investigating: reports.filter((r) => r.report.status === 'investigating').length,
    resolved: reports.filter((r) => r.report.status === 'resolved').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Violation Reports</h1>
        <p className="mt-2 text-white/70">
          Track and manage reports of unauthorized use of your artwork
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-white/70">Total Reports</div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.pending}</div>
          <div className="text-sm text-yellow-200">Pending Review</div>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
          <div className="text-2xl font-bold text-blue-400 mb-1">{stats.investigating}</div>
          <div className="text-sm text-blue-200">Investigating</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
          <div className="text-2xl font-bold text-green-400 mb-1">{stats.resolved}</div>
          <div className="text-sm text-green-200">Resolved</div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Your Reports</h2>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No violation reports
            </h3>
            <p className="text-white/70 mb-6">
              You haven't reported any violations yet. If you find unauthorized use of your
              artwork, you can report it from the artwork page.
            </p>
            <Link
              href="/gallery"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              View Your Gallery
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((item) => {
              const status = STATUS_CONFIG[item.report.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = status.icon;

              return (
                <div
                  key={item.report.id}
                  className={`p-6 rounded-xl border-2 ${status.bgClass} ${status.borderClass}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {item.artwork && (
                        <img
                          src={item.artwork.thumbnailUrl}
                          alt={item.artwork.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {item.artwork?.title || 'Unknown Artwork'}
                        </h3>
                        <div className="text-sm text-white/70 mb-2">
                          {VIOLATION_LABELS[item.report.violationType] || item.report.violationType}
                        </div>
                        <p className="text-white/90 text-sm">
                          {item.report.description}
                        </p>
                        {item.report.violationUrl && (
                          <a
                            href={item.report.violationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block"
                          >
                            View violation URL →
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${status.bgClass}`}>
                      <StatusIcon className={`w-5 h-5 ${status.textClass}`} />
                      <span className={`font-semibold ${status.textClass}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-sm text-white/70">
                      Reported {formatDate(item.report.createdAt)}
                    </div>
                    {item.report.resolution && (
                      <div className="text-sm text-white/70">
                        Resolution: {item.report.resolution}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-3">Need Help?</h3>
        <p className="text-cyan-200 text-sm mb-4">
          If you believe someone is using your artwork without permission, report it from the
          artwork page. Our team will investigate and take appropriate action.
        </p>
        <div className="space-y-2 text-sm text-cyan-200">
          <div>• Gather evidence before reporting (screenshots, URLs, etc.)</div>
          <div>• Provide detailed information about the violation</div>
          <div>• Be patient - investigations can take 1-2 weeks</div>
          <div>• You'll receive updates via email</div>
        </div>
      </div>
    </div>
  );
}
