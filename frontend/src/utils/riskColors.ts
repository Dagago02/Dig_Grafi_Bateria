export type RiskLevel = 'muyAlto' | 'alto' | 'medio' | 'bajo' | 'sinRiesgo' | 'na';

interface RiskColorConfig {
    label: string;
    bgClass: string;
    textClass: string;
    chartColor: string;
}

export const RISK_LEVELS: Record<RiskLevel, RiskColorConfig> = {
    muyAlto: {
        label: 'MUY ALTO',
        bgClass: 'bg-red-600',
        textClass: 'text-white',
        chartColor: 'hsla(0, 0%, 0%, 1.00)'
    },
    alto: {
        label: 'ALTO',
        bgClass: 'bg-orange-500',
        textClass: 'text-white',
        chartColor: 'hsla(0, 95%, 45%, 1.00)'
    },
    medio: {
        label: 'MEDIO',
        bgClass: 'bg-yellow-400',
        textClass: 'text-slate-900',
        chartColor: 'hsl(45, 100%, 50%)'
    },
    bajo: {
        label: 'BAJO',
        bgClass: 'bg-green-500',
        textClass: 'text-white',
        chartColor: 'hsl(145, 60%, 42%)'
    },
    sinRiesgo: {
        label: 'SIN RIESGO',
        bgClass: 'bg-blue-400',
        textClass: 'text-white',
        chartColor: 'hsl(210, 70%, 40%)'
    },
    na: {
        label: 'N/A',
        bgClass: 'bg-gray-300',
        textClass: 'text-slate-600',
        chartColor: 'hsl(0, 0%, 80%)'
    }
};

export const getRiskLevelFromText = (text: string): RiskLevel => {
    const l = text.toLowerCase();
    if (l === 'n/a') return 'na';
    if (l.includes('muy alto')) return 'muyAlto';
    if (l.includes('alto')) return 'alto';
    if (l.includes('medio')) return 'medio';
    if (l.includes('bajo')) return 'bajo';
    if (l.includes('sin riesgo') || l.includes('despreciable') || l.includes('muy bajo')) return 'sinRiesgo';
    return 'na';
};

export const getRiskBgClass = (level: string) => {
    return RISK_LEVELS[getRiskLevelFromText(level)].bgClass;
};

export const getRiskTextClass = (level: string) => {
    return RISK_LEVELS[getRiskLevelFromText(level)].textClass;
};

export const getRiskChartColor = (level: string) => {
    return RISK_LEVELS[getRiskLevelFromText(level)].chartColor;
};
