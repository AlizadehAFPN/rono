// Dashboard "Overview" page: header greeting, stat cards, charts, calibration
// legend, and the recently-added questions list.

const en = {
  greetings: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    fallbackName: "there",
  },
  // Relative time used in the recent questions list.
  relativeTime: {
    justNow: "just now",
    minutesShort: "m ago",
    hoursShort: "h ago",
    daysShort: "d ago",
  },
  header: {
    subtitle: "Question bank overview",
    newQuestion: "New question",
  },
  stats: {
    totalQuestions: "Total Questions",
    totalQuestionsSub: {
      activeSuffix: "active",
      draftSuffix: "draft",
    },
    activeQuestions: "Active Questions",
    activeQuestionsSubSuffix: "of total questions",
    draftQuestions: "Draft Questions",
    draftQuestionsSub: "Pending review & activation",
    topics: "Topics",
    topicsSub: {
      one: "topic in your bank",
      other: "topics in your bank",
    },
  },
  examBreakdown: {
    title: "Questions by Exam Type",
    viewAll: "View all",
    empty: "No questions yet.",
    unassigned: "Unassigned",
  },
  calibration: {
    title: "IRT Calibration",
    statuses: {
      calibrated: {
        label: "IRT Calibrated",
        desc: "Full psychometric data",
      },
      pre_set: {
        label: "Expert Preset",
        desc: "Difficulty set by authors",
      },
      calibrating: {
        label: "Calibrating",
        desc: "Collecting response data",
      },
      uncalibrated: {
        label: "Uncalibrated",
        desc: "Awaiting first responses",
      },
    },
  },
  recent: {
    title: "Recently Added",
    allQuestions: "All questions",
    emptyTitle: "No questions yet",
    emptyDescription: "Create your first question to get started.",
    newQuestion: "New question",
    noContent: "(no content)",
    noExamType: "No exam type",
  },
  // Localized question status labels (Draft/Active/Retired) shown in the list,
  // mirroring STATUS_LABELS from lib/types/items.ts.
  status: {
    draft: "Draft",
    active: "Active",
    retired: "Retired",
  },
};

export type DashOverviewDict = typeof en;

const tr: DashOverviewDict = {
  greetings: {
    morning: "Günaydın",
    afternoon: "İyi günler",
    evening: "İyi akşamlar",
    fallbackName: "merhaba",
  },
  relativeTime: {
    justNow: "az önce",
    minutesShort: " dk önce",
    hoursShort: " sa önce",
    daysShort: " g önce",
  },
  header: {
    subtitle: "Soru bankası genel bakışı",
    newQuestion: "Yeni soru",
  },
  stats: {
    totalQuestions: "Toplam Soru",
    totalQuestionsSub: {
      activeSuffix: "aktif",
      draftSuffix: "taslak",
    },
    activeQuestions: "Aktif Sorular",
    activeQuestionsSubSuffix: "toplam soruların",
    draftQuestions: "Taslak Sorular",
    draftQuestionsSub: "İnceleme ve etkinleştirme bekliyor",
    topics: "Konular",
    topicsSub: {
      one: "konu bankanızda",
      other: "konu bankanızda",
    },
  },
  examBreakdown: {
    title: "Sınav Türüne Göre Sorular",
    viewAll: "Tümünü gör",
    empty: "Henüz soru yok.",
    unassigned: "Atanmamış",
  },
  calibration: {
    title: "IRT Kalibrasyonu",
    statuses: {
      calibrated: {
        label: "IRT Kalibre Edildi",
        desc: "Tam psikometrik veri",
      },
      pre_set: {
        label: "Uzman Ön Ayarı",
        desc: "Zorluk yazarlar tarafından belirlendi",
      },
      calibrating: {
        label: "Kalibre Ediliyor",
        desc: "Yanıt verisi toplanıyor",
      },
      uncalibrated: {
        label: "Kalibre Edilmemiş",
        desc: "İlk yanıtlar bekleniyor",
      },
    },
  },
  recent: {
    title: "Son Eklenenler",
    allQuestions: "Tüm sorular",
    emptyTitle: "Henüz soru yok",
    emptyDescription: "Başlamak için ilk sorunuzu oluşturun.",
    newQuestion: "Yeni soru",
    noContent: "(içerik yok)",
    noExamType: "Sınav türü yok",
  },
  status: {
    draft: "Taslak",
    active: "Aktif",
    retired: "Emekli",
  },
};

export const dashOverview = { en, tr };
