import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { RiskLevelData } from '../../types/dashboard';
import { riskDataToPercentages } from '../../utils/dashboardUtils';

interface ConsolidatedRiskChartProps {
  title: string;
  data: RiskLevelData;
}

const RISK_COLORS = {
  muyAlto: 'hsl(0, 0%, 15%)',      // Negro
  alto: 'hsl(0, 70%, 45%)',         // Rojo
  medio: 'hsl(45, 100%, 50%)',      // Amarillo
  bajo: 'hsl(145, 60%, 42%)',       // Verde
  sinRiesgo: 'hsl(210, 70%, 40%)',  // Azul
};

export const ConsolidatedRiskChart = ({
  title,
  data,
  showTitle = true // Optional prop with default
}: ConsolidatedRiskChartProps & { showTitle?: boolean }) => {
  const percentages = riskDataToPercentages(data);

  const chartData = [
    { name: 'RIESGO MUY ALTO', value: percentages.muyAlto, count: data.muyAlto, fill: RISK_COLORS.muyAlto },
    { name: 'RIESGO ALTO', value: percentages.alto, count: data.alto, fill: RISK_COLORS.alto },
    { name: 'RIESGO MEDIO', value: percentages.medio, count: data.medio, fill: RISK_COLORS.medio },
    { name: 'RIESGO BAJO', value: percentages.bajo, count: data.bajo, fill: RISK_COLORS.bajo },
    { name: 'SIN RIESGO O RIESGO DESPRECIABLE', value: percentages.sinRiesgo, count: data.sinRiesgo, fill: RISK_COLORS.sinRiesgo },
  ];

  return (
    <div className="dashboard-card animate-fade-in">
      {showTitle && <h3 className="chart-title text-center">{title}</h3>}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 font-medium text-muted-foreground">Nivel de Riesgo</th>
                <th className="text-right py-1 font-medium text-muted-foreground">N°</th>
                <th className="text-right py-1 font-medium text-muted-foreground">%</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.name} className="border-b border-border/50">
                  <td className="py-1 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-[10px]">{item.name}</span>
                  </td>
                  <td className="text-right py-1 font-medium">{item.count}</td>
                  <td className="text-right py-1 font-medium">{item.value}%</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border font-bold">
                <td className="py-1">TOTAL</td>
                <td className="text-right py-1">{data.total}</td>
                <td className="text-right py-1">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="lg:w-2/3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9 }}
                width={100}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload.count} (${value}%)`,
                  'Cantidad'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(val: number) => `${val}%`}
                  style={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
