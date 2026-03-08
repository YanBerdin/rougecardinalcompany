import { listAllUsers } from "@/lib/dal/admin-users";
import { UsersManagementView } from "./UsersManagementView";

export async function UsersManagementContainer() {
  const result = await listAllUsers();

  if (!result.success) {
    return (
      <div className="text-center text-destructive py-8" role="alert">
        Erreur lors du chargement des utilisateurs : {result.error}
      </div>
    );
  }

  return <UsersManagementView users={result.data} />;
}
