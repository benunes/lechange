"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {UploadButton} from "@/components/uploadthing";
import {createListing} from "@/lib/actions/listings.actions";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import * as z from "zod";

const formSchema = z.object({
    title: z.string().min(1, "Le titre est requis."),
    description: z.string().min(1, "La description est requise."),
    category: z.string().min(1, "La catégorie est requise."),
    price: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewListingForm() {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "",
            price: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        startTransition(() => {
            createListing({...values, images: imageUrls}).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                }
                if (data.success) {
                    toast.success(data.success);
                    router.push("/");
                }
            });
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...form.register("title")} disabled={isPending}/>
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.title.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...form.register("description")}
                    disabled={isPending}
                />
                {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.description.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                        onValueChange={(value) => form.setValue("category", value)}
                        disabled={isPending}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vehicules">Véhicules</SelectItem>
                            <SelectItem value="immobilier">Immobilier</SelectItem>
                            <SelectItem value="multimedia">Multimédia</SelectItem>
                            <SelectItem value="maison">Maison</SelectItem>
                            <SelectItem value="loisirs">Loisirs</SelectItem>
                            <SelectItem value="autres">Autres</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.category.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Prix (optionnel)</Label>
                    <Input
                        id="price"
                        type="text"
                        inputMode="decimal"
                        placeholder="9.99"
                        {...form.register("price")}
                        disabled={isPending}
                    />
                    {form.formState.errors.price && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.price.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Images</Label>
                <UploadButton
                    endpoint="listingImage"
                    onClientUploadComplete={(res) => {
                        if (res) {
                            const urls = res.map((r) => r.url);
                            setImageUrls(urls);
                            toast.success("Images téléversées avec succès !");
                        }
                    }}
                    onUploadError={(error: Error) => {
                        toast.error(`Erreur: ${error.message}`);
                    }}
                />
                {imageUrls.length > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                        {imageUrls.length} image(s) prête(s).
                    </div>
                )}
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Création en cours..." : "Créer l'annonce"}
            </Button>
        </form>
    );
}
