"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SetupAccountSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type SetupAccountValues = z.infer<typeof SetupAccountSchema>;

interface SetupAccountFormProps {
    email: string;
    userRole: string;
}

export function SetupAccountForm({ email, userRole }: SetupAccountFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<SetupAccountValues>({
        resolver: zodResolver(SetupAccountSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SetupAccountValues) => {
        setIsLoading(true);

        try {
            // Mise à jour du mot de passe
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Compte configuré avec succès !");

            // Redirection basée sur le rôle
            const redirectPath = userRole === 'admin' || userRole === 'editor'
                ? '/admin'
                : '/';

            router.push(redirectPath);
            router.refresh();

        } catch (error) {
            console.error("Setup failed:", error);
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground mb-4">
                    Compte : {email}
                </div>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Configuration...
                        </>
                    ) : (
                        "Finaliser l'inscription"
                    )}
                </Button>
            </form>
        </Form>
    );
}