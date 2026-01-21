import type {
    PressReleaseDTO,
    PressReleaseFormValues,
    SelectOptionDTO,
} from "@/lib/schemas/press-release";
import type {
    ArticleDTO,
    ArticleFormValues,
} from "@/lib/schemas/press-article";
import type {
    PressContactDTO,
    PressContactFormValues,
} from "@/lib/schemas/press-contact";

// Press Releases
export interface PressReleasesViewProps {
    initialReleases: Array<Omit<PressReleaseDTO, "id" | "spectacle_id" | "evenement_id"> & {
        id: string;
        spectacle_id: string | null;
        evenement_id: string | null;
    }>;
}

export interface PressReleaseFormProps {
    release?: PressReleaseDTO | null;
    spectacles?: SelectOptionDTO[];
    evenements?: SelectOptionDTO[];
}

// Articles
export interface ArticlesViewProps {
    initialArticles: Array<Omit<ArticleDTO, "id"> & {
        id: string;
    }>;
}

export interface ArticleFormProps {
    article?: ArticleDTO | null;
}

// Press Contacts
export interface PressContactsViewProps {
    initialContacts: Array<Omit<PressContactDTO, "id"> & {
        id: string;
    }>;
}

export interface PressContactFormProps {
    contact?: PressContactDTO | null;
}
