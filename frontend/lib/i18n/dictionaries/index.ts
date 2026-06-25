import { common } from "./common";
import { home } from "./home";
import { auth } from "./auth";
import { dashNav } from "./dash-nav";
import { dashOverview } from "./dash-overview";
import { dashTopics } from "./dash-topics";
import { dashItems } from "./dash-items";
import { dashAnalytics } from "./dash-analytics";
import { dashItemEditor } from "./dash-item-editor";
import { dashHome } from "./dash-home";
import { dashPractice } from "./dash-practice";
import { dashStudy } from "./dash-study";
import { dashProgress } from "./dash-progress";
import { dashUsers } from "./dash-users";
import { dashSettings } from "./dash-settings";
import { dashProfile } from "./dash-profile";
import { dashSessions } from "./dash-sessions";
import { pwa } from "./pwa";
import type { Locale } from "../config";

// Each namespace owns its own file and enforces FA↔EN key parity internally.
// Composing them here gives a single typed dictionary per locale.
export const dictionaries = {
  en: {
    common: common.en,
    home: home.en,
    auth: auth.en,
    dashNav: dashNav.en,
    dashOverview: dashOverview.en,
    dashTopics: dashTopics.en,
    dashItems: dashItems.en,
    dashAnalytics: dashAnalytics.en,
    dashItemEditor: dashItemEditor.en,
    dashHome: dashHome.en,
    dashPractice: dashPractice.en,
    dashStudy: dashStudy.en,
    dashProgress: dashProgress.en,
    dashUsers: dashUsers.en,
    dashSettings: dashSettings.en,
    dashProfile: dashProfile.en,
    dashSessions: dashSessions.en,
    pwa: pwa.en,
  },
  fa: {
    common: common.fa,
    home: home.fa,
    auth: auth.fa,
    dashNav: dashNav.fa,
    dashOverview: dashOverview.fa,
    dashTopics: dashTopics.fa,
    dashItems: dashItems.fa,
    dashAnalytics: dashAnalytics.fa,
    dashItemEditor: dashItemEditor.fa,
    dashHome: dashHome.fa,
    dashPractice: dashPractice.fa,
    dashStudy: dashStudy.fa,
    dashProgress: dashProgress.fa,
    dashUsers: dashUsers.fa,
    dashSettings: dashSettings.fa,
    dashProfile: dashProfile.fa,
    dashSessions: dashSessions.fa,
    pwa: pwa.fa,
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)["en"];
