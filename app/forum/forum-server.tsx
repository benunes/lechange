import {PrismaClient} from "@/lib/generated/prisma";
import ForumClientPage from "./forum-client";

const prisma = new PrismaClient();

async function getQuestions() {
    return prisma.question.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    name: true,
                },
            },
            _count: {
                select: {
                    answers: true,
                },
            },
        },
    });
}

async function getForumStats() {
    const [questionsCount, answersCount] = await Promise.all([
        prisma.question.count(),
        prisma.answer.count(),
    ]);
    return {questionsCount, answersCount};
}

export default async function ForumPage() {
    const [questions, stats] = await Promise.all([
        getQuestions(),
        getForumStats(),
    ]);

    return (
        <ForumClientPage
            initialQuestions={questions}
            initialStats={stats}
        />
    );
}
