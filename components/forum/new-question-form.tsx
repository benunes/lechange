"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {createQuestion} from "@/lib/actions/forum.actions";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useTransition} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import * as z from "zod";

const formSchema = z.object({
    title: z.string().min(1, "Le titre est requis."),
    content: z.string().min(1, "Le contenu est requis."),
    tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewQuestionForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        startTransition(() => {
            createQuestion(values).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                }
                if (data.success && data.questionId) {
                    toast.success(data.success);
                    router.push(`/forum/${data.questionId}`);
                }
            });
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
                <Label htmlFor="title">Titre de la question</Label>
                <Input id="title" {...form.register("title")} disabled={isPending}/>
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.title.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Votre question</Label>
                <Textarea
                    id="content"
                    {...form.register("content")}
                    rows={10}
                    disabled={isPending}
                />
                {form.formState.errors.content && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.content.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input id="tags" {...form.register("tags")} disabled={isPending}/>
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Publication..." : "Publier la question"}
            </Button>
        </form>
    );
}
