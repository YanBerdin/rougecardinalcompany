"use client";

import { createContext, use } from "react";
import type { UseFormReturn, FieldValues, Path, FieldError } from "react-hook-form";
import type { MediaSelectResult } from "../types";

type ErasedForm = UseFormReturn<FieldValues>;

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
    form: ErasedForm;
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

type TypedImageFieldContextValue<TForm extends FieldValues> = ImageFieldContextValue & {
    meta: ImageFieldMeta & { form: UseFormReturn<TForm>; imageUrlField: Path<TForm>; altTextField: Path<TForm> | undefined };
};

export function useImageFieldContext<TForm extends FieldValues = FieldValues>(): TypedImageFieldContextValue<TForm> {
    const ctx = use(ImageFieldContext);
    if (!ctx) throw new Error("useImageFieldContext must be used within an ImageFieldProvider");
    // Context erases the form generic; ImageFieldProvider guarantees field paths belong to TForm.
    return ctx as unknown as TypedImageFieldContextValue<TForm>;
}
