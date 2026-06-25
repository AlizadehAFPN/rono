// Profile page: identity, self-service profile edit, and a friendly view of
// the candidate's own progress (readiness level, mastery, review load).

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
      "Raising this gives you more to review over the next few days — increase it only if you can keep up.",
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
    title: "Your progress",
    description:
      "A clear, up-to-date look at how your exam prep is going. Everything here is yours to see.",
    empty:
      "You haven't answered any questions yet. Start a practice session and your readiness, mastery, and review schedule will appear here.",

    ability: {
      label: "Readiness",
      help: "How ready you are right now, on a simple scale where 0 is the average candidate. Rono updates it after every answer you give.",
      confidenceLabel: "Confidence",
      confidence: {
        building: "Still getting to know you",
        medium: "Firming up",
        high: "Well established",
      },
      // Plain-language reading of the readiness value.
      interpret: {
        building: "Building foundations",
        developing: "Developing",
        solid: "On track",
        advanced: "Advanced",
      },
      interpretHint: {
        building: "Below the average candidate — focus on the fundamentals.",
        developing: "Approaching the average candidate.",
        solid: "At or above the average candidate.",
        advanced: "Well above the average candidate.",
      },
    },

    stats: {
      answered: "Questions answered",
      correct: "Correct",
      accuracy: "Accuracy",
      reviewDue: "Reviews due",
      reviewDueHelp:
        "Questions Rono says are ready for you to review right now.",
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

const fa: DashProfileDict = {
  pageTitle: "پروفایل",

  identity: {
    memberSince: "عضو از",
    lastLogin: "آخرین ورود",
    never: "هرگز",
    institution: "مؤسسه",
    role: "نقش",
    emailVerified: "ایمیل تأیید شده",
    emailUnverified: "ایمیل تأیید نشده",
    accountActive: "فعال",
    accountInactive: "غیرفعال",
  },

  edit: {
    title: "اطلاعات شخصی",
    description: "در سراسر Rono به این شکل نمایش داده می‌شوید.",
    fullName: "نام کامل",
    fullNamePh: "Jane Doe",
    preferredName: "نام دلخواه",
    preferredNamePh: "Jane",
    preferredNameHint: "در نوار کناری و پیام‌های خوش‌آمدگویی نمایش داده می‌شود. اختیاری.",
    save: "ذخیره تغییرات",
    saving: "در حال ذخیره…",
    saved: "پروفایل به‌روزرسانی شد",
    saveFailed: "ذخیره پروفایل شما ممکن نشد",
    error: "خطا",
  },

  daily: {
    title: "هدف روزانه",
    description:
      "هدف مرور روزانه شما — هر بار که یک جلسه روزانه را آغاز می‌کنید اعمال می‌شود. هر زمان که بخواهید آن را تغییر دهید.",
    target: "تعداد سؤال در روز",
    questionsOpt: (n: number) => `${n}`,
    limit: "طول جلسه",
    byCount: "بر اساس تعداد سؤال",
    byTime: "بر اساس زمان",
    minutesOpt: (n: number) => `${n} دقیقه`,
    newCap: "سؤال‌های جدید در روز",
    newCapHint:
      "هر روز چند سؤال کاملاً جدید می‌توانید با آن‌ها آشنا شوید. مرور سؤال‌هایی که قبلاً دیده‌اید هرگز محدود نمی‌شود.",
    newCapWarning:
      "افزایش این مقدار طی چند روز آینده مرور بیشتری برایتان می‌آورد — تنها در صورتی آن را افزایش دهید که بتوانید همگام بمانید.",
    collectionsNote:
      "انتخاب کنید کدام مجموعه‌ها در صفحه مرور روزانه گنجانده شوند.",
    save: "ذخیره هدف",
    saving: "در حال ذخیره…",
    saved: "هدف روزانه به‌روزرسانی شد",
    saveFailed: "ذخیره هدف روزانه شما ممکن نشد",
  },

  avatar: {
    alt: "عکس پروفایل",
    upload: "بارگذاری عکس",
    change: "تغییر عکس",
    remove: "حذف عکس",
    uploading: "در حال بارگذاری…",
    removing: "در حال حذف…",
    hint: "JPEG، PNG، WebP یا GIF. حداکثر 5 مگابایت.",
    uploaded: "عکس به‌روزرسانی شد",
    removed: "عکس حذف شد",
    uploadFailed: "بارگذاری عکس شما ممکن نشد",
    removeFailed: "حذف عکس شما ممکن نشد",
    tooLarge: "تصویر بیش از حد بزرگ است. حداکثر اندازه 5 مگابایت است.",
    badType: "قالب پشتیبانی‌نشده. از JPEG، PNG، WebP یا GIF استفاده کنید.",
  },

  state: {
    title: "پیشرفت شما",
    description:
      "نمایی روشن و به‌روز از اینکه آماده‌سازی‌ات برای آزمون چطور پیش می‌رود. همه چیز اینجا پیش چشم خودت است.",
    empty:
      "هنوز به هیچ سؤالی پاسخ نداده‌ای. یک جلسه تمرین را آغاز کن تا میزان آمادگی، تسلط و برنامه مرورت اینجا نمایش داده شود.",

    ability: {
      label: "میزان آمادگی",
      help: "اینکه همین حالا چقدر آماده‌ای، روی مقیاسی ساده که در آن 0 نشان‌دهنده داوطلب متوسط است. رونو بعد از هر پاسخی که می‌دهی آن را به‌روز می‌کند.",
      confidenceLabel: "اطمینان",
      confidence: {
        building: "هنوز در حال شناخت تو",
        medium: "در حال تثبیت",
        high: "کاملاً تثبیت‌شده",
      },
      // Plain-language reading of the readiness value.
      interpret: {
        building: "در حال ساختن پایه‌ها",
        developing: "در حال پیشرفت",
        solid: "در مسیر درست",
        advanced: "پیشرفته",
      },
      interpretHint: {
        building: "پایین‌تر از داوطلب متوسط — روی اصول پایه تمرکز کن.",
        developing: "در حال نزدیک شدن به داوطلب متوسط.",
        solid: "در سطح داوطلب متوسط یا بالاتر.",
        advanced: "بسیار بالاتر از داوطلب متوسط.",
      },
    },

    stats: {
      answered: "سؤال‌های پاسخ‌داده‌شده",
      correct: "درست",
      accuracy: "دقت",
      reviewDue: "مرورهای سررسیدشده",
      reviewDueHelp:
        "سؤال‌هایی که رونو می‌گوید همین حالا برای مرور آماده‌اند.",
      newAvailable: "جدید در دسترس",
    },

    mastery: {
      title: "تسلط بر اساس مبحث",
      description: "جایگاه هر مبحث در مسیر تسلط.",
      empty: "هنوز داده‌ای برای مباحث وجود ندارد.",
      questions: "سؤال",
      distributionTitle: "توزیع تسلط",
    },

    sessions: {
      title: "جلسه‌های اخیر",
      empty: "هنوز جلسه‌ای وجود ندارد.",
      net: "خالص",
    },
  },
};

export const dashProfile = { en, fa };
