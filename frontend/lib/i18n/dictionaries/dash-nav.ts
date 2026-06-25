// Dashboard navigation chrome: sidebar, topbar, and mobile bottom nav.

const en = {
  adminBadge: "Admin",
  workspace: "Workspace",
  administration: "Administration",
  account: "Account",
  signOut: "Sign out",
  openMenu: "Open menu",
  back: "Back",
  profile: "Profile",
  navigation: "Navigation",
  installApp: "Install app",
  items: {
    overview: "Dashboard",
    topics: "Topics",
    questions: "Question Bank",
    study: "Review",
    daily: "Daily Review",
    practice: "Mock Exam",
    progress: "My Readiness",
    analytics: "Report Card",
    users: "Users",
    settings: "Settings",
    profile: "Profile",
  },
};

export type DashNavDict = typeof en;

const fa: DashNavDict = {
  adminBadge: "مدیر",
  workspace: "فضای کاری",
  administration: "مدیریت",
  account: "حساب کاربری",
  signOut: "خروج",
  openMenu: "باز کردن منو",
  back: "بازگشت",
  profile: "پروفایل",
  navigation: "ناوبری",
  installApp: "نصب برنامه",
  items: {
    overview: "داشبورد",
    topics: "مباحث",
    questions: "بانک سؤال",
    study: "مرور",
    daily: "مرور روزانه",
    practice: "آزمون آزمایشی",
    progress: "آمادگی من",
    analytics: "کارنامه",
    users: "کاربران",
    settings: "تنظیمات",
    profile: "پروفایل",
  },
};

export const dashNav = { en, fa };
