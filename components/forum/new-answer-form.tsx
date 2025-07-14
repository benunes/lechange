"use client";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {createAnswer} from "@/lib/actions/forum.actions";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTransition} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import * as z from "zod";

const formSchema = z.object({
    content: z.string().min(1, "La réponse ne peut pas être vide."),
});

type FormValues = z.infer<typeof formSchema>;

interface NewAnswerFormProps {
    questionId: string;
}

export function NewAnswerForm({questionId}: NewAnswerFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        startTransition(() => {
            createAnswer({...values, questionId}).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                }
                if (data.success) {
                    toast.success(data.success);
                    form.reset();
                }
            });
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
                {...form.register("content")}
                rows={5}
                placeholder="Écrivez votre réponse ici..."
                disabled={isPending}
            />
            {form.formState.errors.content && (
                <p className="text-sm text-red-500">
                    {form.formState.errors.content.message}
                </p>
            )}
            <Button type="submit" disabled={isPending}>
                {isPending ? "Publication..." : "Publier la réponse"}
            </Button>
        </form>
    );
}
