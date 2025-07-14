import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {createUploadthing, type FileRouter} from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) throw new Error("Unauthorized");
    return {userId: session.user.id};
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    listingImage: f({image: {maxFileSize: "4MB", maxFileCount: 4}})
        // Set permissions and file types for this FileRoute
        .middleware(async () => await handleAuth())
        .onUploadComplete(async ({metadata, file}) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return {uploadedBy: metadata.userId};
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
