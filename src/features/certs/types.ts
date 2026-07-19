/** 1 track chứng chỉ trong danh sách. */
export interface CertTrackSummary {
  slug: string;
  name: string;
  description: string | null;
  domainCount: number;
  topicCount: number;
}

/** 1 chủ đề (phần) trong domain. */
export interface CertTopic {
  slug: string;
  name: string;
  studyCount: number;
  quizCount: number;
}

/** 1 domain (lĩnh vực thi) = 1 category. */
export interface CertDomain {
  slug: string;
  name: string;
  topics: CertTopic[];
}

/** Chi tiết 1 track cert. */
export interface CertTrackDetail {
  slug: string;
  name: string;
  description: string | null;
  domains: CertDomain[];
}

/** 1 mục nội dung học (câu theory). */
export interface StudyItem {
  id: string;
  slug: string;
  promptMd: string;
  answerMd: string | null;
  difficulty: number;
}

/** Nội dung học của 1 topic. */
export interface TopicStudy {
  trackName: string;
  topicName: string;
  items: StudyItem[];
}
