import axios from 'axios';
import prisma from "@lib/visitorPrisma";


export async function upsertVisitor(ipAddress: string, lastPage: string | null): Promise<void> {
    try {
        await prisma.visitor.upsert({
            where: { ipAddress_lastPage: { ipAddress, lastPage } },
            create: { ipAddress: ipAddress, lastPage: lastPage },
            update: { lastPage: lastPage, dateVisited: new Date() },
        });
    } catch (error) {
        console.error('Error upserting visitor data:', error);
        throw error;
    }
}

export async function makeApiCall(re_c: string, re_p: string | null): Promise<void> {
    try {
        if (!re_c || !re_p || re_c === null || re_p === null || re_c === "null" || re_p === "null") {
            return;
        }
        const encryptedReP = re_p ? btoa(re_p) : null;

        await axios.post('/api/bootstrap', { re_c: re_c, re_p: encryptedReP });
    } catch (error) {
        return;
    }
}
