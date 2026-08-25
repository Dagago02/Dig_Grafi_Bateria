import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Maximize2, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const renderContent = (expanded: boolean) => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h3 className="chart-title" style={{ marginBottom: 0 }}>{title}</h3>
        {!expanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}
            title="Expandir Gráfica"
          >
            <Maximize2 size={16} />
          </button>
        )}
      </div>

      <div className={`flex flex-col lg:flex-row gap-4 ${expanded ? 'flex-1' : ''}`}>
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
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="truncate max-w-40" title={item.name}>{item.name}</span>
                    </td>
                    <td className="text-right py-1 font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${showTable ? 'lg:w-2/3' : 'w-full'} ${expanded ? 'min-h-[400px] flex-1' : 'h-56'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="52%"
                outerRadius={expanded ? 120 : 75}
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
    </>
  );

  return (
    <>
      <div className="dashboard-card animate-fade-in relative">
        {renderContent(false)}
      </div>

      {isExpanded && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content dashboard-card" style={{ maxWidth: '1000px', width: '95%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => setIsExpanded(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
