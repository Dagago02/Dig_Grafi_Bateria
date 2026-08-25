import React, { useState, useEffect, useRef } from 'react';
import { Eye, Hash, Download, Printer, Filter } from 'lucide-react';
import { RISK_LEVELS, getRiskChartColor } from '../../utils/riskColors';
import * as XLSX from 'xlsx';

export interface DepartmentBaremosData {
    departments: string[];
    rows: {
        dimension: string;
        isDomain: boolean;
        values: {
            [department: string]: {
                formaA: { score: number | null; riskLevel: string };
                formaB: { score: number | null; riskLevel: string };
            }
        }
    }[];
}

interface BaremosTableDashboardProps {
    data: DepartmentBaremosData | null;
}

const getRiskColorValue = (level: string): string => {
    return getRiskChartColor(level);
};

export const BaremosTableDashboard = ({ data }: BaremosTableDashboardProps) => {
    const [showNumbers, setShowNumbers] = useState(false);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data && data.departments.length > 0 && !isInitialized) {
            setSelectedDepartments(data.departments);
            setIsInitialized(true);
        }
    }, [data, isInitialized]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDepartment = (dept: string) => {
        setSelectedDepartments(prev =>
            prev.includes(dept)
                ? prev.filter(d => d !== dept)
                : [...prev, dept]
        );
    };

    const toggleAllDepartments = (checked: boolean) => {
        if (checked && data) {
            setSelectedDepartments(data.departments);
        } else {
            setSelectedDepartments([]);
        }
    };

    const displayedDepartments = selectedDepartments;

    const exportToExcel = () => {
        if (!data) return;

        const header1 = ['Factor intralaboral'];
        const header2 = [''];

        data.departments.forEach(dept => {
            header1.push(dept, '');
            header2.push('Forma A', 'Forma B');
        });

        const rows = data.rows.map(row => {
            const rowData = [row.dimension];
            data.departments.forEach(dept => {
                const cell = row.values[dept];
                const valA = cell.formaA.score !== null ? `${cell.formaA.score.toFixed(1)} (${cell.formaA.riskLevel})` : 'N/A';
                const valB = cell.formaB.score !== null ? `${cell.formaB.score.toFixed(1)} (${cell.formaB.riskLevel})` : 'N/A';
                rowData.push(valA, valB);
            });
            return rowData;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([header1, header2, ...rows]);
        const merges = [];
        for (let i = 0; i < data.departments.length; i++) {
            const startCol = 1 + (i * 2);
            merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } });
        }
        worksheet['!merges'] = merges;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Baremos');

        XLSX.writeFile(workbook, `Baremos_por_Departamento_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!data || data.departments.length === 0) {
        return (
            <div className="card text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                No hay datos disponibles para calcular Baremos por Departamento
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="card">
                <div className="card-header print:pb-2" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Baremos por Departamento</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                Promedios de puntajes transformados clasificados por nivel de riesgo
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }} className="print:hidden">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Filter size={16} />
                                    Filtrar
                                </button>
                                {isFilterOpen && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                                        backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                        borderRadius: '8px', zIndex: 50, width: '250px', padding: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)', maxHeight: '300px', overflowY: 'auto'
                                    }}>
                                        <div style={{ fontWeight: 600, padding: '4px 8px', fontSize: '0.9rem' }}>Departamentos</div>
                                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={data.departments.length === selectedDepartments.length}
                                                onChange={(e) => toggleAllDepartments(e.target.checked)} 
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>Seleccionar Todos</span>
                                        </label>
                                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                                        {data.departments.map((dept) => (
                                            <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedDepartments.includes(dept)}
                                                    onChange={() => toggleDepartment(dept)} 
                                                />
                                                <span style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{dept}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="btn btn-outline" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Download size={16} /> Exportar Excel
                            </button>
                            <button className="btn btn-outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Printer size={16} /> Imprimir
                            </button>
                            <button className="btn btn-outline" onClick={() => setShowNumbers(!showNumbers)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {showNumbers ? <><Eye size={16} /> Mostrar Solo Colores</> : <><Hash size={16} /> Mostrar Números</>}
                            </button>
                        </div>
                    </div>
                    {/* Estilos específicos para impresión */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body * { visibility: hidden; }
                            .print-container, .print-container * { visibility: visible; }
                            .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                            @page { size: landscape; margin: 1cm; }
                            table { font-size: 8pt !important; width: 100% !important; border-collapse: collapse !important; }
                            th, td { padding: 4px !important; border: 1px solid #475569 !important; }
                            .sticky { position: static !important; }
                            .rounded-full { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            .card { border: none !important; box-shadow: none !important; }
                        }
                    `}} />
                </div>
                <div className="card-body print-container" style={{ padding: '0 24px 24px 24px' }}>
                    <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '8px', textAlign: 'left', fontWeight: 600, minWidth: '300px' }}>
                                        Factor intralaboral
                                    </th>
                                    {displayedDepartments.map(dept => (
                                        <th key={dept} colSpan={2} style={{ border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center', fontWeight: 600 }}>
                                            {dept}
                                        </th>
                                    ))}
                                </tr>
                                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '4px' }}></th>
                                    {displayedDepartments.map(dept => (
                                        <React.Fragment key={dept}>
                                            <th style={{ border: '1px solid var(--border-color)', padding: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500 }}>Forma A</th>
                                            <th style={{ border: '1px solid var(--border-color)', padding: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500 }}>Forma B</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows.map((row, idx) => (
                                    <tr key={idx} style={{ backgroundColor: row.isDomain ? 'rgba(245, 158, 11, 0.1)' : 'transparent' }}>
                                        <td style={{ 
                                            position: 'sticky', left: 0, zIndex: 10, 
                                            backgroundColor: row.isDomain ? 'var(--bg-secondary)' : 'var(--bg-primary)', 
                                            border: '1px solid var(--border-color)', 
                                            padding: '8px',
                                            fontWeight: row.isDomain ? 700 : 400,
                                            textTransform: row.isDomain ? 'uppercase' : 'none',
                                            paddingLeft: row.isDomain ? '8px' : '24px'
                                        }}>
                                            {row.dimension}
                                        </td>
                                        {displayedDepartments.map(dept => {
                                            const cellData = row.values[dept];
                                            return (
                                                <React.Fragment key={dept}>
                                                    <td style={{ border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                            {cellData.formaA.score === null ? (
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>N/A</span>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: getRiskColorValue(cellData.formaA.riskLevel), border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                                                        title={`${cellData.formaA.riskLevel}: ${cellData.formaA.score.toFixed(1)}`}
                                                                    />
                                                                    {showNumbers && (
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                                            {cellData.formaA.score.toFixed(1)}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                            {cellData.formaB.score === null ? (
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>N/A</span>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: getRiskColorValue(cellData.formaB.riskLevel), border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                                                        title={`${cellData.formaB.riskLevel}: ${cellData.formaB.score.toFixed(1)}`}
                                                                    />
                                                                    {showNumbers && (
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                                            {cellData.formaB.score.toFixed(1)}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RISK_LEVELS.sinRiesgo.chartColor, border: '1px solid rgba(255,255,255,0.1)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                            <span>Sin riesgo</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RISK_LEVELS.bajo.chartColor, border: '1px solid rgba(255,255,255,0.1)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                            <span>Riesgo bajo</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RISK_LEVELS.medio.chartColor, border: '1px solid rgba(255,255,255,0.1)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                            <span>Riesgo medio</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RISK_LEVELS.alto.chartColor, border: '1px solid rgba(255,255,255,0.1)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                            <span>Riesgo alto</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RISK_LEVELS.muyAlto.chartColor, border: '1px solid rgba(255,255,255,0.1)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                            <span>Riesgo muy alto</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
