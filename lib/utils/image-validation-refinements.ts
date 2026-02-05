import { z } from "zod";
import { imageUrlRefinement, imageUrlRefinementError } from "./image-validation-server";

/**
 * Helper function to add image URL validation to a Zod string schema.
 * Chains the refinement after .url() validation.
 *
 * Usage:
 *   image_url: addImageUrlValidation(z.string().url())
 *   image_url: addImageUrlValidation(z.string().url().optional())
 *
 * Note: The returned schema has async refinements, so .parse() will be async.
 * Uses superRefine for detailed error messages (SSRF, format, network errors).
 */
export function addImageUrlValidation<TSchema extends z.ZodString>(
  schema: TSchema
) {
  return schema.superRefine(async (val: string | undefined | null, ctx: z.RefinementCtx) => {
    const isValid = await imageUrlRefinement(val);
    if (!isValid) {
      const error = await imageUrlRefinementError(val);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error.message,
      });
    }
  });
}
