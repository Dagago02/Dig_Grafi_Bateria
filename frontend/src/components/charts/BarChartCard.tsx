import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ChartData } from '../../types/dashboard';

interface BarChartCardProps {
  title: string;
  data: ChartData[];
  layout?: 'horizontal' | 'vertical';
  showPercentage?: boolean;
  showTable?: boolean;
  color?: string;
  gradientColors?: string[];
}

const DEFAULT_GRADIENT = [
  'hsl(210, 70%, 35%)',
  'hsl(210, 65%, 40%)',
  'hsl(210, 60%, 45%)',
  'hsl(210, 55%, 50%)',
  'hsl(200, 55%, 55%)',
  'hsl(195, 50%, 60%)',
];

export const BarChartCard = ({
  title,
  data,
  layout = 'vertical',
  showPercentage = true,
  showTable = true,
  gradientColors = DEFAULT_GRADIENT
}: BarChartCardProps) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className="dashboard-card animate-fade-in">
      <h3 className="chart-title">{title}</h3>

      <div className="flex flex-col lg:flex-row gap-4">
        {showTable && (
          <div className={`${isHorizontal ? 'lg:w-1/6' : 'lg:w-1/3'}`}>
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
                        style={{ backgroundColor: gradientColors[index % gradientColors.length] }}
                      />
                      <span className="truncate max-w-24">{item.name}</span>
                    </td>
                    <td className="text-right py-1 font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${showTable ? (isHorizontal ? 'lg:w-5/6' : 'lg:w-2/3') : 'w-full'} h-64`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout={isHorizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 10, right: 30, left: isHorizontal ? 100 : 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              {isHorizontal ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    width={95}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="percentage"
                      position="right"
                      formatter={(val: number) => `${val}%`}
                      style={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={gradientColors[index % gradientColors.length]} />
                    ))}
                  </Bar>
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {showPercentage && (
                      <LabelList
                        dataKey="percentage"
                        position="top"
                        formatter={(val: number) => `${val}%`}
                        style={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      />
                    )}
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={gradientColors[index % gradientColors.length]} />
                    ))}
                  </Bar>
                </>
              )}
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} (${props.payload.percentage}%)`,
                  'Cantidad'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
