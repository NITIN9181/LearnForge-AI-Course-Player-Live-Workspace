import { prisma } from "@/lib/db";
import { UserTable } from "@/components/admin/UserTable";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-heading-1 text-forge-text">Users</h1>
        <p className="text-body-m text-forge-muted mt-1">
          {users.length} user{users.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <UserTable
        users={users.map((u) => ({
          ...u,
          email: u.email ?? "",
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
