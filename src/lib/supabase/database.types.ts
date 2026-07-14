/**
 * TypeScript types khớp schema Supabase (migrations 0000–0006).
 *
 * Viết tay khớp DDL trong docs/08 để có type-safety ngay. Khi cần đồng bộ tự động:
 *   npx supabase login
 *   npx supabase gen types typescript --project-id bdesgfvbqkgekxygofkz --schema public > src/lib/supabase/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          locale: string;
          theme: string;
          daily_new_cards: number;
          streak_goal: number | null;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          locale?: string;
          theme?: string;
          daily_new_cards?: number;
          streak_goal?: number | null;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          locale?: string;
          theme?: string;
          daily_new_cards?: number;
          streak_goal?: number | null;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          description: string | null;
          level: Database["public"]["Enums"]["level"];
          sort_order: number;
          is_published: boolean;
          deleted_at: string | null;
          search: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["level"];
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["level"];
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: { id: string; slug: string; name: string; created_at: string };
        Insert: { id?: string; slug: string; name: string; created_at?: string };
        Update: { id?: string; slug?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          slug: string;
          topic_id: string;
          subtopic: string | null;
          type: Database["public"]["Enums"]["question_type"];
          answer_format: Database["public"]["Enums"]["answer_format"] | null;
          level: Database["public"]["Enums"]["level"];
          difficulty: number;
          frequency: number;
          estimated_time_sec: number | null;
          prompt_md: string;
          answer_md: string | null;
          options: Json | null;
          correct_keys: string[] | null;
          code_snippet: string | null;
          code_language: string | null;
          reference_links: Json | null;
          companies: string[] | null;
          related_question_ids: string[] | null;
          is_deprecated: boolean;
          is_published: boolean;
          deleted_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          search: unknown | null;
        };
        Insert: {
          id?: string;
          slug: string;
          topic_id: string;
          subtopic?: string | null;
          type: Database["public"]["Enums"]["question_type"];
          answer_format?: Database["public"]["Enums"]["answer_format"] | null;
          level?: Database["public"]["Enums"]["level"];
          difficulty?: number;
          frequency?: number;
          estimated_time_sec?: number | null;
          prompt_md: string;
          answer_md?: string | null;
          options?: Json | null;
          correct_keys?: string[] | null;
          code_snippet?: string | null;
          code_language?: string | null;
          reference_links?: Json | null;
          companies?: string[] | null;
          related_question_ids?: string[] | null;
          is_deprecated?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          topic_id?: string;
          subtopic?: string | null;
          type?: Database["public"]["Enums"]["question_type"];
          answer_format?: Database["public"]["Enums"]["answer_format"] | null;
          level?: Database["public"]["Enums"]["level"];
          difficulty?: number;
          frequency?: number;
          estimated_time_sec?: number | null;
          prompt_md?: string;
          answer_md?: string | null;
          options?: Json | null;
          correct_keys?: string[] | null;
          code_snippet?: string | null;
          code_language?: string | null;
          reference_links?: Json | null;
          companies?: string[] | null;
          related_question_ids?: string[] | null;
          is_deprecated?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey";
            columns: ["topic_id"];
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questions_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      question_tags: {
        Row: { question_id: string; tag_id: string };
        Insert: { question_id: string; tag_id: string };
        Update: { question_id?: string; tag_id?: string };
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_sets: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          title: string;
          description: string | null;
          level: Database["public"]["Enums"]["level"];
          time_limit_sec: number | null;
          pass_score: number;
          is_published: boolean;
          deleted_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["level"];
          time_limit_sec?: number | null;
          pass_score?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["level"];
          time_limit_sec?: number | null;
          pass_score?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_sets_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_set_questions: {
        Row: {
          id: string;
          quiz_set_id: string;
          question_id: string;
          sort_order: number;
          points: number;
        };
        Insert: {
          id?: string;
          quiz_set_id: string;
          question_id: string;
          sort_order?: number;
          points?: number;
        };
        Update: {
          id?: string;
          quiz_set_id?: string;
          question_id?: string;
          sort_order?: number;
          points?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_set_questions_quiz_set_id_fkey";
            columns: ["quiz_set_id"];
            referencedRelation: "quiz_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_set_questions_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_source: Database["public"]["Enums"]["quiz_source"];
          quiz_set_id: string | null;
          config: Json | null;
          question_ids: string[];
          status: Database["public"]["Enums"]["attempt_status"];
          score: number | null;
          correct_count: number | null;
          total_questions: number | null;
          duration_sec: number | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_source: Database["public"]["Enums"]["quiz_source"];
          quiz_set_id?: string | null;
          config?: Json | null;
          question_ids?: string[];
          status?: Database["public"]["Enums"]["attempt_status"];
          score?: number | null;
          correct_count?: number | null;
          total_questions?: number | null;
          duration_sec?: number | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_source?: Database["public"]["Enums"]["quiz_source"];
          quiz_set_id?: string | null;
          config?: Json | null;
          question_ids?: string[];
          status?: Database["public"]["Enums"]["attempt_status"];
          score?: number | null;
          correct_count?: number | null;
          total_questions?: number | null;
          duration_sec?: number | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_quiz_set_id_fkey";
            columns: ["quiz_set_id"];
            referencedRelation: "quiz_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          user_id: string;
          question_id: string;
          selected_keys: string[];
          is_correct: boolean | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          user_id: string;
          question_id: string;
          selected_keys?: string[];
          is_correct?: boolean | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          user_id?: string;
          question_id?: string;
          selected_keys?: string[];
          is_correct?: boolean | null;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempt_answers_attempt_id_user_id_fkey";
            columns: ["attempt_id", "user_id"];
            referencedRelation: "quiz_attempts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcard_states: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          due_at: string;
          last_reviewed_at: string | null;
          last_grade: number | null;
          state: Database["public"]["Enums"]["flashcard_state"];
          lapses: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          due_at?: string;
          last_reviewed_at?: string | null;
          last_grade?: number | null;
          state?: Database["public"]["Enums"]["flashcard_state"];
          lapses?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          due_at?: string;
          last_reviewed_at?: string | null;
          last_grade?: number | null;
          state?: Database["public"]["Enums"]["flashcard_state"];
          lapses?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_states_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcard_states_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      review_logs: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          grade: number;
          prev_interval_days: number | null;
          new_interval_days: number | null;
          prev_ease: number | null;
          new_ease: number | null;
          prev_state: Database["public"]["Enums"]["flashcard_state"] | null;
          new_state: Database["public"]["Enums"]["flashcard_state"] | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          grade: number;
          prev_interval_days?: number | null;
          new_interval_days?: number | null;
          prev_ease?: number | null;
          new_ease?: number | null;
          prev_state?: Database["public"]["Enums"]["flashcard_state"] | null;
          new_state?: Database["public"]["Enums"]["flashcard_state"] | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          grade?: number;
          prev_interval_days?: number | null;
          new_interval_days?: number | null;
          prev_ease?: number | null;
          new_ease?: number | null;
          prev_state?: Database["public"]["Enums"]["flashcard_state"] | null;
          new_state?: Database["public"]["Enums"]["flashcard_state"] | null;
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_logs_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_paths: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          target_level: Database["public"]["Enums"]["level"];
          sort_order: number;
          is_published: boolean;
          deleted_at: string | null;
          search: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          target_level?: Database["public"]["Enums"]["level"];
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          target_level?: Database["public"]["Enums"]["level"];
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_path_items: {
        Row: {
          id: string;
          path_id: string;
          item_type: Database["public"]["Enums"]["path_item_type"];
          topic_id: string | null;
          quiz_set_id: string | null;
          question_id: string | null;
          module_title: string | null;
          step_key: string | null;
          title: string | null;
          sort_order: number;
          is_optional: boolean;
          pass_threshold: number;
        };
        Insert: {
          id?: string;
          path_id: string;
          item_type: Database["public"]["Enums"]["path_item_type"];
          topic_id?: string | null;
          quiz_set_id?: string | null;
          question_id?: string | null;
          module_title?: string | null;
          step_key?: string | null;
          title?: string | null;
          sort_order?: number;
          is_optional?: boolean;
          pass_threshold?: number;
        };
        Update: {
          id?: string;
          path_id?: string;
          item_type?: Database["public"]["Enums"]["path_item_type"];
          topic_id?: string | null;
          quiz_set_id?: string | null;
          question_id?: string | null;
          module_title?: string | null;
          step_key?: string | null;
          title?: string | null;
          sort_order?: number;
          is_optional?: boolean;
          pass_threshold?: number;
        };
        Relationships: [
          {
            foreignKeyName: "learning_path_items_path_id_fkey";
            columns: ["path_id"];
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_path_progress: {
        Row: {
          id: string;
          user_id: string;
          path_id: string;
          item_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_id: string;
          item_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_id?: string;
          item_id?: string;
          status?: Database["public"]["Enums"]["progress_status"];
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_path_progress_path_id_fkey";
            columns: ["path_id"];
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_path_progress_item_id_fkey";
            columns: ["item_id"];
            referencedRelation: "learning_path_items";
            referencedColumns: ["id"];
          },
        ];
      };
      user_topic_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          questions_total: number;
          questions_studied: number;
          mastery_percent: number;
          last_activity_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          questions_total?: number;
          questions_studied?: number;
          mastery_percent?: number;
          last_activity_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic_id?: string;
          status?: Database["public"]["Enums"]["progress_status"];
          questions_total?: number;
          questions_studied?: number;
          mastery_percent?: number;
          last_activity_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_topic_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_topic_progress_topic_id_fkey";
            columns: ["topic_id"];
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      user_question_progress: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          understood: boolean;
          correct_in_quiz: boolean;
          understood_at: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          understood?: boolean;
          correct_in_quiz?: boolean;
          understood_at?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          understood?: boolean;
          correct_in_quiz?: boolean;
          understood_at?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_question_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_question_progress_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type: Database["public"]["Enums"]["activity_type"];
          ref_id: string | null;
          meta: Json | null;
          activity_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: Database["public"]["Enums"]["activity_type"];
          ref_id?: string | null;
          meta?: Json | null;
          activity_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: Database["public"]["Enums"]["activity_type"];
          ref_id?: string | null;
          meta?: Json | null;
          activity_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coding_problems: {
        Row: {
          id: string;
          question_id: string;
          function_name: string;
          starter_code: string;
          language: string;
          time_limit_ms: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          function_name: string;
          starter_code?: string;
          language?: string;
          time_limit_ms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          function_name?: string;
          starter_code?: string;
          language?: string;
          time_limit_ms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coding_problems_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      coding_test_cases: {
        Row: {
          id: string;
          problem_id: string;
          args: Json;
          expected: Json | null;
          is_sample: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          problem_id: string;
          args: Json;
          expected?: Json | null;
          is_sample?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          problem_id?: string;
          args?: Json;
          expected?: Json | null;
          is_sample?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "coding_test_cases_problem_id_fkey";
            columns: ["problem_id"];
            referencedRelation: "coding_problems";
            referencedColumns: ["id"];
          },
        ];
      };
      coding_submissions: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          code: string;
          language: string;
          status: "passed" | "failed" | "error";
          passed_count: number;
          total_count: number;
          runtime_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          code: string;
          language?: string;
          status: "passed" | "failed" | "error";
          passed_count?: number;
          total_count?: number;
          runtime_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_id?: string;
          code?: string;
          language?: string;
          status?: "passed" | "failed" | "error";
          passed_count?: number;
          total_count?: number;
          runtime_ms?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coding_submissions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coding_submissions_problem_id_fkey";
            columns: ["problem_id"];
            referencedRelation: "coding_problems";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      build_question_search: {
        Args: { p_prompt: string; p_answer: string; p_question_id: string };
        Returns: unknown;
      };
    };
    Enums: {
      activity_type: "study" | "review" | "quiz" | "path";
      answer_format: "single_choice" | "multiple_choice" | "true_false";
      attempt_status: "in_progress" | "completed" | "abandoned";
      flashcard_state: "new" | "learning" | "review" | "relearning";
      level: "junior" | "mid" | "senior";
      path_item_type: "topic" | "quiz_set" | "question";
      progress_status: "not_started" | "in_progress" | "completed";
      question_type: "theory" | "coding" | "quiz" | "system-design" | "behavioral";
      quiz_source: "preset" | "custom";
      user_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
