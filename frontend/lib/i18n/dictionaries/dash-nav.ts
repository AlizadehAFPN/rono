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
    questions: "Questions",
    study: "Study",
    daily: "Daily Review",
    practice: "Exam",
    progress: "Progress",
    analytics: "Analytics",
    users: "Users",
    settings: "Settings",
    profile: "Profile",
  },
};

export type DashNavDict = typeof en;

const tr: DashNavDict = {
  adminBadge: "Yönetici",
  workspace: "Çalışma Alanı",
  administration: "Yönetim",
  account: "Hesap",
  signOut: "Çıkış yap",
  openMenu: "Menüyü aç",
  back: "Geri",
  profile: "Profil",
  navigation: "Gezinme",
  installApp: "Uygulamayı yükle",
  items: {
    overview: "Panel",
    topics: "Konular",
    questions: "Sorular",
    study: "Çalış",
    daily: "Günlük Tekrar",
    practice: "Sınav",
    progress: "İlerleme",
    analytics: "Analitik",
    users: "Kullanıcılar",
    settings: "Ayarlar",
    profile: "Profil",
  },
};

export const dashNav = { en, tr };
