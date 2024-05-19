import { NextApiRequest, NextApiResponse } from 'next';
import { upsertVisitor } from '@lib/visitor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { re_c, re_p } = req.body;

            if (!re_c || !re_p) {
                res.status(404).send('\n');
                return;
            }

            if (!isValidBase64(re_c) || (re_p && !isValidBase64(re_p))) {
                res.status(404).send('\n');
                return;
            }

            const ipAddress = Buffer.from(re_c, 'base64').toString('utf-8');
            const lastPage = re_p ? Buffer.from(re_p, 'base64').toString('utf-8') : null;

            if (ipAddress === "null" || lastPage === "null" || !lastPage || !lastPage) {
                res.status(200).send('\n');
                return;
            }

            await upsertVisitor(ipAddress, lastPage);

            res.status(200).send('\n');
        } catch (error) {
            console.error('Error processing visitor data:', error);
            res.status(404).send('\n');
        }
    } else {
        res.status(404).send('\n');
    }
}

function isValidBase64(str: string): boolean {
    try {
        return btoa(atob(str)) === str;
    } catch (error) {
        return false;
    }
}
