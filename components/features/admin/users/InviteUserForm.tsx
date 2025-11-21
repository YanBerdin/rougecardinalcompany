"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inviteUser } from "@/app/(admin)/admin/users/invite/actions";

const inviteUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Email invalide" }),
  role: z.enum(["user", "editor", "admin"], {
    message: "Rôle invalide",
  }),
  displayName: z.string().optional(),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const roleLabels = {
  user: "Utilisateur",
  editor: "Éditeur",
  admin: "Administrateur",
} as const;

const roleDescriptions = {
  user: "Accès en lecture seule au contenu public",
  editor: "Peut créer et modifier du contenu",
  admin: "Accès complet à l'administration",
} as const;

export function InviteUserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "user",
      displayName: "",
    },
  });

  async function onSubmit(data: InviteUserFormData) {
    setIsSubmitting(true);
    try {
      const result = await inviteUser(data);
console.log(data); //TODO: Remove debug log
      if (result.success) {
        toast.success("Invitation envoyée avec succès", {
          description: `Un email a été envoyé à ${data.email}`,
        });
        router.push("/admin/users");
      } else {
        toast.error("Erreur lors de l'invitation", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Erreur inattendue", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle invitation</CardTitle>
        <CardDescription>
          Invitez un nouvel utilisateur à rejoindre la plateforme. Un email
          avec un lien d&apos;invitation lui sera envoyé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="utilisateur@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    L&apos;adresse email de la personne à inviter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {
                                roleDescriptions[
                                  value as keyof typeof roleDescriptions
                                ]
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Le niveau d&apos;accès accordé à cet utilisateur
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d&apos;affichage (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean Dupont" {...field} />
                  </FormControl>
                  <FormDescription>
                    Le nom qui sera affiché dans l&apos;interface
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Envoyer l&apos;invitation
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
