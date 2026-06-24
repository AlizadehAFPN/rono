// Homepage (public marketing site) copy.
// `en` is the source of truth; `tr` must satisfy the exact same shape — if a key
// is missing or mistyped in Turkish, TypeScript fails the build.

const en = {
  nav: {
    problem: "The Problem",
    solution: "Our Solution",
    howItWorks: "How It Works",
    roadmap: "Roadmap",
    getEarlyAccess: "Get Early Access",
    accessWebApp: "Access Web App",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Rono home",
  },
  hero: {
    eyebrow: "Adaptive Learning Platform",
    titleLine1: "The Right Question.",
    titleLine2: "At the Right Time.",
    subheadline:
      "Rono is an adaptive learning platform for medical education. Two peer-reviewed algorithms work in concert — one ensuring every question is perfectly calibrated to your ability, the other ensuring nothing you learn is ever forgotten.",
    ctaPrimary: "Request Early Access",
    ctaSecondary: "See How It Works",
    stats: {
      retentionLabel: "Target retention rate maintained",
      irtLabel: "IRT model for ability estimation",
      latencyLabel: "p95 question delivery target",
    },
    viz: {
      abilityEstimation: "Ability Estimation",
      memoryScheduling: "Memory Scheduling",
      orchestrator: "ORCHESTRATOR",
    },
  },
  problem: {
    eyebrow: "The Challenge",
    title: "Medical education has a retention problem.",
    subtitle:
      "The way medical professionals are trained today relies on systems that were not designed with learning science in mind. The consequences are visible in clinical practice.",
    cards: {
      generic: {
        title: "Generic, One-Size-Fits-All Content",
        description:
          "Traditional curricula deliver identical material to every student, regardless of what they already know. Students are bored by content they have mastered, or overwhelmed by content they are not yet ready for.",
      },
      memorization: {
        title: "Memorization Without Retention",
        description:
          "Medical students master material for exams and forget it within weeks. Without a scientifically grounded review schedule, knowledge decay is inevitable — and the consequences in clinical practice can be serious.",
      },
      noAdaptation: {
        title: "No Real-Time Adaptation",
        description:
          "Most learning platforms treat every student as equal. There is no feedback loop between performance and content difficulty, leaving students trapped in inefficient learning cycles with no measurable progress signal.",
      },
    },
    transition:
      "Rono was built to solve each of these problems — separately and precisely.",
  },
  solution: {
    eyebrow: "Our Solution",
    title: "Two algorithms. One unified platform.",
    subtitle:
      "Most adaptive systems conflate two very different problems into a single mechanism. Rono keeps them rigorously separate — giving each algorithm the precision it deserves, and the independence it needs to evolve.",
    irt: {
      algoLabel: "Algorithm 1",
      name: "Item Response Theory (2PL)",
      question: "“What should I learn next?”",
      description:
        "Using the 2-Parameter Logistic model, Rono continuously estimates each learner's ability on a calibrated scale. It then selects the question that provides maximum information about the learner's current knowledge state — always at the edge of their competence, never above or below it.",
      points: [
        "Real-time ability estimation via Expected A Posteriori (EAP)",
        "Item selection via Fisher information maximization",
        "Calibrated question bank with per-item difficulty and discrimination",
      ],
    },
    fsrs: {
      algoLabel: "Algorithm 2",
      name: "FSRS-5 Spaced Repetition",
      question: "“When should I review it?”",
      description:
        "FSRS-5 models memory at the individual item level, tracking Difficulty, Stability, and Retrievability for every piece of knowledge. It schedules each review precisely when the probability of recall approaches 90% — not a day sooner, not a day later.",
      points: [
        "Per-item memory state: Difficulty, Stability, Retrievability",
        "90% retention target maintained across all knowledge",
        "Learns continuously from actual forgetting and recovery patterns",
      ],
    },
    orchestrator: {
      title: "The Orchestrator",
      description:
        "A single decision point determines on every request whether to surface a due review (FSRS-5) or introduce a new learning item (IRT). The two algorithms are never conflated — each calibrates, fails, and evolves independently, ensuring the overall system remains transparent and correct.",
    },
  },
  howItWorks: {
    eyebrow: "How It Works",
    title: "Three steps. Continuously adapting.",
    subtitle:
      "From the first question to the thousandth review, Rono is always computing the optimal next action for each individual learner.",
    steps: [
      {
        title: "Rono establishes your baseline",
        description:
          "Your first session begins with an adaptive assessment. Every response — correct or incorrect — immediately updates your ability estimate using Bayesian inference, converging on your true knowledge level within minutes.",
        tag: "IRT · EAP estimation · Bayesian inference",
      },
      {
        title: "You receive the perfectly calibrated question",
        description:
          "Based on your live ability estimate, Rono selects the item that maximizes learning information. Not too easy. Not too hard. Precisely at the boundary of your current competence — exactly where learning happens fastest.",
        tag: "Fisher information maximization · 2PL model",
      },
      {
        title: "Reviews arrive exactly when you need them",
        description:
          "The memory scheduler tracks each piece of knowledge independently. When your probability of recall for an item approaches 90%, it is surfaced for review. After each response, memory stability is recalculated and the next optimal review date is set.",
        tag: "FSRS-5 · Difficulty · Stability · Retrievability",
      },
    ],
  },
  differentiators: {
    eyebrow: "Why Rono",
    titleLine1: "Built on sound principles.",
    titleLine2: "Engineered for scale.",
    subtitle:
      "Rono is different because it was designed around learning science first — and technology second. Every architectural decision reflects that order of priority.",
    features: [
      {
        title: "Peer-Reviewed Science",
        description:
          "IRT and FSRS-5 are rigorously validated algorithms from the cognitive science and psychometrics literature — not proprietary heuristics. Every design decision has a published basis.",
      },
      {
        title: "Architectural Clarity",
        description:
          "The two core algorithms are kept strictly separate. Each can evolve, be recalibrated, or be replaced without affecting the other — a key advantage as learning science advances.",
      },
      {
        title: "Built for Medical Education",
        description:
          "Designed specifically for the depth and complexity of medical science content, with hierarchical topic organization and item banks that can be calibrated to specialty and level.",
      },
      {
        title: "Real-Time Adaptation",
        description:
          "Every response instantly updates the learner's ability estimate. There is no batch processing or delayed recalculation — adaptation is continuous, immediate, and per-item.",
      },
      {
        title: "Performance by Design",
        description:
          "Built from day one with a clear performance budget: p95 question delivery under 100ms, with Redis caching targeting sub-50ms on warm reads. Production-ready from the ground up.",
      },
      {
        title: "Scalable Architecture",
        description:
          "From a solo learner to an entire medical school cohort, the system architecture scales horizontally without fundamental redesign — suitable for institutional deployment from day one.",
      },
    ],
  },
  platforms: {
    eyebrow: "Available Platforms",
    title: "Learn anywhere, on any device.",
    subtitle:
      "Rono is designed for the way medical professionals actually study — across devices, with and without connectivity, whenever the moment is right.",
    statusAvailable: "Available",
    statusSoon: "Coming Soon",
    comingSoonSuffix: "Coming Soon",
    web: {
      name: "Web Application",
      tagline: "No installation. Open and learn.",
      description:
        "Your full learning dashboard is available in any modern browser. Start a session from your desktop, laptop, or tablet — all progress syncs in real time.",
      cta: "Access Web App",
      meta: "",
      storeNote: "",
    },
    android: {
      name: "Android",
      tagline: "Native app — download now.",
      description:
        "Native Android app with push notifications for scheduled reviews and seamless cross-device progress sync. Download the APK directly to get started today.",
      cta: "Download APK",
      meta: "v1.0.0 · APK · 2.6 MB",
      storeNote: "Google Play",
    },
    ios: {
      name: "iOS",
      tagline: "Install as a web app.",
      description:
        "Add Rono to your home screen straight from Safari for a full-screen, app-like experience that syncs across all your devices — no App Store needed.",
      cta: "Install as PWA",
      meta: "",
      storeNote: "App Store",
    },
    syncNote:
      "All platforms share the same learning state. Progress, ability estimates, and review schedules sync automatically across devices.",
  },
  roadmap: {
    eyebrow: "Development Roadmap",
    title: "A clear path from foundation to product.",
    subtitle:
      "Phase 0 is complete. Active development continues on a structured, milestone-driven roadmap with clear acceptance criteria at each phase.",
    statusComplete: "Complete",
    statusActive: "In Progress",
    statusUpcoming: "Upcoming",
    phaseLabel: "Phase",
    phases: [
      {
        title: "Foundation",
        description:
          "Infrastructure, containerization, CI/CD pipeline, health monitoring, and developer experience tooling.",
        items: [
          "Docker Compose: PostgreSQL 16, Redis 7, FastAPI, Next.js",
          "GitHub Actions CI with pre-commit quality gates",
          "Health and readiness check endpoints",
          "Makefile shortcuts and environment configuration",
        ],
      },
      {
        title: "Backend & Data Model",
        description:
          "Complete database schema, authentication system, and REST API foundations.",
        items: [
          "7-table PostgreSQL schema with full indexing",
          "JWT-based auth with role-based access control",
          "Admin item management endpoints",
          "Append-only response log — immutable system of record",
        ],
      },
      {
        title: "Algorithmic Core",
        description:
          "IRT and FSRS-5 engines working end-to-end with the unified orchestrator.",
        items: [
          "EAP ability estimation from response data",
          "Fisher information item selection",
          "Per-item FSRS-5 memory state tracking",
          "Orchestrator decision logic: review vs. new item",
        ],
      },
      {
        title: "Learning Interface",
        description:
          "Full-featured student interface, progress dashboard, and instructor panel.",
        items: [
          "Adaptive practice session UI",
          "Real-time ability progress visualizations",
          "Instructor item management panel",
          "Mobile-responsive design across all views",
        ],
      },
      {
        title: "Public Beta",
        description:
          "Production-ready deployment with real medical content and institutional onboarding.",
        items: [
          "Calibrated medical question bank",
          "Institutional account management",
          "Cloud deployment infrastructure",
          "Beta partner onboarding program",
        ],
      },
      {
        title: "AI Calibration",
        description:
          "Automatic item parameter fitting from accumulated response data.",
        items: [
          "Offline IRT calibration pipeline (10k items in ~5 min)",
          "Adaptive difficulty adjustment from cohort data",
          "Analytics and longitudinal reporting layer",
          "Multi-cohort performance benchmarking",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Get Involved",
    titleLine1: "Join the future of",
    titleLine2: "medical education.",
    subtitle:
      "Rono is in active development and is seeking early partners who believe that learning science and technology can fundamentally improve how medical professionals are trained.",
    partnerTypes: [
      {
        label: "Pilot Institutions",
        description:
          "Medical schools and residency programs interested in early adoption.",
      },
      {
        label: "Research Collaborators",
        description:
          "Academics and educators working in learning science or psychometrics.",
      },
      {
        label: "Strategic Partners",
        description:
          "Organizations aligned with evidence-based medical education.",
      },
    ],
    ctaPrimary: "Contact the Team",
    ctaSecondary: "Learn More About Rono",
    statusLine:
      "Currently in active development · Phase 0 complete · Accepting pilot partners and research collaborations",
  },
  footer: {
    tagline: "Adaptive Learning Platform",
    problem: "The Problem",
    solution: "Our Solution",
    howItWorks: "How It Works",
    roadmap: "Roadmap",
    contact: "Contact",
    copyright: "© 2026 Rono.",
    rights: "All rights reserved.",
  },
};

export type HomeDict = typeof en;

const tr: HomeDict = {
  nav: {
    problem: "Sorun",
    solution: "Çözümümüz",
    howItWorks: "Nasıl Çalışır",
    roadmap: "Yol Haritası",
    getEarlyAccess: "Erken Erişim Alın",
    accessWebApp: "Web Uygulamasına Eriş",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    home: "Rono ana sayfa",
  },
  hero: {
    eyebrow: "Uyarlanabilir Öğrenme Platformu",
    titleLine1: "Doğru Soru.",
    titleLine2: "Doğru Zamanda.",
    subheadline:
      "Rono, tıp eğitimi için geliştirilmiş uyarlanabilir bir öğrenme platformudur. Hakemli iki algoritma uyum içinde çalışır — biri her sorunun yeteneğinize tam olarak göre ayarlanmasını, diğeri öğrendiğiniz hiçbir şeyin asla unutulmamasını sağlar.",
    ctaPrimary: "Erken Erişim Talep Edin",
    ctaSecondary: "Nasıl Çalıştığını Görün",
    stats: {
      retentionLabel: "Hedeflenen kalıcılık oranı korunur",
      irtLabel: "Yetenek tahmini için IRT modeli",
      latencyLabel: "p95 soru sunum hedefi",
    },
    viz: {
      abilityEstimation: "Yetenek Tahmini",
      memoryScheduling: "Bellek Planlaması",
      orchestrator: "ORKESTRATÖR",
    },
  },
  problem: {
    eyebrow: "Zorluk",
    title: "Tıp eğitiminin bir kalıcılık sorunu var.",
    subtitle:
      "Tıp profesyonellerinin bugün eğitildiği yöntemler, öğrenme bilimi göz önünde bulundurularak tasarlanmamış sistemlere dayanıyor. Bunun sonuçları klinik uygulamada açıkça görülüyor.",
    cards: {
      generic: {
        title: "Genel, Herkese Tek Tip İçerik",
        description:
          "Geleneksel müfredatlar, öğrencilerin neyi bildiğine bakmaksızın herkese aynı içeriği sunar. Öğrenciler ya çoktan öğrendikleri içerikten sıkılır ya da henüz hazır olmadıkları içeriğin altında ezilir.",
      },
      memorization: {
        title: "Kalıcılık Olmadan Ezber",
        description:
          "Tıp öğrencileri konuları sınavlar için öğrenir ve haftalar içinde unutur. Bilimsel temelli bir tekrar programı olmadan bilgi kaybı kaçınılmazdır — ve klinik uygulamadaki sonuçları ciddi olabilir.",
      },
      noAdaptation: {
        title: "Gerçek Zamanlı Uyarlama Yok",
        description:
          "Çoğu öğrenme platformu her öğrenciye eşit davranır. Performans ile içerik zorluğu arasında bir geri bildirim döngüsü yoktur; bu da öğrencileri ölçülebilir bir ilerleme sinyali olmayan verimsiz öğrenme döngülerine hapseder.",
      },
    },
    transition:
      "Rono, bu sorunların her birini — ayrı ayrı ve hassas biçimde — çözmek için tasarlandı.",
  },
  solution: {
    eyebrow: "Çözümümüz",
    title: "İki algoritma. Tek bütünleşik platform.",
    subtitle:
      "Çoğu uyarlanabilir sistem, birbirinden çok farklı iki sorunu tek bir mekanizmada birleştirir. Rono bunları titizlikle ayrı tutar — her algoritmaya hak ettiği hassasiyeti ve gelişmek için ihtiyaç duyduğu bağımsızlığı verir.",
    irt: {
      algoLabel: "Algoritma 1",
      name: "Madde Tepki Kuramı (2PL)",
      question: "“Sırada ne öğrenmeliyim?”",
      description:
        "2 Parametreli Lojistik modeli kullanan Rono, her öğrencinin yeteneğini kalibre edilmiş bir ölçekte sürekli olarak tahmin eder. Ardından öğrencinin mevcut bilgi durumu hakkında en fazla bilgiyi sağlayan soruyu seçer — her zaman yetkinliğinin sınırında, asla üstünde veya altında değil.",
      points: [
        "Beklenen Sonsal (EAP) ile gerçek zamanlı yetenek tahmini",
        "Fisher bilgisi maksimizasyonu ile soru seçimi",
        "Madde bazında zorluk ve ayırt edicilik içeren kalibre edilmiş soru bankası",
      ],
    },
    fsrs: {
      algoLabel: "Algoritma 2",
      name: "FSRS-5 Aralıklı Tekrar",
      question: "“Ne zaman tekrar etmeliyim?”",
      description:
        "FSRS-5, belleği madde düzeyinde modeller; her bilgi parçası için Zorluk, Kararlılık ve Geri Çağrılabilirlik değerlerini izler. Her tekrarı, hatırlama olasılığı %90'a yaklaştığı anda planlar — ne bir gün önce, ne bir gün sonra.",
      points: [
        "Madde bazında bellek durumu: Zorluk, Kararlılık, Geri Çağrılabilirlik",
        "Tüm bilgilerde %90 kalıcılık hedefi korunur",
        "Gerçek unutma ve hatırlama örüntülerinden sürekli öğrenir",
      ],
    },
    orchestrator: {
      title: "Orkestratör",
      description:
        "Tek bir karar noktası, her istekte zamanı gelmiş bir tekrarı (FSRS-5) mı yoksa yeni bir öğrenme maddesini (IRT) mi sunacağını belirler. İki algoritma asla birbirine karıştırılmaz — her biri bağımsız olarak kalibre olur, hata yapar ve gelişir; böylece sistemin bütünü şeffaf ve doğru kalır.",
    },
  },
  howItWorks: {
    eyebrow: "Nasıl Çalışır",
    title: "Üç adım. Sürekli uyarlanıyor.",
    subtitle:
      "İlk sorudan bininci tekrara kadar Rono, her öğrenci için en uygun bir sonraki eylemi sürekli olarak hesaplar.",
    steps: [
      {
        title: "Rono temel seviyenizi belirler",
        description:
          "İlk oturumunuz uyarlanabilir bir değerlendirmeyle başlar. Doğru ya da yanlış her yanıt, Bayes çıkarımı kullanılarak yetenek tahmininizi anında günceller ve dakikalar içinde gerçek bilgi düzeyinize yakınsar.",
        tag: "IRT · EAP tahmini · Bayes çıkarımı",
      },
      {
        title: "Tam olarak kalibre edilmiş soruyu alırsınız",
        description:
          "Anlık yetenek tahmininize göre Rono, öğrenme bilgisini en üst düzeye çıkaran maddeyi seçer. Ne çok kolay, ne çok zor. Tam olarak mevcut yetkinliğinizin sınırında — öğrenmenin en hızlı gerçekleştiği yerde.",
        tag: "Fisher bilgisi maksimizasyonu · 2PL modeli",
      },
      {
        title: "Tekrarlar tam ihtiyacınız olduğunda gelir",
        description:
          "Bellek planlayıcısı her bilgi parçasını bağımsız olarak izler. Bir maddeyi hatırlama olasılığınız %90'a yaklaştığında o madde tekrar için sunulur. Her yanıttan sonra bellek kararlılığı yeniden hesaplanır ve bir sonraki en uygun tekrar tarihi belirlenir.",
        tag: "FSRS-5 · Zorluk · Kararlılık · Geri Çağrılabilirlik",
      },
    ],
  },
  differentiators: {
    eyebrow: "Neden Rono",
    titleLine1: "Sağlam ilkeler üzerine kuruldu.",
    titleLine2: "Ölçeklenmek için tasarlandı.",
    subtitle:
      "Rono farklıdır çünkü önce öğrenme bilimi, sonra teknoloji etrafında tasarlandı. Her mimari karar bu öncelik sırasını yansıtır.",
    features: [
      {
        title: "Hakemli Bilim",
        description:
          "IRT ve FSRS-5, bilişsel bilim ve psikometri literatüründen titizlikle doğrulanmış algoritmalardır — tescilli sezgisel yöntemler değil. Her tasarım kararının yayımlanmış bir dayanağı vardır.",
      },
      {
        title: "Mimari Berraklık",
        description:
          "İki temel algoritma kesinlikle ayrı tutulur. Her biri diğerini etkilemeden gelişebilir, yeniden kalibre edilebilir veya değiştirilebilir — öğrenme bilimi ilerledikçe önemli bir avantaj.",
      },
      {
        title: "Tıp Eğitimi İçin Tasarlandı",
        description:
          "Tıp bilimi içeriğinin derinliği ve karmaşıklığı için özel olarak tasarlandı; hiyerarşik konu organizasyonu ve uzmanlık ile düzeye göre kalibre edilebilen soru bankaları içerir.",
      },
      {
        title: "Gerçek Zamanlı Uyarlama",
        description:
          "Her yanıt, öğrencinin yetenek tahminini anında günceller. Toplu işleme veya gecikmeli yeniden hesaplama yoktur — uyarlama süreklidir, anlıktır ve madde bazındadır.",
      },
      {
        title: "Tasarımdan Gelen Performans",
        description:
          "İlk günden net bir performans bütçesiyle inşa edildi: 100 ms altında p95 soru sunumu ve sıcak okumalarda 50 ms altını hedefleyen Redis önbelleği. Baştan sona üretime hazır.",
      },
      {
        title: "Ölçeklenebilir Mimari",
        description:
          "Tek bir öğrenciden tüm bir tıp fakültesi kümesine kadar, sistem mimarisi temelden yeniden tasarlanmaya gerek olmadan yatay olarak ölçeklenir — ilk günden kurumsal dağıtıma uygun.",
      },
    ],
  },
  platforms: {
    eyebrow: "Mevcut Platformlar",
    title: "Her yerde, her cihazda öğrenin.",
    subtitle:
      "Rono, tıp profesyonellerinin gerçekte nasıl çalıştığı göz önünde bulundurularak tasarlandı — cihazlar arası, bağlantı olsun olmasın, doğru an geldiğinde.",
    statusAvailable: "Kullanılabilir",
    statusSoon: "Yakında",
    comingSoonSuffix: "Yakında",
    web: {
      name: "Web Uygulaması",
      tagline: "Kurulum yok. Aç ve öğren.",
      description:
        "Tüm öğrenme panonuz her modern tarayıcıda kullanılabilir. Masaüstü, dizüstü veya tabletinizden bir oturum başlatın — tüm ilerlemeniz gerçek zamanlı olarak eşitlenir.",
      cta: "Web Uygulamasına Eriş",
      meta: "",
      storeNote: "",
    },
    android: {
      name: "Android",
      tagline: "Yerel uygulama — şimdi indir.",
      description:
        "Planlanan tekrarlar için anlık bildirimler ve sorunsuz cihazlar arası ilerleme eşitlemesi sunan yerel Android uygulaması. Hemen başlamak için APK'yı doğrudan indirin.",
      cta: "APK İndir",
      meta: "v1.0.0 · APK · 2.6 MB",
      storeNote: "Google Play",
    },
    ios: {
      name: "iOS",
      tagline: "Web uygulaması olarak yükle.",
      description:
        "Rono'i doğrudan Safari'den ana ekranınıza ekleyin; App Store'a gerek kalmadan tüm cihazlarınızda eşitlenen, tam ekran ve uygulama benzeri bir deneyim yaşayın.",
      cta: "PWA Olarak Yükle",
      meta: "",
      storeNote: "App Store",
    },
    syncNote:
      "Tüm platformlar aynı öğrenme durumunu paylaşır. İlerleme, yetenek tahminleri ve tekrar programları cihazlar arasında otomatik olarak eşitlenir.",
  },
  roadmap: {
    eyebrow: "Geliştirme Yol Haritası",
    title: "Temelden ürüne giden net bir yol.",
    subtitle:
      "Faz 0 tamamlandı. Aktif geliştirme, her fazda net kabul ölçütleri bulunan yapılandırılmış ve kilometre taşı odaklı bir yol haritasında sürüyor.",
    statusComplete: "Tamamlandı",
    statusActive: "Devam Ediyor",
    statusUpcoming: "Yaklaşan",
    phaseLabel: "Faz",
    phases: [
      {
        title: "Temel",
        description:
          "Altyapı, konteynerleştirme, CI/CD hattı, sağlık izleme ve geliştirici deneyimi araçları.",
        items: [
          "Docker Compose: PostgreSQL 16, Redis 7, FastAPI, Next.js",
          "Commit öncesi kalite denetimleriyle GitHub Actions CI",
          "Sağlık ve hazır olma denetim uç noktaları",
          "Makefile kısayolları ve ortam yapılandırması",
        ],
      },
      {
        title: "Arka Uç ve Veri Modeli",
        description:
          "Eksiksiz veritabanı şeması, kimlik doğrulama sistemi ve REST API temelleri.",
        items: [
          "Tam indekslemeli 7 tablolu PostgreSQL şeması",
          "Rol tabanlı erişim denetimli JWT kimlik doğrulama",
          "Yönetici soru yönetimi uç noktaları",
          "Yalnızca ekleme yapılan yanıt günlüğü — değiştirilemez kayıt sistemi",
        ],
      },
      {
        title: "Algoritmik Çekirdek",
        description:
          "IRT ve FSRS-5 motorlarının bütünleşik orkestratörle uçtan uca çalışması.",
        items: [
          "Yanıt verisinden EAP yetenek tahmini",
          "Fisher bilgisi ile soru seçimi",
          "Madde bazında FSRS-5 bellek durumu takibi",
          "Orkestratör karar mantığı: tekrar mı yeni soru mu",
        ],
      },
      {
        title: "Öğrenme Arayüzü",
        description:
          "Tam özellikli öğrenci arayüzü, ilerleme panosu ve eğitmen paneli.",
        items: [
          "Uyarlanabilir alıştırma oturumu arayüzü",
          "Gerçek zamanlı yetenek ilerleme görselleştirmeleri",
          "Eğitmen soru yönetimi paneli",
          "Tüm görünümlerde mobil uyumlu tasarım",
        ],
      },
      {
        title: "Herkese Açık Beta",
        description:
          "Gerçek tıbbi içerik ve kurumsal katılımla üretime hazır dağıtım.",
        items: [
          "Kalibre edilmiş tıbbi soru bankası",
          "Kurumsal hesap yönetimi",
          "Bulut dağıtım altyapısı",
          "Beta iş ortağı katılım programı",
        ],
      },
      {
        title: "Yapay Zeka Kalibrasyonu",
        description:
          "Biriken yanıt verisinden otomatik soru parametresi uydurma.",
        items: [
          "Çevrimdışı IRT kalibrasyon hattı (~5 dakikada 10 bin soru)",
          "Küme verisinden uyarlanabilir zorluk ayarı",
          "Analitik ve uzunlamasına raporlama katmanı",
          "Çoklu küme performans kıyaslaması",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Katılın",
    titleLine1: "Tıp eğitiminin",
    titleLine2: "geleceğine katılın.",
    subtitle:
      "Rono aktif geliştirme aşamasındadır ve öğrenme bilimi ile teknolojinin, tıp profesyonellerinin yetiştirilme biçimini köklü biçimde iyileştirebileceğine inanan erken iş ortakları aramaktadır.",
    partnerTypes: [
      {
        label: "Pilot Kurumlar",
        description:
          "Erken benimsemeye ilgi duyan tıp fakülteleri ve uzmanlık programları.",
      },
      {
        label: "Araştırma İş Birlikçileri",
        description:
          "Öğrenme bilimi veya psikometri alanında çalışan akademisyenler ve eğitimciler.",
      },
      {
        label: "Stratejik İş Ortakları",
        description: "Kanıta dayalı tıp eğitimiyle uyumlu kuruluşlar.",
      },
    ],
    ctaPrimary: "Ekiple İletişime Geçin",
    ctaSecondary: "Rono Hakkında Daha Fazla Bilgi",
    statusLine:
      "Şu anda aktif geliştirme aşamasında · Faz 0 tamamlandı · Pilot iş ortakları ve araştırma iş birlikleri kabul ediliyor",
  },
  footer: {
    tagline: "Uyarlanabilir Öğrenme Platformu",
    problem: "Sorun",
    solution: "Çözümümüz",
    howItWorks: "Nasıl Çalışır",
    roadmap: "Yol Haritası",
    contact: "İletişim",
    copyright: "© 2026 Rono.",
    rights: "Tüm hakları saklıdır.",
  },
};

export const home = { en, tr };
