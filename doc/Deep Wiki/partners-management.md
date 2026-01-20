# Partners Management

<https://deepwiki.com/YanBerdin/rougecardinalcompany/8.2.2-partners-management>

## Purpose and Scope

This document describes the Partners Management system in the Rouge Cardinal Company application. Partners Management provides complete CRUD (Create, Read, Update, Delete) functionality for managing partner organizations that are displayed on the public homepage. The system includes logo management via the Media Library, drag-and-drop reordering, and integration with the admin dashboard statistics.

For general Media Library usage, see 8.1. For homepage content management patterns, see 8.2.1. For public-facing display toggles that control partner visibility, see 8.3.

## System Architecture

Partners Management follows the Clean Architecture pattern with strict separation between database, DAL, Server Actions, and UI layers. The system was implemented as TASK023 and completed on 2026-01-19.

> **High-Level Data Flow**

```mermaid
flowchart LR
    %% Sections principales
    subgraph AdminBackoffice ["Admin Backoffice"]
        A1["New Partner Page\napp/(admin)/admin/partner"]
        A2["Edit Partner Page\napp/(admin)/admin/partner"]
        A3["Partners List Page\napp/(admin)/admin/partners"]
        A4["Server Actions\napp/(admin)/admin/partner"]
    end

    subgraph PublicSite ["Public Site"]
        P1["Homepage"]
        P2["Partner selection\ncomponents/partners/public/cta/Partner"]
    end

    subgraph BusinessLogic ["Business Logic"]
        B1["admin-partners.ts\nCRUD + resolver functions"]
        B2["forms-partners.ts\nfields/validation/transform"]
    end

    subgraph Database ["Database"]
        D1["partners table\nname, logo_url, storage_path,\ndisplay_order, is_active"]
        D2["storage: path FK"]
        D3["media table\nstorage_path (text), hash,\nfolder_id (partners)"]
        D4["folders table\nid PK"]
        D5["media_folders table\nslug: partners"]
    end

    %% Flows front -> business logic
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1

    P1 --> P2
    P2 --> B2

    %% Business logic -> DB
    B1 --> D1
    B1 --> D2
    B2 --> D1

    %% DB relations
    D2 --> D3
    D3 --> D4
    D4 --> D5

  ```
  