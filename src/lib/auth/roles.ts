import type { UserRole } from "@prisma/client";

export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case "BUYER":
      return "/buyer";
    case "SELLER":
      return "/seller/assets";
    case "MANAGER":
      return "/admin/users";
  }
}
