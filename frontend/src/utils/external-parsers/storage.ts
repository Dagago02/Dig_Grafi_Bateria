import { get, set, del, values } from 'idb-keyval';
import { DashboardStats } from '@/types/excel';
import { IntralaboralStats, IntralaboralReport } from '@/types/intralaboral';
import { DepartmentBaremosData } from '@/utils/intralaboralParser';
import { v4 as uuidv4 } from 'uuid';

export const MAX_REPORTS = 4;

export interface StoredReport {
    id: string;
    fileName: string;
    uploadDate: string;
    stats: DashboardStats;
    intralaboralStats: IntralaboralStats;
    individualReports: IntralaboralReport[];
    baremosData?: DepartmentBaremosData;
}

const STORE_KEY_PREFIX = 'report_';

export const saveReport = async (
    fileName: string,
    stats: DashboardStats,
    intralaboralStats: IntralaboralStats,
    individualReports: IntralaboralReport[],
    baremosData: DepartmentBaremosData
): Promise<StoredReport> => {
    const reports = await getReports();
    if (reports.length >= MAX_REPORTS) {
        throw new Error('Almacenamiento lleno. Por favor elimine un informe antiguo.');
    }

    const newReport: StoredReport = {
        id: uuidv4(),
        fileName,
        uploadDate: new Date().toISOString(),
        stats,
        intralaboralStats,
        individualReports,
        baremosData
    };

    await set(STORE_KEY_PREFIX + newReport.id, newReport);
    return newReport;
};

export const getReports = async (): Promise<StoredReport[]> => {
    // idb-keyval doesn't have a 'scan' or 'getAll' that filters.
    // We have to manage keys or just use separate store?
    // Using a custom store is better, but 'values()' gets everything in the default store.
    // If we only store reports in the default store, 'values()' works.
    // But if we store auth token, we need to filter.
    // Simpler: Store the LIST of IDs in a separate key 'report_list', and fetch individually?
    // Or assuming the store *only* has reports (and maybe auth).
    // Let's use a specific key 'saved_reports' to store the ARRAY of metadata, and separate keys for blobs?
    // No, let's keep it simple: Use `values()` and filter by checking if it looks like a report.

    const allValues = await values();
    return allValues.filter((v: any) => v && v.id && v.stats && v.intralaboralStats) as StoredReport[];
};

export const deleteReport = async (id: string): Promise<void> => {
    await del(STORE_KEY_PREFIX + id);
};

export const clearReports = async (): Promise<void> => {
    // Dangerous if sharing store. 
    const reports = await getReports();
    for (const r of reports) {
        await del(STORE_KEY_PREFIX + r.id);
    }
};
