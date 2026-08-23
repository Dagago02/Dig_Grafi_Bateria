import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartData } from '../../types/dashboard';

interface PieChartCardProps {
  title: string;
  data: ChartData[];
  colors?: string[];
  showLegend?: boolean;
  showTable?: boolean;
}

const DEFAULT_COLORS = [
  '#4F8DF7',
  '#F59E0B',
  '#9CA3AF',
  '#34D399',
  '#A78BFA',
  '#F472B6',
];

export const PieChartCard = ({
  title,
  data,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showTable = true
}: PieChartCardProps) => {
  const filteredData = data.filter(item => item.value > 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 12;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        fontSize={11}
        fontWeight={600}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    );
  };

  return (
    <div className="dashboard-card animate-fade-in">
      <h3 className="chart-title">{title}</h3>

      <div className="flex flex-col lg:flex-row gap-4">
        {showTable && (
          <div className="lg:w-1/3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 font-medium text-muted-foreground">{title}</th>
                  <th className="text-right py-1 font-medium text-muted-foreground">N°</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.name} className="border-b border-border/50">
                    <td className="py-1 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      {item.name}
                    </td>
                    <td className="text-right py-1 font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${showTable ? 'lg:w-2/3' : 'w-full'} h-56`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="52%"
                outerRadius={75}
                dataKey="value"
                label={renderLabel}
                labelLine={false}
              >
                {filteredData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />

              {showLegend && (
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: '10px' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
