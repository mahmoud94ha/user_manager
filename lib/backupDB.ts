import { spawn } from 'child_process';
import os from 'os';

export const backupDatabase = async () => {
    return new Promise<string>((resolve, reject) => {
        const dbConnection = '--dbname=' + process.env.DATABASE_URL;
        const system = os.platform();
        let dbBpath: string;

        if (system === 'linux') {
            dbBpath = '/home/user_manager/database.sql';
        } else if (system === 'win32') {
            dbBpath = 'C:\\Users\\ADMINI~1\\DOCUME~1\\database.sql';
        } else {
            reject(new Error('Unsupported platform'));
        }

        if (!dbConnection) {
            reject(new Error('PostgreSQL password is not set.'));
            return;
        }

        const pgDump = spawn('pg_dump', [dbConnection, '--file', dbBpath]);

        pgDump.on('error', (error) => {
            reject(error);
        });

        pgDump.on('exit', (code) => {
            if (code === 0) {
                resolve(dbBpath);
            } else {
                reject(new Error(`Database backup failed with code ${code}`));
            }
        });
    });
};