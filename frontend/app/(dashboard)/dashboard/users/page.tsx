"use client";

import { useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { useCreateUser, useUpdateUser, useUsers } from "@/lib/hooks/use-users";
import { MANAGEABLE_ROLES } from "@/lib/types/users";
import { useAuthStore } from "@/lib/stores/auth";
import { roleGte } from "@/lib/types/auth";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";

export default function UsersPage() {
  const { t } = useI18n();
  const u = t.dashUsers;
  const role = useAuthStore((s) => s.role);
  const isAdmin = roleGte(role ?? "", "institution_admin");

  const { data, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("student");

  const roleLabel = (r: string) => u.roles[r as keyof typeof u.roles] ?? r;

  async function onCreate() {
    try {
      await createUser.mutateAsync({
        email,
        full_name: name || null,
        password,
        role: newRole,
      });
      toast({ title: u.toast.created });
      setOpen(false);
      setEmail("");
      setName("");
      setPassword("");
      setNewRole("student");
    } catch (err) {
      toast({
        title: u.toast.error,
        description:
          err instanceof ApiError ? String(err.detail) : u.toast.createFailed,
        variant: "destructive",
      });
    }
  }

  async function patch(id: string, body: { role?: string; status?: string }) {
    try {
      await updateUser.mutateAsync({ id, data: body });
      toast({ title: u.toast.updated });
    } catch (err) {
      toast({
        title: u.toast.error,
        description:
          err instanceof ApiError ? String(err.detail) : u.toast.updateFailed,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar title={u.title} />
      <div className="mx-auto w-full max-w-4xl space-y-5 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{u.heading}</h2>
            <p className="text-sm text-muted-foreground">{u.description}</p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="size-4" /> {u.add}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{u.create.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Field label={u.create.emailLabel}>
                    <Input
                      type="email"
                      placeholder={u.create.emailPh}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field label={u.create.nameLabel}>
                    <Input
                      placeholder={u.create.namePh}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field label={u.create.passwordLabel}>
                    <Input
                      type="text"
                      placeholder={u.create.passwordPh}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field label={u.create.roleLabel}>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MANAGEABLE_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {roleLabel(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      {u.create.cancel}
                    </Button>
                    <Button
                      onClick={onCreate}
                      disabled={
                        createUser.isPending || !email || password.length < 8
                      }
                    >
                      {createUser.isPending
                        ? u.create.submitting
                        : u.create.submit}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{u.table.name}</TableHead>
                <TableHead>{u.table.email}</TableHead>
                <TableHead>{u.table.role}</TableHead>
                <TableHead>{u.table.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    …
                  </TableCell>
                </TableRow>
              )}
              {data && data.users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {u.table.empty}
                  </TableCell>
                </TableRow>
              )}
              {data?.users.map((usr) => (
                <TableRow key={usr.id}>
                  <TableCell className="font-medium">
                    {usr.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {usr.email}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select
                        value={usr.role}
                        onValueChange={(v) => patch(usr.id, { role: v })}
                      >
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MANAGEABLE_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {roleLabel(r)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{roleLabel(usr.role)}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select
                        value={usr.status}
                        onValueChange={(v) => patch(usr.id, { status: v })}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            {u.statuses.active}
                          </SelectItem>
                          <SelectItem value="suspended">
                            {u.statuses.suspended}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          usr.status === "active" ? "default" : "secondary"
                        }
                      >
                        {u.statuses[usr.status as keyof typeof u.statuses] ??
                          usr.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
