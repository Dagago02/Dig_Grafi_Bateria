import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, Legend } from 'recharts';
import { RiskLevelData } from '../../types/dashboard';
import { riskDataToPercentages } from '../../utils/dashboardUtils';

interface RiskStackedBarChartProps {
  title: string;
  data: RiskLevelData[];
  showTable?: boolean;
}

const RISK_COLORS = {
  muyAlto: 'hsl(0, 0%, 15%)',      // Negro - MUY ALTO
  alto: 'hsl(0, 70%, 45%)',         // Rojo - ALTO
  medio: 'hsl(45, 100%, 50%)',      // Amarillo - MEDIO
  bajo: 'hsl(145, 60%, 42%)',       // Verde - BAJO
  sinRiesgo: 'hsl(210, 70%, 40%)',  // Azul - SIN RIESGO
};

const RISK_LABELS = {
  muyAlto: 'MUY ALTO',
  alto: 'ALTO',
  medio: 'MEDIO',
  bajo: 'BAJO',
  sinRiesgo: 'SIN RIESGO',
};

export const RiskStackedBarChart = ({ 
  title, 
  data,
  showTable = true
}: RiskStackedBarChartProps) => {
  // Transformar datos para el gráfico de barras agrupadas
  const chartData = data.map(item => {
    const percentages = riskDataToPercentages(item);
    return {
      name: item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name,
      fullName: item.name,
      muyAlto: percentages.muyAlto,
      alto: percentages.alto,
      medio: percentages.medio,
      bajo: percentages.bajo,
      sinRiesgo: percentages.sinRiesgo,
      ...item,
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
    <div className="dashboard-card animate-fade-in">
      <h3 className="chart-title text-center">{title}</h3>
      
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
              <tr className="bg-gray-900 text-white">
                <td className="py-1 px-2 font-medium border border-border">RIESGO MUY ALTO</td>
                {tableData.map((item, idx) => (
                  <td key={idx} className="py-1 px-2 text-center border border-border">{item.muyAlto}</td>
                ))}
              </tr>
              <tr className="bg-red-600 text-white">
                <td className="py-1 px-2 font-medium border border-border">RIESGO ALTO</td>
                {tableData.map((item, idx) => (
                  <td key={idx} className="py-1 px-2 text-center border border-border">{item.alto}</td>
                ))}
              </tr>
              <tr className="bg-yellow-400 text-gray-900">
                <td className="py-1 px-2 font-medium border border-border">RIESGO MEDIO</td>
                {tableData.map((item, idx) => (
                  <td key={idx} className="py-1 px-2 text-center border border-border">{item.medio}</td>
                ))}
              </tr>
              <tr className="bg-green-600 text-white">
                <td className="py-1 px-2 font-medium border border-border">RIESGO BAJO</td>
                {tableData.map((item, idx) => (
                  <td key={idx} className="py-1 px-2 text-center border border-border">{item.bajo}</td>
                ))}
              </tr>
              <tr className="bg-blue-700 text-white">
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
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 8 }} 
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
            <Bar dataKey="muyAlto" stackId="a" fill={RISK_COLORS.muyAlto} name="muyAlto">
              <LabelList 
                dataKey="muyAlto" 
                position="inside" 
                formatter={(val: number) => val > 5 ? `${val}%` : ''}
                style={{ fontSize: 8, fill: 'white' }}
              />
            </Bar>
            <Bar dataKey="alto" stackId="a" fill={RISK_COLORS.alto} name="alto">
              <LabelList 
                dataKey="alto" 
                position="inside" 
                formatter={(val: number) => val > 5 ? `${val}%` : ''}
                style={{ fontSize: 8, fill: 'white' }}
              />
            </Bar>
            <Bar dataKey="medio" stackId="a" fill={RISK_COLORS.medio} name="medio">
              <LabelList 
                dataKey="medio" 
                position="inside" 
                formatter={(val: number) => val > 5 ? `${val}%` : ''}
                style={{ fontSize: 8, fill: 'black' }}
              />
            </Bar>
            <Bar dataKey="bajo" stackId="a" fill={RISK_COLORS.bajo} name="bajo">
              <LabelList 
                dataKey="bajo" 
                position="inside" 
                formatter={(val: number) => val > 5 ? `${val}%` : ''}
                style={{ fontSize: 8, fill: 'white' }}
              />
            </Bar>
            <Bar dataKey="sinRiesgo" stackId="a" fill={RISK_COLORS.sinRiesgo} name="sinRiesgo" radius={[4, 4, 0, 0]}>
              <LabelList 
                dataKey="sinRiesgo" 
                position="inside" 
                formatter={(val: number) => val > 5 ? `${val}%` : ''}
                style={{ fontSize: 8, fill: 'white' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
