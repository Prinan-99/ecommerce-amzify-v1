import React, { useEffect, useRef } from 'react';

interface CircleChartProps {
  title: string;
  value: number;
  unit?: string;
  data: Array<{ label: string; percentage: number; color: string }>;
}

export const CircleChart: React.FC<CircleChartProps> = ({ title, value, unit = '', data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 70;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    // Draw circle segments
    let currentAngle = -Math.PI / 2;
    data.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      
      // Draw segment
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw white inner circle for donut effect
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    ctx.fill();

    // Draw center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toLocaleString(), centerX, centerY - 8);

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI"';
    ctx.fillText(unit, centerX, centerY + 12);
  }, [data, value, unit]);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white h-full flex flex-col justify-between group overflow-hidden relative">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-6">{title}</h3>
        
        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="w-40 h-40"
          />
        </div>

        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.label}</span>
              </div>
              <span className="font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface BarChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
}

export const BarChartComponent: React.FC<BarChartProps> = ({ title, data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  return (
    <div className="bg-slate-900 rounded-3xl p-8 text-white group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-8">{title}</h3>
        
        <div className="flex items-end justify-between h-48 gap-4">
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center gap-2 group/bar relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-full bg-slate-800 rounded-lg overflow-hidden h-32 flex items-end group-hover/bar:shadow-lg transition-all duration-300 relative">
                <div
                  className="w-full bg-gradient-to-t from-slate-600 to-slate-500 group-hover/bar:from-blue-600 group-hover/bar:to-blue-500 transition-all duration-300 rounded-t-lg"
                  style={{ height: `${(item.value / max) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover/bar:text-slate-300">{item.label}</span>
              
              {/* Hover Tooltip */}
              {hoveredIndex === idx && (
                <div className="absolute bottom-full mb-2 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap z-50">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-slate-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LineChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
}

export const LineChartComponent: React.FC<LineChartProps> = ({ title, data, maxValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const max = maxValue || Math.max(...data.map(d => d.value));
    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, width, height);

    // Calculate points
    const points = data.map((item, idx) => ({
      x: padding + (idx / (data.length - 1)) * graphWidth,
      y: height - padding - (item.value / max) * graphHeight,
      value: item.value
    }));

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw gradient under line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0.01)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point, idx) => {
      if (idx === 0) return;
      ctx.quadraticCurveTo(
        (points[idx - 1].x + point.x) / 2,
        (points[idx - 1].y + point.y) / 2,
        point.x,
        point.y
      );
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point, idx) => {
      if (idx === 0) return;
      ctx.quadraticCurveTo(
        (points[idx - 1].x + point.x) / 2,
        (points[idx - 1].y + point.y) / 2,
        point.x,
        point.y
      );
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#ffffff';
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [data, maxValue]);

  return (
    <div className="bg-slate-900 rounded-3xl p-8 text-white group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-6">{title}</h3>
        <canvas
          ref={canvasRef}
          width={600}
          height={250}
          className="w-full"
        />
      </div>
    </div>
  );
};
