import ArtworkUploadForm from '@/components/artwork/ArtworkUploadForm';

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Artwork</h1>
        <p className="mt-2 text-white/70">
          Share your art with AI-proof protection
        </p>
      </div>

      <ArtworkUploadForm />
    </div>
  );
}
