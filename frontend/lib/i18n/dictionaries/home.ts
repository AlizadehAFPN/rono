// Homepage (public marketing site) copy.
// `en` is the source of truth; `fa` must satisfy the exact same shape — if a key
// is missing or mistyped in Persian, TypeScript fails the build.
//
// Domain: preparation & review for Iran's high-traffic employment exams
// (آزمون استخدامی). Voice: warm, plain, encouraging — NEVER technical. The smart
// engine stays behind the scenes; the user only ever sees the simple benefit.

const en = {
  nav: {
    problem: "The Challenge",
    solution: "How It Helps",
    howItWorks: "How It Works",
    roadmap: "What's Coming",
    getEarlyAccess: "Start Free",
    accessWebApp: "Open App",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Rono home",
  },
  hero: {
    eyebrow: "Employment-Exam Prep",
    titleLine1: "Real employment-exam questions.",
    titleLine2: "Study, review, get hired.",
    subheadline:
      "Every question from past employment exams, in one place and neatly sorted. Rono keeps track of which ones you've got down and which still trip you up — and brings the tricky ones back at just the right time, so nothing slips away before exam day.",
    ctaPrimary: "Start Free",
    ctaSecondary: "See How It Works",
    stats: {
      s1: { value: "Real", label: "Actual questions from past exams" },
      s2: { value: "4", label: "Major employment exams covered" },
      s3: { value: "Free", label: "Start at no cost, right now" },
    },
    viz: {
      leftTitle: "Right question",
      leftSub: "matched to your level",
      rightTitle: "Timely review",
      rightSub: "so it sticks",
      center: "your plan",
    },
  },
  problem: {
    eyebrow: "The Challenge",
    title: "Getting ready for an employment exam is harder than it should be.",
    subtitle:
      "Most candidates aren't short on talent — they're buried under scattered material and the wrong way of studying. Three problems show up every time:",
    cards: {
      generic: {
        title: "Material scattered everywhere",
        description:
          "Questions and notes are spread all over the place. You don't know where to start or what matters most, and you burn hours just hunting for a decent source.",
      },
      memorization: {
        title: "You read it, then forget it",
        description:
          "What you studied this week is gone a few weeks later. Without a steady review rhythm, you sit down on exam day only to find you've forgotten most of it.",
      },
      noAdaptation: {
        title: "You can't tell where you stand",
        description:
          "There's no clear sign of how ready you actually are or which subjects you're weak in. That brings stress — and sends your time to the wrong places.",
      },
    },
    transition: "Rono was built to fix exactly these three.",
  },
  solution: {
    eyebrow: "How It Helps",
    title: "Two simple things that make the difference.",
    subtitle:
      "Rono does two important things for you, without you having to think about any of it.",
    irt: {
      algoLabel: "Part 1",
      name: "Questions at your level",
      question: "“Where do I even start?”",
      description:
        "Rono notices what you know well and where you struggle, then shows questions that are never so easy you get bored, nor so hard you give up — right at the spot where you learn fastest.",
      points: [
        "Questions sized to your current level",
        "Your time goes to what you need, not what you already know",
        "The further you go, the sharper it gets",
      ],
    },
    fsrs: {
      algoLabel: "Part 2",
      name: "Review right on time",
      question: "“When should I go over it again?”",
      description:
        "Every question you learn, Rono remembers — and brings it back just before you'd forget it. The harder ones come around more often, the ones you've mastered less, so with the least time, everything stays put until exam day.",
      points: [
        "Harder questions come back more often",
        "What you already know doesn't waste your time",
        "Reminders land right before you'd forget",
      ],
    },
    orchestrator: {
      title: "You just study — we handle the rest",
      description:
        "No need to plan or figure out what to review and when. Every time, Rono decides on its own whether it's the moment for a fresh question or a review of something you've seen before. You just keep going.",
    },
  },
  howItWorks: {
    eyebrow: "How It Works",
    title: "Three simple steps.",
    subtitle: "From the very first question, Rono is right there with you.",
    steps: [
      {
        title: "First, it sees where you stand",
        description:
          "You answer a few questions so Rono can tell which subjects you're strong in and where you need more work — just a few minutes.",
        tag: "The first few minutes",
      },
      {
        title: "You get questions that fit you",
        description:
          "After that, you get questions sized just right for you — not so easy you lose interest, not so hard you get discouraged.",
        tag: "Matched to you",
      },
      {
        title: "We remind you right on time",
        description:
          "Everything you've studied comes back just before you'd forget it, so it becomes yours for good.",
        tag: "Timely review",
      },
    ],
  },
  differentiators: {
    eyebrow: "Why Rono",
    titleLine1: "Real questions, not made-up ones.",
    titleLine2: "A method that actually works.",
    subtitle:
      "Rono is built around one simple idea: take the real questions from past exams and review them smartly enough that every one becomes yours.",
    features: [
      {
        title: "Real exam questions",
        description:
          "Questions come from the actual booklets of past exams — not made-up samples. Exactly what you'll face on the day.",
      },
      {
        title: "Review until it's truly learned",
        description:
          "Reading once isn't enough. Rono repeats questions right on time so nothing slips away before exam day.",
      },
      {
        title: "Everything neatly sorted",
        description:
          "Questions are organized by exam, subject and topic, so you can jump straight to whatever you want.",
      },
      {
        title: "Full explanations",
        description:
          "Every question comes with a clear, complete answer — you don't just see right or wrong, you see why.",
      },
      {
        title: "Mock exams",
        description:
          "Whenever you like, take a timed test just like the real day and see exactly where you stand.",
      },
      {
        title: "On your phone, anywhere",
        description:
          "In a queue, on the bus, any spare few minutes — pull out your phone and review a few questions.",
      },
    ],
  },
  platforms: {
    eyebrow: "Every Device",
    title: "Study wherever you are.",
    subtitle:
      "We built Rono around the way you actually study — on your phone, tablet or computer, online or off.",
    statusAvailable: "Available",
    statusSoon: "Coming Soon",
    comingSoonSuffix: "Coming Soon",
    web: {
      name: "Web",
      tagline: "No install. Open and go.",
      description:
        "Your full dashboard opens in any browser. Start on a computer or tablet — everything stays in sync in real time.",
      cta: "Open App",
      meta: "",
      storeNote: "",
    },
    android: {
      name: "Android",
      tagline: "Native app — get it now.",
      description:
        "The Android app with review reminders and progress sync. Download the install file directly and start today.",
      cta: "Download App",
      meta: "v1.0.0 · APK · 2.6 MB",
      storeNote: "Google Play",
    },
    ios: {
      name: "iPhone",
      tagline: "Install it like an app.",
      description:
        "Add Rono to your home screen from Safari for a full-screen, app-like experience — no App Store needed.",
      cta: "Add to Home Screen",
      meta: "",
      storeNote: "App Store",
    },
    syncNote:
      "Wherever you sign in, your progress is the same. Reviews and your report sync automatically across all your devices.",
  },
  roadmap: {
    eyebrow: "What's Coming",
    title: "Getting better every week.",
    subtitle:
      "Rono works right now, and we keep adding more exams and features all the time.",
    statusComplete: "Ready",
    statusActive: "Adding now",
    statusUpcoming: "Coming soon",
    phaseLabel: "Stage",
    phases: [
      {
        title: "General-subject question bank",
        description:
          "Real questions from the general subjects shared across every exam — sorted, with full explanations.",
        items: [
          "Persian literature & Islamic studies",
          "Math, aptitude & computer skills",
          "English & general knowledge",
          "A full explanation for every question",
        ],
      },
      {
        title: "Review & mock exams",
        description:
          "Smart daily review and a timed test that feels like the real exam day.",
        items: [
          "Review questions until fully learned",
          "Timed mock exams",
          "Report card & weak spots",
          "Daily reminders",
        ],
      },
      {
        title: "Specialized subjects per exam",
        description:
          "Specialized questions for Education, banks, social security and executive-agency exams.",
        items: [
          "Executive agencies (Faragir)",
          "Education Ministry",
          "Banks",
          "Social Security",
        ],
      },
      {
        title: "More, the more you ask",
        description:
          "New exams and features, added based on what you need most.",
        items: [
          "More employment exams",
          "Questions from the latest years",
          "More detailed progress reports",
          "Whatever you ask for",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Get Started",
    titleLine1: "Ready to pass",
    titleLine2: "your exam?",
    subtitle:
      "Rono is ready to use right now. Start free, review a few questions, and see the difference for yourself. Got a question or an idea? We'd love to hear it.",
    partnerTypes: [
      {
        label: "Exam candidates",
        description: "Anyone getting themselves ready for an employment exam.",
      },
      {
        label: "Schools & tutors",
        description: "Teachers and academies who want to help their students.",
      },
      {
        label: "Content creators",
        description:
          "Anyone with quality questions or notes who wants to share them.",
      },
    ],
    ctaPrimary: "Start Free",
    ctaSecondary: "Learn More",
    statusLine:
      "Ready to use now · Free to start · Real questions from past exams",
  },
  footer: {
    tagline: "Employment-Exam Prep",
    problem: "The Challenge",
    solution: "How It Helps",
    howItWorks: "How It Works",
    roadmap: "What's Coming",
    contact: "Contact",
    copyright: "© 2026 Rono.",
    rights: "All rights reserved.",
  },
};

export type HomeDict = typeof en;

const fa: HomeDict = {
  nav: {
    problem: "چالش",
    solution: "چطور کمک می‌کنه",
    howItWorks: "چطور کار می‌کنه",
    roadmap: "مسیر پیش‌رو",
    getEarlyAccess: "رایگان شروع کن",
    accessWebApp: "ورود به برنامه",
    openMenu: "باز کردن منو",
    closeMenu: "بستن منو",
    home: "صفحه اصلی رونو",
  },
  hero: {
    eyebrow: "آمادگی آزمون استخدامی",
    titleLine1: "سؤال‌های اصلِ آزمون استخدامی.",
    titleLine2: "بخون، مرور کن، قبول شو.",
    subheadline:
      "همه‌ی سؤال‌های آزمون‌های استخدامیِ سال‌های قبل، یک‌جا و مرتب دسته‌بندی‌شده. رونو حواسش هست کدوم سؤال‌ها رو خوب بلدی و کدوم‌ها هنوز اذیتت می‌کنن، و همون‌ها رو درست سرِ وقت دوباره میاره جلوت تا تا روزِ آزمون چیزی از یادت نره.",
    ctaPrimary: "رایگان شروع کن",
    ctaSecondary: "ببین چطور کار می‌کنه",
    stats: {
      s1: { value: "اصل", label: "سؤال‌های واقعیِ سال‌های گذشته" },
      s2: { value: "4", label: "آزمون استخدامیِ پرمخاطب" },
      s3: { value: "رایگان", label: "همین حالا و بدونِ هزینه شروع کن" },
    },
    viz: {
      leftTitle: "سؤالِ مناسب",
      leftSub: "هم‌سطحِ خودت",
      rightTitle: "مرورِ به‌موقع",
      rightSub: "تا یادت نره",
      center: "برنامه‌ی تو",
    },
  },
  problem: {
    eyebrow: "چالش",
    title: "آماده‌شدن برای آزمون استخدامی سخت‌تر از چیزیه که باید باشه.",
    subtitle:
      "بیشترِ داوطلب‌ها کم‌استعداد نیستن؛ فقط زیرِ کوهی از منابعِ پخش‌وپلا و روشِ مطالعه‌ی اشتباه گیر افتادن. سه‌تا مشکل که همیشه سر و کله‌شون پیدا می‌شه:",
    cards: {
      generic: {
        title: "منابع این‌ور و اون‌ور پخشه",
        description:
          "سؤال‌ها و جزوه‌ها همه‌جا پخش‌ان. آدم نمی‌دونه از کجا شروع کنه و چی مهم‌تره، و کلی وقت فقط سرِ پیدا کردنِ یه منبعِ درست‌وحسابی هدر می‌ده.",
      },
      memorization: {
        title: "می‌خونی، یادت می‌ره",
        description:
          "چیزی که این هفته خوندی، چند هفته بعد دیگه یادت نیست. بدونِ یه برنامه‌ی مرورِ منظم، درست سرِ جلسه می‌بینی خیلی چیزها رو فراموش کردی.",
      },
      noAdaptation: {
        title: "نمی‌دونی کجای کاری",
        description:
          "هیچ نشونه‌ی روشنی نداری که بفهمی واقعاً چقدر آماده‌ای و رو کدوم درس‌ها ضعیف‌تری. همین هم استرس میاره، هم وقتت رو می‌بره سراغِ چیزهای اشتباه.",
      },
    },
    transition: "رونو ساخته شده تا دقیقاً همین سه‌تا رو حل کنه.",
  },
  solution: {
    eyebrow: "چطور کمک می‌کنه",
    title: "دو کارِ ساده که فرق رو می‌سازن.",
    subtitle:
      "رونو دو تا کارِ مهم رو برات انجام می‌ده، بی‌اینکه لازم باشه به هیچ‌کدومش فکر کنی.",
    irt: {
      algoLabel: "بخش اول",
      name: "سؤالِ هم‌سطحِ تو",
      question: "«اصلاً از کجا شروع کنم؟»",
      description:
        "رونو می‌فهمه چی رو خوب بلدی و کجا لنگ می‌زنی، بعد سؤال‌هایی بهت نشون می‌ده که نه اون‌قدر آسونن که خسته بشی، نه اون‌قدر سخت که جا بزنی — درست همون‌جایی که سریع‌تر از همیشه یاد می‌گیری.",
      points: [
        "سؤال‌ها هم‌اندازه‌ی سطحِ همین‌حالای تو",
        "وقتت می‌ره سراغِ چیزی که لازم داری، نه چیزی که بلدی",
        "هرچی جلوتر می‌ری، دقیق‌تر و سخت‌تر می‌شه",
      ],
    },
    fsrs: {
      algoLabel: "بخش دوم",
      name: "مرورِ درست سرِ وقت",
      question: "«کِی دوباره مرورش کنم؟»",
      description:
        "هر سؤالی رو که یاد می‌گیری، رونو یادش می‌مونه و درست قبل از اینکه فراموشش کنی دوباره میارش جلوت. سؤالِ سخت‌تر بیشتر تکرار می‌شه، چیزی که مسلط شدی کمتر — تا با کم‌ترین وقت، همه‌چی تا روزِ آزمون سرِ جاش بمونه.",
      points: [
        "سؤالِ سخت‌تر بیشتر تکرار می‌شه",
        "چیزی که بلدی وقتت رو نمی‌گیره",
        "درست قبل از فراموش‌شدن، یادآوری می‌شه",
      ],
    },
    orchestrator: {
      title: "تو فقط بخون، بقیه‌ش با ما",
      description:
        "لازم نیست برنامه بریزی یا حساب کنی چی رو کِی مرور کنی. رونو هر بار خودش تصمیم می‌گیره الان وقتِ یه سؤالِ تازه‌ست یا مرورِ چیزیه که قبلاً دیدی. تو فقط ادامه بده.",
    },
  },
  howItWorks: {
    eyebrow: "چطور کار می‌کنه",
    title: "سه قدمِ ساده.",
    subtitle: "از همون سؤالِ اول، رونو کنارته.",
    steps: [
      {
        title: "اول می‌بینه کجای کاری",
        description:
          "چند تا سؤال جواب می‌دی تا رونو بفهمه رو کدوم درس‌ها قوی‌ای و کجا باید بیشتر کار کنی — فقط چند دقیقه.",
        tag: "چند دقیقه‌ی اول",
      },
      {
        title: "سؤالِ مناسبت رو می‌گیری",
        description:
          "بعدش سؤال‌هایی بهت می‌رسه که درست اندازه‌ی سطحِ خودته؛ نه آسون که حوصله‌ت سر بره، نه سخت که زده بشی.",
        tag: "هم‌سطحِ تو",
      },
      {
        title: "سرِ وقت یادت می‌ندازیم",
        description:
          "هر چیزی که خوندی، درست قبل از اینکه یادت بره دوباره میاد بالا تا برای همیشه مالِ خودت بشه.",
        tag: "مرورِ به‌موقع",
      },
    ],
  },
  differentiators: {
    eyebrow: "چرا رونو",
    titleLine1: "سؤالِ اصل، نه ساختگی.",
    titleLine2: "روشی که واقعاً جواب می‌ده.",
    subtitle:
      "رونو دورِ یه ایده‌ی ساده ساخته شده: سؤال‌های واقعیِ آزمون‌ها رو اون‌قدر هوشمندانه مرور کن تا همه‌شون مالِ خودت بشن.",
    features: [
      {
        title: "سؤال‌های اصلِ آزمون",
        description:
          "سؤال‌ها از دفترچه‌های واقعیِ آزمون‌های سال‌های قبل‌ان، نه نمونه‌سؤالِ ساختگی. دقیقاً همون چیزی که سرِ جلسه باهاش روبه‌رو می‌شی.",
      },
      {
        title: "مرور تا یادگیریِ کامل",
        description:
          "فقط یک‌بار خوندن کافی نیست. رونو سؤال‌ها رو سرِ وقت برات تکرار می‌کنه تا تا روزِ آزمون چیزی از یادت نره.",
      },
      {
        title: "همه‌چی مرتب و دسته‌بندی‌شده",
        description:
          "سؤال‌ها بر اساسِ آزمون، درس و مبحث چیده شدن؛ راحت می‌ری سراغِ هر چیزی که می‌خوای.",
      },
      {
        title: "پاسخِ تشریحی",
        description:
          "هر سؤال جوابِ کامل و توضیحِ روشن داره؛ فقط نمی‌فهمی درست یا غلط، می‌فهمی چرا.",
      },
      {
        title: "آزمونِ آزمایشی",
        description:
          "هر وقت خواستی، یه آزمونِ زمان‌دار درست مثلِ روزِ امتحان بده و ببین دقیقاً کجا وایسادی.",
      },
      {
        title: "رو موبایل، هر جا",
        description:
          "تو صف، تو اتوبوس، هر وقت چند دقیقه وقت داشتی — گوشیت رو دربیار و چند تا سؤال مرور کن.",
      },
    ],
  },
  platforms: {
    eyebrow: "روی هر دستگاهی",
    title: "هر جا که هستی، آماده شو.",
    subtitle:
      "رونو رو همون‌جوری که واقعاً درس می‌خونی ساختیم — رو گوشی، تبلت یا کامپیوتر، با اینترنت یا بی‌اینترنت.",
    statusAvailable: "در دسترس",
    statusSoon: "به‌زودی",
    comingSoonSuffix: "به‌زودی",
    web: {
      name: "نسخه‌ی وب",
      tagline: "بدونِ نصب. باز کن و شروع کن.",
      description:
        "داشبوردِ کاملت تو هر مرورگری باز می‌شه. رو کامپیوتر یا تبلت شروع کن — همه‌چی هم‌زمان همگام می‌مونه.",
      cta: "ورود به برنامه",
      meta: "",
      storeNote: "",
    },
    android: {
      name: "اندروید",
      tagline: "برنامه‌ی بومی — همین حالا بگیر.",
      description:
        "نسخه‌ی اندرویدِ رونو با یادآورِ مرور و همگام‌سازیِ پیشرفت. فایلِ نصب رو مستقیم دانلود کن و امروز شروع کن.",
      cta: "دانلود برنامه",
      meta: "v1.0.0 · APK · 2.6 MB",
      storeNote: "Google Play",
    },
    ios: {
      name: "آیفون",
      tagline: "مثلِ یه برنامه نصبش کن.",
      description:
        "رونو رو از Safari به صفحه‌ی اصلیِ گوشیت اضافه کن تا تمام‌صفحه و مثلِ یه اپ باز شه — بدونِ نیاز به App Store.",
      cta: "افزودن به صفحه‌ی اصلی",
      meta: "",
      storeNote: "App Store",
    },
    syncNote:
      "هر جا وارد شی، پیشرفتت همونه. مرورها و کارنامه‌ت خودکار بینِ همه‌ی دستگاه‌هات همگام می‌شه.",
  },
  roadmap: {
    eyebrow: "مسیر پیش‌رو",
    title: "هر هفته کامل‌تر می‌شه.",
    subtitle:
      "رونو همین حالا کار می‌کنه و مدام آزمون‌ها و امکاناتِ بیشتری بهش اضافه می‌شه.",
    statusComplete: "آماده",
    statusActive: "در حالِ افزودن",
    statusUpcoming: "به‌زودی",
    phaseLabel: "مرحله",
    phases: [
      {
        title: "بانکِ سؤالِ دروسِ عمومی",
        description:
          "سؤال‌های اصلِ دروسِ عمومیِ مشترکِ همه‌ی آزمون‌ها، مرتب و با پاسخِ تشریحی.",
        items: [
          "ادبیات فارسی و معارف",
          "ریاضی، هوش و مهارت‌های کامپیوتر",
          "زبان انگلیسی و اطلاعاتِ عمومی",
          "پاسخِ تشریحی برای هر سؤال",
        ],
      },
      {
        title: "مرور و آزمونِ آزمایشی",
        description:
          "مرورِ هوشمندِ روزانه و آزمونِ زمان‌دار شبیهِ روزِ امتحان.",
        items: [
          "مرورِ سؤال‌ها تا یادگیریِ کامل",
          "آزمونِ آزمایشیِ زمان‌دار",
          "کارنامه و نقاطِ ضعف",
          "یادآورِ روزانه",
        ],
      },
      {
        title: "دروسِ تخصصیِ هر آزمون",
        description:
          "سؤال‌های تخصصیِ آموزش و پرورش، بانک‌ها، تأمین اجتماعی و دستگاه‌های اجرایی.",
        items: [
          "دستگاه‌های اجرایی (فراگیر)",
          "آموزش و پرورش",
          "بانک‌ها",
          "تأمین اجتماعی",
        ],
      },
      {
        title: "هرچی بیشتر، بهتر",
        description:
          "آزمون‌ها و امکاناتِ تازه که بر اساسِ نیازِ شما اضافه می‌شن.",
        items: [
          "آزمون‌های استخدامیِ بیشتر",
          "سؤال‌های سال‌های تازه‌تر",
          "گزارشِ پیشرفتِ دقیق‌تر",
          "هر چیزی که شما بخواید",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "همراهِ ما شو",
    titleLine1: "آماده‌ای برای",
    titleLine2: "قبولی در آزمون؟",
    subtitle:
      "رونو همین حالا آماده‌ی استفاده‌ست. رایگان شروع کن، چند تا سؤال مرور کن و خودت ببین چقدر فرق داره. اگه سؤالی داشتی یا نظری، خوشحال می‌شیم بشنویم.",
    partnerTypes: [
      {
        label: "داوطلبانِ آزمون",
        description: "هر کسی که داره خودش رو برای آزمون استخدامی آماده می‌کنه.",
      },
      {
        label: "آموزشگاه‌ها و مدرس‌ها",
        description: "مدرس‌ها و آموزشگاه‌هایی که می‌خوان به داوطلب‌هاشون کمک کنن.",
      },
      {
        label: "تولیدکنندگانِ محتوا",
        description:
          "هر کسی که سؤال یا جزوه‌ی باکیفیت داره و می‌خواد به اشتراک بذاره.",
      },
    ],
    ctaPrimary: "رایگان شروع کن",
    ctaSecondary: "بیشتر بدون",
    statusLine:
      "همین حالا آماده‌ی استفاده · شروعِ رایگان · سؤال‌های اصلِ آزمون‌های گذشته",
  },
  footer: {
    tagline: "آمادگی آزمون استخدامی",
    problem: "چالش",
    solution: "چطور کمک می‌کنه",
    howItWorks: "چطور کار می‌کنه",
    roadmap: "مسیر پیش‌رو",
    contact: "تماس",
    copyright: "© 2026 Rono.",
    rights: "تمامی حقوق محفوظه.",
  },
};

export const home = { en, fa };
