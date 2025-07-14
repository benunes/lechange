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
    email: z.string().email({message: "Veuillez entrer un email valide."}),
    password: z.string().min(1, {message: "Le mot de passe est requis."}),
});

export function LoginForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const {error} = await authClient.signIn.email({
            email: values.email,
            password: values.password,
        });

        if (error) {
            toast.error("Email ou mot de passe incorrect.");
        } else {
            toast.success("Connexion réussie !");
            router.push("/");
            router.refresh();
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>
                    Accédez à votre compte pour continuer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            {...form.register("email")}
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
                            ? "Connexion en cours..."
                            : "Se connecter"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
