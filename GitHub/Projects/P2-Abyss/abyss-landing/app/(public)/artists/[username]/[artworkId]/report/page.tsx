import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { getArtworkById } from '@/lib/api/artworks';
import ViolationReportForm from '@/components/violation/ViolationReportForm';

export default async function ReportViolationPage({
  params,
}: {
  params: Promise<{ username: string; artworkId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { artworkId } = await params;
  const result = await getArtworkById(artworkId);

  if (!result || !result.artwork) {
    notFound();
  }

  const { artwork, user } = result;

  // Only artwork owner can report violations
  if (artwork.userId !== userId) {
    redirect(`/artists/${params.username}/${artworkId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Report Violation</h1>
              <p className="text-white/70 mt-1">
                Report unauthorized use of your artwork
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
          <ViolationReportForm
            artworkId={artwork.id}
            artworkTitle={artwork.title}
            onSuccess={() => {
              window.location.href = '/violations';
            }}
            onCancel={() => {
              window.history.back();
            }}
          />
        </div>
      </div>
    </div>
  );
}
