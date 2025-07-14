"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {authClient} from "@/lib/auth-client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import * as z from "zod";

const formSchema = z.object({
    name: z.string().min(1, {message: "Le nom est requis."}),
    email: z.string().email({message: "Veuillez entrer un email valide."}),
    password: z
        .string()
        .min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères.",
        }),
});

export function RegisterForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const {error} = await authClient.signUp.email(values);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Inscription réussie ! Vous êtes maintenant connecté.");
            router.push("/");
            router.refresh();
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>
                    Créez un compte pour commencer à utiliser l'application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...form.register("name")}
                            disabled={form.formState.isSubmitting}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            {...form.register("email")}
                            disabled={form.formState.isSubmitting}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            {...form.register("password")}
                            disabled={form.formState.isSubmitting}
                        />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? "Inscription en cours..."
                            : "S'inscrire"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
