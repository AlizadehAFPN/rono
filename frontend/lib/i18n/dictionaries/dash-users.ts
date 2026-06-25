// Dashboard Users page: institution member management.

const en = {
  title: "Users",
  heading: "User Management",
  description: "Invite institution members, assign roles, and manage access.",
  add: "Add user",
  table: {
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    joined: "Joined",
    empty: "No users yet.",
  },
  roles: {
    student: "Student",
    content_author: "Content author",
    instructor: "Instructor",
    coordinator: "Coordinator",
    institution_admin: "Admin",
    system_admin: "System admin",
  },
  statuses: {
    active: "Active",
    suspended: "Suspended",
  },
  create: {
    title: "Add user",
    emailLabel: "Email",
    emailPh: "name@example.com",
    nameLabel: "Full name",
    namePh: "Jane Doe",
    passwordLabel: "Temporary password",
    passwordPh: "At least 8 characters",
    roleLabel: "Role",
    submit: "Create user",
    submitting: "Creating…",
    cancel: "Cancel",
  },
  edit: {
    roleLabel: "Role",
    statusLabel: "Status",
    save: "Save",
    saving: "Saving…",
  },
  toast: {
    created: "User created",
    createFailed: "Failed to create user",
    updated: "User updated",
    updateFailed: "Failed to update user",
    error: "Error",
  },
};

export type DashUsersDict = typeof en;

const fa: DashUsersDict = {
  title: "کاربران",
  heading: "مدیریت کاربران",
  description: "اعضای مؤسسه را دعوت کنید، نقش‌ها را اختصاص دهید و دسترسی‌ها را مدیریت کنید.",
  add: "افزودن کاربر",
  table: {
    name: "نام",
    email: "ایمیل",
    role: "نقش",
    status: "وضعیت",
    joined: "تاریخ عضویت",
    empty: "هنوز کاربری نیست.",
  },
  roles: {
    student: "دانشجو",
    content_author: "نویسنده محتوا",
    instructor: "مدرس",
    coordinator: "هماهنگ‌کننده",
    institution_admin: "مدیر",
    system_admin: "مدیر سیستم",
  },
  statuses: {
    active: "فعال",
    suspended: "معلق",
  },
  create: {
    title: "افزودن کاربر",
    emailLabel: "ایمیل",
    emailPh: "name@example.com",
    nameLabel: "نام کامل",
    namePh: "علی رضایی",
    passwordLabel: "گذرواژه موقت",
    passwordPh: "حداقل 8 نویسه",
    roleLabel: "نقش",
    submit: "ایجاد کاربر",
    submitting: "در حال ایجاد…",
    cancel: "انصراف",
  },
  edit: {
    roleLabel: "نقش",
    statusLabel: "وضعیت",
    save: "ذخیره",
    saving: "در حال ذخیره…",
  },
  toast: {
    created: "کاربر ایجاد شد",
    createFailed: "ایجاد کاربر ناموفق بود",
    updated: "کاربر به‌روزرسانی شد",
    updateFailed: "به‌روزرسانی کاربر ناموفق بود",
    error: "خطا",
  },
};

export const dashUsers = { en, fa };
