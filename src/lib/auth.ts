import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { moderateUsername } from "@/lib/moderation";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 10,
    },
    databaseHooks: {
        user: {
            create: {
                async before(user) {
                    const moderation = moderateUsername(user.name);
                    if (!moderation.allowed) return false;
                    return { data: { name: moderation.sanitized } };
                },
            },
            update: {
                async before(user) {
                    if (!("name" in user)) return;
                    const moderation = moderateUsername(user.name);
                    if (!moderation.allowed) return false;
                    return { data: { name: moderation.sanitized } };
                },
            },
        },
    },
    plugins: [nextCookies()],
});
