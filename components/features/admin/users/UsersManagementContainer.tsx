import { listAllUsers } from "@/lib/dal/admin-users";
import { UsersManagementView } from "./UsersManagementView";

export async function UsersManagementContainer() {
  const users = await listAllUsers();

  return <UsersManagementView users={users} />;
}
