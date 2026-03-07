"use client";

import { createContext, use } from "react";
import type { UseFormReturn, FieldValues, Path, FieldError } from "react-hook-form";
import type { MediaSelectResult } from "../types";

type AnyForm = UseFormReturn<any>;

export type ImageFieldState = {
    imageUrl: string | undefined;
    altText: string | undefined;
    isValidating: boolean;
    isMediaPickerOpen: boolean;
    isUploadOpen: boolean;
    validationError: string | null;
    validationSuccess: string | null;
    imageError: FieldError | undefined;
};

export type ImageFieldActions = {
    handleUrlChange: (url: string) => void;
    handleClearUrl: () => void;
    handleMediaSelect: (result: MediaSelectResult) => void;
    handleUploadSelect: (result: MediaSelectResult) => void;
    setIsMediaPickerOpen: (open: boolean) => void;
    setIsUploadOpen: (open: boolean) => void;
};

export type ImageFieldMeta = {
    form: AnyForm;
    imageUrlField: string;
    altTextField: string | undefined;
    altTextLabel: string;
    label: string;
    required: boolean;
    uploadFolder: string;
    description: string | undefined;
};

export type ImageFieldContextValue = {
    state: ImageFieldState;
    actions: ImageFieldActions;
    meta: ImageFieldMeta;
};

export const ImageFieldContext = createContext<ImageFieldContextValue | null>(null);

export function useImageFieldContext<TForm extends FieldValues = FieldValues>(): ImageFieldContextValue & {
    meta: ImageFieldMeta & { form: UseFormReturn<TForm>; imageUrlField: Path<TForm>; altTextField: Path<TForm> | undefined };
} {
    const ctx = use(ImageFieldContext);
    if (!ctx) throw new Error("useImageFieldContext must be used within an ImageFieldProvider");
    return ctx as any;
}
