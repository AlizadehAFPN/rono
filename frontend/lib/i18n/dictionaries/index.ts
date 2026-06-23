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

// Each namespace owns its own file and enforces TR↔EN key parity internally.
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
  tr: {
    common: common.tr,
    home: home.tr,
    auth: auth.tr,
    dashNav: dashNav.tr,
    dashOverview: dashOverview.tr,
    dashTopics: dashTopics.tr,
    dashItems: dashItems.tr,
    dashAnalytics: dashAnalytics.tr,
    dashItemEditor: dashItemEditor.tr,
    dashHome: dashHome.tr,
    dashPractice: dashPractice.tr,
    dashStudy: dashStudy.tr,
    dashProgress: dashProgress.tr,
    dashUsers: dashUsers.tr,
    dashSettings: dashSettings.tr,
    dashProfile: dashProfile.tr,
    dashSessions: dashSessions.tr,
    pwa: pwa.tr,
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)["en"];
