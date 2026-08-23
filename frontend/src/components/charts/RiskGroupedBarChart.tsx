import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, Legend } from 'recharts';
import { RiskLevelData } from '../../types/dashboard';
import { riskDataToPercentages } from '../../utils/dashboardUtils';
import { RISK_LEVELS } from '../../utils/riskColors';

interface RiskGroupedBarChartProps {
    title: string;
    data: RiskLevelData[];
    showTable?: boolean;
}

const RISK_COLORS = {
    muyAlto: RISK_LEVELS.muyAlto.chartColor,
    alto: RISK_LEVELS.alto.chartColor,
    medio: RISK_LEVELS.medio.chartColor,
    bajo: RISK_LEVELS.bajo.chartColor,
    sinRiesgo: RISK_LEVELS.sinRiesgo.chartColor,
};

const RISK_LABELS = {
    muyAlto: RISK_LEVELS.muyAlto.label,
    alto: RISK_LEVELS.alto.label,
    medio: RISK_LEVELS.medio.label,
    bajo: RISK_LEVELS.bajo.label,
    sinRiesgo: RISK_LEVELS.sinRiesgo.label,
};

export const RiskGroupedBarChart = ({
    title,
    data,
    showTable = true
}: RiskGroupedBarChartProps) => {
    // Transformar datos para el gráfico de barras agrupadas
    const chartData = data.map(item => {
        const percentages = riskDataToPercentages(item);
        return {
            ...item,
            name: item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name,
            fullName: item.name,
            muyAlto: percentages.muyAlto,
            alto: percentages.alto,
            medio: percentages.medio,
            bajo: percentages.bajo,
            sinRiesgo: percentages.sinRiesgo,
        };
    });

    const tableData = data.map(item => {
        const percentages = riskDataToPercentages(item);
        return {
            ...item,
            percentages,
        };
    });

    return (
        <div className="dashboard-card animate-fade-in w-full">
            <h3 className="chart-title text-center mb-4">{title}</h3>

            {showTable && (
                <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-primary text-primary-foreground">
                                <th className="py-2 px-2 text-left font-semibold border border-border" rowSpan={2}>
                                    NIVEL DE RIESGO
                                </th>
                                {tableData.map((item, idx) => (
                                    <th key={idx} className="py-2 px-2 text-center font-semibold border border-border text-[10px]" colSpan={1}>
                                        {item.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ backgroundColor: RISK_LEVELS.muyAlto.chartColor }} className={RISK_LEVELS.muyAlto.textClass}>
                                <td className="py-1 px-2 font-medium border border-border">RIESGO MUY ALTO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.muyAlto}</td>
                                ))}
                            </tr>
                            <tr style={{ backgroundColor: RISK_LEVELS.alto.chartColor }} className={RISK_LEVELS.alto.textClass}>
                                <td className="py-1 px-2 font-medium border border-border">RIESGO ALTO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.alto}</td>
                                ))}
                            </tr>
                            <tr style={{ backgroundColor: RISK_LEVELS.medio.chartColor }} className={RISK_LEVELS.medio.textClass}>
                                <td className="py-1 px-2 font-medium border border-border">RIESGO MEDIO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.medio}</td>
                                ))}
                            </tr>
                            <tr style={{ backgroundColor: RISK_LEVELS.bajo.chartColor }} className={RISK_LEVELS.bajo.textClass}>
                                <td className="py-1 px-2 font-medium border border-border">RIESGO BAJO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.bajo}</td>
                                ))}
                            </tr>
                            <tr style={{ backgroundColor: RISK_LEVELS.sinRiesgo.chartColor }} className={RISK_LEVELS.sinRiesgo.textClass}>
                                <td className="py-1 px-2 font-medium border border-border">SIN RIESGO O RIESGO DESPRECIABLE</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.sinRiesgo}</td>
                                ))}
                            </tr>
                            {/* Porcentajes */}
                            <tr className="bg-muted/50">
                                <td className="py-1 px-2 font-semibold border border-border" colSpan={tableData.length + 1}>PORCENTAJES</td>
                            </tr>
                            <tr>
                                <td className="py-1 px-2 font-medium border border-border">MUY ALTO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.percentages.muyAlto}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-1 px-2 font-medium border border-border">ALTO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.percentages.alto}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-1 px-2 font-medium border border-border">MEDIO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.percentages.medio}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-1 px-2 font-medium border border-border">BAJO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.percentages.bajo}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-1 px-2 font-medium border border-border">SIN RIESGO</td>
                                {tableData.map((item, idx) => (
                                    <td key={idx} className="py-1 px-2 text-center border border-border">{item.percentages.sinRiesgo}%</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                        />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            formatter={(value: number, name: string) => [`${value}%`, RISK_LABELS[name as keyof typeof RISK_LABELS] || name]}
                            labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.fullName || label}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '10px' }}
                            formatter={(value) => RISK_LABELS[value as keyof typeof RISK_LABELS] || value}
                        />
                        <Bar dataKey="muyAlto" fill={RISK_COLORS.muyAlto} name="muyAlto">
                            <LabelList
                                dataKey="muyAlto"
                                position="top"
                                formatter={(val: number) => val > 0 ? `${val}%` : ''}
                                style={{ fontSize: 8, fill: 'var(--foreground)' }}
                            />
                        </Bar>
                        <Bar dataKey="alto" fill={RISK_COLORS.alto} name="alto">
                            <LabelList
                                dataKey="alto"
                                position="top"
                                formatter={(val: number) => val > 0 ? `${val}%` : ''}
                                style={{ fontSize: 8, fill: 'var(--foreground)' }}
                            />
                        </Bar>
                        <Bar dataKey="medio" fill={RISK_COLORS.medio} name="medio">
                            <LabelList
                                dataKey="medio"
                                position="top"
                                formatter={(val: number) => val > 0 ? `${val}%` : ''}
                                style={{ fontSize: 8, fill: 'var(--foreground)' }}
                            />
                        </Bar>
                        <Bar dataKey="bajo" fill={RISK_COLORS.bajo} name="bajo">
                            <LabelList
                                dataKey="bajo"
                                position="top"
                                formatter={(val: number) => val > 0 ? `${val}%` : ''}
                                style={{ fontSize: 8, fill: 'var(--foreground)' }}
                            />
                        </Bar>
                        <Bar dataKey="sinRiesgo" fill={RISK_COLORS.sinRiesgo} name="sinRiesgo">
                            <LabelList
                                dataKey="sinRiesgo"
                                position="top"
                                formatter={(val: number) => val > 0 ? `${val}%` : ''}
                                style={{ fontSize: 8, fill: 'var(--foreground)' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
