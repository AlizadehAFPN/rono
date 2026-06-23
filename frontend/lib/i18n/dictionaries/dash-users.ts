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
    emailPh: "person@kurum.edu.tr",
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

const tr: DashUsersDict = {
  title: "Kullanıcılar",
  heading: "Kullanıcı Yönetimi",
  description: "Kurum üyelerini davet edin, roller atayın ve erişimi yönetin.",
  add: "Kullanıcı ekle",
  table: {
    name: "Ad",
    email: "E-posta",
    role: "Rol",
    status: "Durum",
    joined: "Katılım",
    empty: "Henüz kullanıcı yok.",
  },
  roles: {
    student: "Öğrenci",
    content_author: "İçerik yazarı",
    instructor: "Eğitmen",
    coordinator: "Koordinatör",
    institution_admin: "Yönetici",
    system_admin: "Sistem yöneticisi",
  },
  statuses: {
    active: "Aktif",
    suspended: "Askıya alınmış",
  },
  create: {
    title: "Kullanıcı ekle",
    emailLabel: "E-posta",
    emailPh: "kisi@kurum.edu.tr",
    nameLabel: "Ad soyad",
    namePh: "Ayşe Yılmaz",
    passwordLabel: "Geçici parola",
    passwordPh: "En az 8 karakter",
    roleLabel: "Rol",
    submit: "Kullanıcı oluştur",
    submitting: "Oluşturuluyor…",
    cancel: "İptal",
  },
  edit: {
    roleLabel: "Rol",
    statusLabel: "Durum",
    save: "Kaydet",
    saving: "Kaydediliyor…",
  },
  toast: {
    created: "Kullanıcı oluşturuldu",
    createFailed: "Kullanıcı oluşturulamadı",
    updated: "Kullanıcı güncellendi",
    updateFailed: "Kullanıcı güncellenemedi",
    error: "Hata",
  },
};

export const dashUsers = { en, tr };
