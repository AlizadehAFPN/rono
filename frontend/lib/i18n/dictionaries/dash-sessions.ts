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

const tr: DashSessionsDict = {
  recent: {
    pageTitle: "Son oturumlar",
    subtitle: "Geçmiş çalışma ve tekrar oturumların.",
    empty: "Henüz oturum yok — geçmişini görmek için bir alıştırma oturumu yap.",
    net: "Net",
    entryTitle: "Son oturumlar",
    entrySubtitle: "Geçmiş çalışma oturumlarını gör",
  },
  active: {
    pageTitle: "Aktif oturumlar",
    entryTitle: "Aktif oturumlar",
    entrySubtitle: "Hesabında oturum açmış cihazları yönet",
  },
};

export const dashSessions = { en, tr };
