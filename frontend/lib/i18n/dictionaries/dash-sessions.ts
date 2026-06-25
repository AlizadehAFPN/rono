// Dedicated session screens: recent learning sessions and active devices.
// Entry-row copy (shown on progress / profile / settings) lives here too so
// all session-related strings sit in one namespace.

const en = {
  recent: {
    pageTitle: "Recent sessions",
    subtitle: "Your past study and review sessions.",
    empty: "No sessions yet — take a practice session to see your history.",
    net: "Net",
    // Entry row rendered on Progress and Profile.
    entryTitle: "Recent sessions",
    entrySubtitle: "Review your past study sessions",
  },
  active: {
    pageTitle: "Active sessions",
    // Entry row rendered in Settings.
    entryTitle: "Active sessions",
    entrySubtitle: "Manage devices signed in to your account",
  },
};

export type DashSessionsDict = typeof en;

const fa: DashSessionsDict = {
  recent: {
    pageTitle: "جلسات اخیر",
    subtitle: "جلسات مطالعه و مرور گذشته شما.",
    empty: "هنوز جلسه‌ای نیست — برای دیدن سابقه خود یک جلسه تمرین انجام دهید.",
    net: "خالص",
    entryTitle: "جلسات اخیر",
    entrySubtitle: "جلسات مطالعه گذشته خود را مرور کنید",
  },
  active: {
    pageTitle: "جلسات فعال",
    entryTitle: "جلسات فعال",
    entrySubtitle: "دستگاه‌های وارد شده به حساب کاربری خود را مدیریت کنید",
  },
};

export const dashSessions = { en, fa };
