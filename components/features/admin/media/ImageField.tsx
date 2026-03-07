"use client";

import { ImageFieldProvider } from "./image-field/ImageFieldProvider";
import { ImageFieldSourceActions } from "./image-field/ImageFieldSourceActions";
import { ImageFieldPreview } from "./image-field/ImageFieldPreview";
import { ImageFieldAltText } from "./image-field/ImageFieldAltText";

export const ImageField = {
  Provider: ImageFieldProvider,
  SourceActions: ImageFieldSourceActions,
  Preview: ImageFieldPreview,
  AltText: ImageFieldAltText,
};
