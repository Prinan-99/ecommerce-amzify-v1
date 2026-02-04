import React, { useEffect, useRef } from 'react';

interface DemographicData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DemographicsChartProps {
  title: string;
  data: DemographicData[];
}

export const DemographicsChart: React.FC<DemographicsChartProps> = ({ title, data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale for canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const barWidth = chartWidth / data.length - 15;

    let foundIndex = null;
    data.forEach((item, idx) => {
      const barX = padding + idx * (barWidth + 15);
      if (canvasX >= barX && canvasX <= barX + barWidth) {
        foundIndex = idx;
      }
    });

    setHoveredIndex(foundIndex);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const barWidth = chartWidth / data.length - 15;
    const maxValue = Math.max(...data.map(d => d.value));

    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((item, idx) => {
      const x = padding + idx * (barWidth + 15);
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = height - padding - barHeight;

      // Gradient for bar
      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, item.color + 'FF');
      gradient.addColorStop(1, item.color + '80');

      // Draw bar with rounded top
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.quadraticCurveTo(x, y, x + barWidth / 2, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + 8);
      ctx.lineTo(x + barWidth, height - padding);
      ctx.lineTo(x, height - padding);
      ctx.closePath();
      ctx.fill();

      // Value label on top of bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.percentage.toFixed(0) + '%', x + barWidth / 2, y - 8);

      // Label below bar
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 12);
    });
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white group overflow-hidden relative">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          {title}
        </h3>

        <div className="overflow-hidden rounded-2xl relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          />
          
          {/* Detailed Tooltip */}
          {hoveredIndex !== null && (
            <div 
              className="fixed bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[280px]"
              style={{ 
                left: `${tooltipPosition.x + 20}px`, 
                top: `${tooltipPosition.y - 100}px`,
                pointerEvents: 'none'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: data[hoveredIndex].color }}
                ></div>
                <p className="text-sm font-bold text-white">{data[hoveredIndex].label} Years</p>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Customers:</span>
                  <span className="text-white font-bold">{data[hoveredIndex].value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Percentage:</span>
                  <span className="text-white font-bold">{data[hoveredIndex].percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg. Order Value:</span>
                  <span className="text-white font-bold">₹{(data[hoveredIndex].value * 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Growth Rate:</span>
                  <span className="text-green-400 font-bold">+{(data[hoveredIndex].percentage * 0.8).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400">
                  {hoveredIndex === 0 && "Young adults, tech-savvy shoppers"}
                  {hoveredIndex === 1 && "Primary earning demographic"}
                  {hoveredIndex === 2 && "Established professionals"}
                  {hoveredIndex === 3 && "High-value loyal customers"}
                  {hoveredIndex === 4 && "Premium quality seekers"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LocationMapProps {
  title: string;
  regions: Array<{ name: string; value: number; color: string }>;
}

export const LocationMap: React.FC<LocationMapProps> = ({ title, regions }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  const getRegionDetails = (index: number) => {
    const details = [
      { 
        customers: '4,200', 
        revenue: '₹28.5M',
        cities: 'New York, Toronto, LA',
        topProduct: 'Electronics'
      },
      { 
        customers: '3,360', 
        revenue: '₹22.1M',
        cities: 'London, Paris, Berlin',
        topProduct: 'Fashion'
      },
      { 
        customers: '2,640', 
        revenue: '₹18.7M',
        cities: 'Tokyo, Singapore, Sydney',
        topProduct: 'Home & Living'
      },
      { 
        customers: '1,800', 
        revenue: '₹12.3M',
        cities: 'Dubai, Mumbai, São Paulo',
        topProduct: 'Accessories'
      }
    ];
    return details[index] || details[0];
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5"></div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
          {title}
        </h3>

        <div className="space-y-4">
          {regions.map((region, idx) => (
            <div 
              key={idx} 
              className="group/region relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/90">{region.name}</span>
                <span className="text-sm font-bold text-white">{region.value}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30 cursor-pointer">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover/region:shadow-lg"
                  style={{
                    width: `${region.value}%`,
                    backgroundColor: region.color,
                    boxShadow: `0 0 20px ${region.color}80`
                  }}
                ></div>
              </div>
              
              {/* Detailed Tooltip */}
              {hoveredIndex === idx && (
                <div className="absolute left-0 top-full mt-2 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[320px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <p className="text-sm font-bold text-white">{region.name}</p>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Market Share:</span>
                      <span className="text-white font-bold">{region.value}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Customers:</span>
                      <span className="text-white font-bold">{getRegionDetails(idx).customers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Revenue:</span>
                      <span className="text-white font-bold">{getRegionDetails(idx).revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Top Cities:</span>
                      <span className="text-white font-bold text-right">{getRegionDetails(idx).cities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Seller:</span>
                      <span className="text-white font-bold">{getRegionDetails(idx).topProduct}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 font-bold">↑ +{(region.value * 0.6).toFixed(1)}%</span>
                      <span className="text-xs text-slate-400">vs last quarter</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-blue-400">12K</p>
            <p className="text-xs text-white/50 mt-1">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">47</p>
            <p className="text-xs text-white/50 mt-1">Countries</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-purple-400">89%</p>
            <p className="text-xs text-white/50 mt-1">Retention</p>
          </div>
        </div>
      </div>
    </div>
  );
};
