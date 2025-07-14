"use client";

import {Button} from "@/components/ui/button";
import {startOrGetConversation} from "@/lib/actions/messages.actions";
import {useTransition} from "react";

interface ContactSellerButtonProps {
    listingId: string;
    sellerId: string;
}

export function ContactSellerButton({
                                        listingId,
                                        sellerId,
                                    }: ContactSellerButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleContact = () => {
        startTransition(async () => {
            await startOrGetConversation(listingId, sellerId);
        });
    };

    return (
        <Button
            onClick={handleContact}
            disabled={isPending}
            className="mt-6 w-full"
        >
            {isPending ? "Initialisation..." : "Contacter le vendeur"}
        </Button>
    );
}
