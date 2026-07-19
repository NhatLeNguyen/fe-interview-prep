import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { CertTrackSummary } from "../types";

export function TrackCard({ track }: { track: CertTrackSummary }) {
  return (
    <Link href={ROUTES.CERT_TRACK(track.slug)} className="group block">
      <Card className="hover:border-primary/40 h-full transition-colors">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <GraduationCap className="size-5" />
            </div>
            <CardTitle className="group-hover:text-primary text-base">{track.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {track.description ? (
            <p className="text-muted-foreground line-clamp-2 text-sm">{track.description}</p>
          ) : null}
          <p className="text-muted-foreground text-xs tabular-nums">
            {track.domainCount} lĩnh vực · {track.topicCount} chủ đề
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
