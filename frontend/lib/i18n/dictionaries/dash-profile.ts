// Profile page: identity, self-service profile edit, and a transparent view of
// the learner's own adaptive state (IRT ability θ, mastery, review load).

const en = {
  pageTitle: "Profile",

  identity: {
    memberSince: "Member since",
    lastLogin: "Last sign-in",
    never: "Never",
    institution: "Institution",
    role: "Role",
    emailVerified: "Email verified",
    emailUnverified: "Email not verified",
    accountActive: "Active",
    accountInactive: "Deactivated",
  },

  edit: {
    title: "Personal details",
    description: "This is how you appear across Rono.",
    fullName: "Full name",
    fullNamePh: "Jane Doe",
    preferredName: "Preferred name",
    preferredNamePh: "Jane",
    preferredNameHint: "Shown in the sidebar and greetings. Optional.",
    save: "Save changes",
    saving: "Saving…",
    saved: "Profile updated",
    saveFailed: "Couldn't save your profile",
    error: "Error",
  },

  daily: {
    title: "Daily target",
    description:
      "Your daily review goal — applied each time you start a daily session. Change it any time.",
    target: "Questions per day",
    questionsOpt: (n: number) => `${n}`,
    limit: "Session length",
    byCount: "By questions",
    byTime: "By time",
    minutesOpt: (n: number) => `${n} min`,
    newCap: "New questions per day",
    newCapHint:
      "How many brand-new questions you can be introduced to each day. Reviews of questions you've already seen are never capped.",
    newCapWarning:
      "Raising this builds a heavier review load over the next few days — increase it only if you can keep up.",
    collectionsNote:
      "Choose which collections to include on the Daily Review screen.",
    save: "Save target",
    saving: "Saving…",
    saved: "Daily target updated",
    saveFailed: "Couldn't save your daily target",
  },

  avatar: {
    alt: "Profile photo",
    upload: "Upload photo",
    change: "Change photo",
    remove: "Remove photo",
    uploading: "Uploading…",
    removing: "Removing…",
    hint: "JPEG, PNG, WebP or GIF. Max 5 MB.",
    uploaded: "Photo updated",
    removed: "Photo removed",
    uploadFailed: "Couldn't upload your photo",
    removeFailed: "Couldn't remove your photo",
    tooLarge: "Image is too large. Maximum size is 5 MB.",
    badType: "Unsupported format. Use JPEG, PNG, WebP or GIF.",
  },

  state: {
    title: "Your learning state",
    description:
      "A transparent, real-time view of what the adaptive engine knows about you. Nothing here is hidden.",
    empty:
      "You haven't answered any questions yet. Start a practice session and your ability, mastery, and review schedule will appear here.",

    ability: {
      label: "Ability (θ)",
      help: "Your estimated skill on a standard scale where 0 is the average learner. The engine updates it after every answer using Item Response Theory (2PL).",
      confidenceLabel: "Confidence",
      confidence: {
        building: "Still calibrating",
        medium: "Firming up",
        high: "Well established",
      },
      // Plain-language reading of the θ value.
      interpret: {
        building: "Building foundations",
        developing: "Developing",
        solid: "On track",
        advanced: "Advanced",
      },
      interpretHint: {
        building: "Below the average learner — focus on the fundamentals.",
        developing: "Approaching the average learner.",
        solid: "At or above the average learner.",
        advanced: "Well above the average learner.",
      },
    },

    stats: {
      answered: "Questions answered",
      correct: "Correct",
      accuracy: "Accuracy",
      reviewDue: "Reviews due",
      reviewDueHelp:
        "Cards the FSRS-5 spaced-repetition scheduler says are ready to review now.",
      newAvailable: "New available",
    },

    mastery: {
      title: "Mastery by topic",
      description: "Where each topic sits on the path to mastery.",
      empty: "No topic data yet.",
      questions: "questions",
      distributionTitle: "Mastery distribution",
    },

    sessions: {
      title: "Recent sessions",
      empty: "No sessions yet.",
      net: "Net",
    },
  },
};

export type DashProfileDict = typeof en;

