import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

export const checkFileExists = async (): Promise<string | null> => {
    return new Promise<string | null>((resolve, reject) => {
        const system = os.platform();
        let filePath: string;

        if (system === 'linux') {
            filePath = path.join('/home/user_manager/database.sql');
        } else if (system === 'win32') {
            filePath = path.join('C:\\Users\\ADMINI~1\\DOCUME~1\\database.sql');
        } else {
            reject(new Error('Unsupported platform'));
            return;
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                resolve(null);
            } else {
                resolve(filePath);
            }
        });
    });
};
