"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SpectacleFormValues } from "@/lib/forms/spectacle-form-helpers";
import { normalizeGenre } from "@/lib/forms/spectacle-form-helpers";
import type { SpectacleFormMetadataProps } from "./types";

export function SpectacleFormMetadata({
    form,
    isPublic,
    existingGenres = [],
}: SpectacleFormMetadataProps) {
    const [isCreatingNewGenre, setIsCreatingNewGenre] = useState(false);
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

    return (
        <>
            {/* Status and Genre row */}
            <div className="grid grid-cols-2 gap-4 items-start">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Statut{" "}
                                {isPublic && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="draft">Brouillon</SelectItem>
                                    <SelectItem value="published">Actuellement</SelectItem>
                                    <SelectItem value="archived">Archive</SelectItem>
                                </SelectContent>
                            </Select>
                            {isPublic && field.value === "draft" && (
                                <FormDescription className="text-destructive">
                                    Un spectacle public ne peut pas être en brouillon
                                </FormDescription>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Genre{" "}
                                {isPublic && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                                {isCreatingNewGenre ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nouveau genre de spectacle..."
                                            value={field.value}
                                            onChange={(e) => {
                                                const normalized = normalizeGenre(e.target.value);
                                                field.onChange(normalized);
                                            }}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setIsCreatingNewGenre(false);
                                                if (!field.value?.trim()) {
                                                    field.onChange("");
                                                }
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                ) : (
                                    <DropdownMenu
                                        open={genreDropdownOpen}
                                        onOpenChange={setGenreDropdownOpen}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={genreDropdownOpen}
                                                className="w-full justify-between"
                                            >
                                                {field.value || "Sélectionner un genre..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full min-w-[200px] p-0">
                                            {existingGenres.map((genre) => (
                                                <DropdownMenuItem
                                                    key={genre}
                                                    onClick={() => {
                                                        field.onChange(genre);
                                                        setGenreDropdownOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${field.value === genre
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    {genre}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    field.onChange("");
                                                    setIsCreatingNewGenre(true);
                                                    setGenreDropdownOpen(false);
                                                }}
                                                className="border-t"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Créer un nouveau genre
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Duration and Casting row */}
            <div className="grid grid-cols-2 gap-4 items-start">
                <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Durée (minutes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="90"
                                    value={typeof field.value === "number" ? field.value : ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseInt(e.target.value) : ""
                                        )
                                    }
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="casting"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre d&apos;interprètes</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="5"
                                    value={typeof field.value === "number" ? field.value : ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseInt(e.target.value) : ""
                                        )
                                    }
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Premiere Date */}
            <FormField
                control={form.control}
                name="premiere"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Date de première{" "}
                            {isPublic && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Public Checkbox */}
            <FormField
                control={form.control}
                name="public"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Visible publiquement</FormLabel>
                            <FormDescription>
                                {field.value
                                    ? "⚠️ Ce spectacle sera affiché sur le site public. Une image validée est obligatoire."
                                    : "Ce spectacle sera affiché sur le site public (nécessite les champs marqués *)"}
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </>
    );
}
