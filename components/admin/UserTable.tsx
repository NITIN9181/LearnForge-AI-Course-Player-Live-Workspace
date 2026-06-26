"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: { enrollments: number };
};

type UserTableProps = {
  users: User[];
};

export function UserTable({ users }: UserTableProps) {
  const [localUsers, setLocalUsers] = useState(users);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  async function handleRoleChange(user: User, role: string) {
    setConfirmUser(user);
    setNewRole(role);
  }

  async function confirmRoleChange() {
    if (!confirmUser) return;

    try {
      const res = await fetch(`/api/users/${confirmUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) return;

      setLocalUsers((prev) =>
        prev.map((u) => (u.id === confirmUser.id ? { ...u, role: newRole } : u)),
      );
    } finally {
      setConfirmUser(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-forge-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-forge-border bg-forge-void/50">
              <th className="px-4 py-3 text-left text-label text-forge-muted">Name</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Email</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Role</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Enrolled</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Created</th>
            </tr>
          </thead>
          <tbody>
            {localUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-forge-border last:border-0 hover:bg-forge-void/30"
              >
                <td className="px-4 py-3 text-body-m text-forge-text">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-body-s text-forge-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className="rounded bg-forge-void border border-forge-border px-2 py-1 text-body-s text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-violet"
                  >
                    <option value="LEARNER">Learner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-body-s text-forge-muted">
                  {user._count.enrollments}
                </td>
                <td className="px-4 py-3 text-body-s text-forge-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!confirmUser} onOpenChange={() => setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user role</DialogTitle>
            <DialogDescription>
              Are you sure you want to change{" "}
              <strong>{confirmUser?.name ?? confirmUser?.email}</strong>
              &apos;s role from <strong>{confirmUser?.role}</strong> to <strong>{newRole}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              className="bg-forge-violet text-white hover:bg-forge-violet/90"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
