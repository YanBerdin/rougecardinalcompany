import { fetchAllPressContacts } from "@/lib/dal/admin-press-contacts";
import { PressContactsView } from "./PressContactsView";

export async function PressContactsContainer() {
    const result = await fetchAllPressContacts();

    if (!result.success) {
        return (
            <div className="text-red-600">
                Erreur lors du chargement : {result.error}
            </div>
        );
    }

    // Convert bigint to string for client components
    const contactsForClient = result.data.map((contact) => ({
        ...contact,
        id: String(contact.id),
    }));

    return <PressContactsView initialContacts={contactsForClient} />;
}
