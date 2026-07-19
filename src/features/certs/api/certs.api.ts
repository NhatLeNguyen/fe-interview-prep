import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { CertTrackDetail, CertTrackSummary, StudyItem, TopicStudy } from "../types";

type Client = SupabaseClient<Database>;

export const certsApi = {
  /** Danh sách track chứng chỉ (kind='certification', đã publish). */
  async listTracks(client: Client): Promise<CertTrackSummary[]> {
    const { data, error } = await client
      .from("tracks")
      .select("slug, name, description, categories(id, topics(id))")
      .eq("kind", "certification")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .returns<
        {
          slug: string;
          name: string;
          description: string | null;
          categories: { id: string; topics: { id: string }[] }[];
        }[]
      >();
    if (error) throw new Error(error.message);

    return (data ?? []).map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      domainCount: t.categories.length,
      topicCount: t.categories.reduce((n, c) => n + c.topics.length, 0),
    }));
  },

  /** Chi tiết 1 track: domain (category) -> topic + số câu học/quiz. */
  async getTrack(client: Client, trackSlug: string): Promise<CertTrackDetail | null> {
    const { data } = await client
      .from("tracks")
      .select(
        "slug, name, description, categories(slug, name, sort_order, topics(slug, name, sort_order, questions(type, is_published, deleted_at)))",
      )
      .eq("slug", trackSlug)
      .eq("kind", "certification")
      .eq("is_published", true)
      .maybeSingle<{
        slug: string;
        name: string;
        description: string | null;
        categories: {
          slug: string;
          name: string;
          sort_order: number;
          topics: {
            slug: string;
            name: string;
            sort_order: number;
            questions: { type: string; is_published: boolean; deleted_at: string | null }[];
          }[];
        }[];
      }>();
    if (!data) return null;

    const domains = (data.categories ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        topics: (c.topics ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((tp) => {
            const pub = (tp.questions ?? []).filter((q) => q.is_published && !q.deleted_at);
            return {
              slug: tp.slug,
              name: tp.name,
              studyCount: pub.filter((q) => q.type === "theory").length,
              quizCount: pub.filter((q) => q.type === "quiz").length,
            };
          }),
      }));

    return { slug: data.slug, name: data.name, description: data.description, domains };
  },

  /** Nội dung học (câu theory) của 1 topic — xác thực topic thuộc đúng track. */
  async getTopicStudy(
    client: Client,
    trackSlug: string,
    topicSlug: string,
  ): Promise<TopicStudy | null> {
    const { data: topic } = await client
      .from("topics")
      .select("id, name, categories!inner(tracks!inner(slug, name, kind))")
      .eq("slug", topicSlug)
      .maybeSingle<{
        id: string;
        name: string;
        categories: { tracks: { slug: string; name: string; kind: string } };
      }>();
    if (!topic) return null;

    // Chỉ chấp nhận topic thuộc đúng track VÀ track đó là chứng chỉ (không lọt nội dung FE).
    const track = topic.categories?.tracks;
    if (!track || track.slug !== trackSlug || track.kind !== "certification") return null;

    const { data: qs } = await client
      .from("questions")
      .select("id, slug, prompt_md, answer_md, difficulty")
      .eq("topic_id", topic.id)
      .eq("type", "theory")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("difficulty", { ascending: true });

    const items: StudyItem[] = (qs ?? []).map((q) => ({
      id: q.id,
      slug: q.slug,
      promptMd: q.prompt_md,
      answerMd: q.answer_md,
      difficulty: q.difficulty,
    }));

    return { trackName: track.name, topicName: topic.name, items };
  },
};
