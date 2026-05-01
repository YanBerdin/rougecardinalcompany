"use client";

import Image from "next/image";
import type { ReactElement } from "react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMember } from "@/lib/schemas/compagnie";
import { ANIMATION_DELAY_STEP, FALLBACK_MEMBER_IMAGE } from "../constants";

interface TeamMemberCardProps {
    member: TeamMember;
    index: number;
}

export function TeamMemberCard({ member, index }: TeamMemberCardProps): ReactElement {
    const [open, setOpen] = useState(false);
    const hasDescription = Boolean(member.description);

    return (
        <>
            <div
                className="flex flex-col items-center text-center animate-fade-in-up group w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(25%-1.5rem)] xl:w-[calc(19%-1.5rem)]"
                style={{ animationDelay: `${index * ANIMATION_DELAY_STEP}s` }}
            >
                {/* Photo — cliquable si description */}
                {hasDescription ? (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-haspopup="dialog"
                        aria-label={`Voir le profil de ${member.name}`}
                        className="relative mb-6 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
                    >
                        <div className="w-32 h-32 rounded-full ring-4 ring-gold group-hover:ring-sidebar-ring transition-all duration-500 p-1.5 overflow-hidden flex items-center justify-center">
                            <Image
                                src={member.image ?? FALLBACK_MEMBER_IMAGE}
                                alt={`${member.name}, ${member.role ?? "membre de l'équipe"}`}
                                width={128}
                                height={128}
                                className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    </button>
                ) : (
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full ring-4 ring-gold p-1.5 overflow-hidden flex items-center justify-center">
                            <Image
                                src={member.image ?? FALLBACK_MEMBER_IMAGE}
                                alt={`${member.name}, ${member.role ?? "membre de l'équipe"}`}
                                width={128}
                                height={128}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
                    {member.role && (
                        <p className="text-gold-text text-sm font-semibold uppercase tracking-widest">
                            {member.role}
                        </p>
                    )}
                    {hasDescription && (
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            aria-haspopup="dialog"
                            className="text-sidebar-ring text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4 mt-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm transition-opacity duration-200 opacity-80 hover:opacity-100"
                        >
                            En savoir plus →
                        </button>
                    )}
                </div>
            </div>

            {/* Modale — portée hors du flux */}
            {hasDescription && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent
                        className="max-w-2xl p-0 overflow-hidden border-border/60"
                        aria-describedby="member-bio"
                    >
                        <div className="flex flex-col sm:flex-row min-h-0">
                            {/* Panneau gauche : identité sur fond sombre */}
                            <div className="sm:w-52 flex-shrink-0 bg-foreground flex flex-col items-center justify-start pt-10 pb-8 px-6 gap-4">
                                <div className="w-32 h-32 rounded-full ring-4 ring-gold p-1.5 overflow-hidden flex-shrink-0">
                                    <Image
                                        src={member.image}
                                        alt={`Portrait de ${member.name}`}
                                        width={128}
                                        height={128}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="text-center">
                                    <DialogTitle className="font-serif text-lg font-bold text-background leading-snug">
                                        {member.name}
                                    </DialogTitle>
                                    {member.role && (
                                        <p className="text-gold text-xs font-semibold uppercase tracking-widest mt-2">
                                            {member.role}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Panneau droit : biographie */}
                            <div className="flex-1 p-8 overflow-y-auto max-h-[75vh] sm:max-h-[60vh] bg-background">
                                {/* Accent cardinal */}
                                <div className="w-10 h-0.5 bg-sidebar-ring mb-5" aria-hidden="true" />
                                <DialogDescription
                                    id="member-bio"
                                    className="text-foreground text-sm leading-relaxed whitespace-pre-wrap not-italic"
                                >
                                    {member.description}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
