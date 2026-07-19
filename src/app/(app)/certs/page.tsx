import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/common/empty-state";
import { certsApi, TrackCard } from "@/features/certs";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ôn thi chứng chỉ" };

export default async function CertsPage() {
  const supabase = await createClient();
  const tracks = await certsApi.listTracks(supabase);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Ôn thi chứng chỉ</h1>
        <p className="text-muted-foreground mt-1">
          Nội dung tự học và câu ôn tập cho các chứng chỉ (AWS, PMP…). Có thể quiz và thêm vào
          flashcard như phần phỏng vấn.
        </p>
      </header>

      {tracks.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Chưa có chứng chỉ nào"
          description="Chạy supabase/seeds/06_cert_content.sql để thêm nội dung."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <TrackCard key={t.slug} track={t} />
          ))}
        </div>
      )}
    </div>
  );
}
