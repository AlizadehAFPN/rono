// Analytics & reporting dashboard.

const en = {
  pageTitle: "Analytics",
  overview: {
    items: "Questions",
    activeItems: "Active",
    responses: "Responses",
    accuracy: "Avg accuracy",
    users: "Members",
    sessions: "Sessions",
  },
  items: {
    title: "Question performance",
    subtitle: "Most-answered questions with accuracy and difficulty.",
    preview: "Question",
    exam: "Exam",
    responses: "Resp.",
    accuracy: "Accuracy",
    difficulty: "Diff (b)",
    calibration: "Calibration",
    empty: "No response data yet.",
  },
  calibration: {
    uncalibrated: "Uncalibrated",
    pre_set: "Expert",
    calibrating: "Calibrating",
    calibrated: "Calibrated",
  },
  loading: "Loading…",
};

export type DashAnalyticsDict = typeof en;

const tr: DashAnalyticsDict = {
  pageTitle: "Analitik",
  overview: {
    items: "Sorular",
    activeItems: "Aktif",
    responses: "Yanıtlar",
    accuracy: "Ort. doğruluk",
    users: "Üyeler",
    sessions: "Oturumlar",
  },
  items: {
    title: "Soru performansı",
    subtitle: "En çok yanıtlanan sorular, doğruluk ve zorlukla birlikte.",
    preview: "Soru",
    exam: "Sınav",
    responses: "Yanıt",
    accuracy: "Doğruluk",
    difficulty: "Zorluk (b)",
    calibration: "Kalibrasyon",
    empty: "Henüz yanıt verisi yok.",
  },
  calibration: {
    uncalibrated: "Kalibre edilmemiş",
    pre_set: "Uzman",
    calibrating: "Kalibre ediliyor",
    calibrated: "Kalibre edildi",
  },
  loading: "Yükleniyor…",
};

export const dashAnalytics = { en, tr };