const tr: DashProfileDict = {
  pageTitle: "Profil",

  identity: {
    memberSince: "Üyelik başlangıcı",
    lastLogin: "Son giriş",
    never: "Hiç",
    institution: "Kurum",
    role: "Rol",
    emailVerified: "E-posta doğrulandı",
    emailUnverified: "E-posta doğrulanmadı",
    accountActive: "Aktif",
    accountInactive: "Devre dışı",
  },

  edit: {
    title: "Kişisel bilgiler",
    description: "Rono genelinde bu şekilde görünürsünüz.",
    fullName: "Ad soyad",
    fullNamePh: "Ayşe Yılmaz",
    preferredName: "Tercih edilen ad",
    preferredNamePh: "Ayşe",
    preferredNameHint: "Kenar çubuğunda ve karşılamalarda gösterilir. İsteğe bağlı.",
    save: "Değişiklikleri kaydet",
    saving: "Kaydediliyor…",
    saved: "Profil güncellendi",
    saveFailed: "Profiliniz kaydedilemedi",
    error: "Hata",
  },

  daily: {
    title: "Günlük hedef",
    description:
      "Günlük tekrar hedefin — her günlük oturum başlattığında uygulanır. İstediğin zaman değiştir.",
    target: "Günlük soru sayısı",
    questionsOpt: (n: number) => `${n}`,
    limit: "Oturum uzunluğu",
    byCount: "Soruya göre",
    byTime: "Süreye göre",
    minutesOpt: (n: number) => `${n} dk`,
    newCap: "Günlük yeni soru",
    newCapHint:
      "Her gün kaç yeni soruyla tanışabileceğin. Daha önce gördüğün soruların tekrarı asla sınırlanmaz.",
    newCapWarning:
      "Bunu artırmak sonraki günlerde daha ağır bir tekrar yükü oluşturur — ancak takip edebileceksen artır.",
    collectionsNote:
      "Hangi koleksiyonların dahil olacağını Günlük Tekrar ekranından seç.",
    save: "Hedefi kaydet",
    saving: "Kaydediliyor…",
    saved: "Günlük hedef güncellendi",
    saveFailed: "Günlük hedefin kaydedilemedi",
  },

  avatar: {
    alt: "Profil fotoğrafı",
    upload: "Fotoğraf yükle",
    change: "Fotoğrafı değiştir",
    remove: "Fotoğrafı kaldır",
    uploading: "Yükleniyor…",
    removing: "Kaldırılıyor…",
    hint: "JPEG, PNG, WebP veya GIF. En fazla 5 MB.",
    uploaded: "Fotoğraf güncellendi",
    removed: "Fotoğraf kaldırıldı",
    uploadFailed: "Fotoğrafınız yüklenemedi",
    removeFailed: "Fotoğrafınız kaldırılamadı",
    tooLarge: "Görsel çok büyük. En fazla 5 MB olabilir.",
    badType: "Desteklenmeyen biçim. JPEG, PNG, WebP veya GIF kullanın.",
  },

  state: {
    title: "Öğrenme durumunuz",
    description:
      "Uyarlanabilir motorun sizin hakkınızda bildiklerinin şeffaf, gerçek zamanlı görünümü. Burada hiçbir şey gizli değildir.",
    empty:
      "Henüz hiç soru yanıtlamadınız. Bir alıştırma oturumu başlatın; yetenek, ustalık ve tekrar planınız burada görünecek.",

    ability: {
      label: "Yetenek (θ)",
      help: "0'ın ortalama öğrenciyi temsil ettiği standart bir ölçekte tahmini beceriniz. Motor, her yanıttan sonra Madde Tepki Kuramı (2PL) ile günceller.",
      confidenceLabel: "Güven",
      confidence: {
        building: "Hâlâ kalibre ediliyor",
        medium: "Sağlamlaşıyor",
        high: "İyi oturmuş",
      },
      interpret: {
        building: "Temel oluşturuluyor",
        developing: "Gelişiyor",
        solid: "Yolunda",
        advanced: "İleri düzey",
      },
      interpretHint: {
        building: "Ortalama öğrencinin altında — temellere odaklanın.",
        developing: "Ortalama öğrenciye yaklaşıyor.",
        solid: "Ortalama öğrenci düzeyinde veya üzerinde.",
        advanced: "Ortalama öğrencinin oldukça üzerinde.",
      },
    },

    stats: {
      answered: "Yanıtlanan soru",
      correct: "Doğru",
      accuracy: "Doğruluk",
      reviewDue: "Bekleyen tekrar",
      reviewDueHelp:
        "FSRS-5 aralıklı tekrar planlayıcısının şimdi tekrar edilmeye hazır dediği kartlar.",
      newAvailable: "Yeni mevcut",
    },

    mastery: {
      title: "Konuya göre ustalık",
      description: "Her konunun ustalık yolundaki yeri.",
      empty: "Henüz konu verisi yok.",
      questions: "soru",
      distributionTitle: "Ustalık dağılımı",
    },

    sessions: {
      title: "Son oturumlar",
      empty: "Henüz oturum yok.",
      net: "Net",
    },
  },
};

export const dashProfile = { en, tr };
