'use client';

import { useEffect, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  theme?: string;
}

export default function BaseChart({
  option,
  style = { height: '400px', width: '100%' },
  className = '',
  loading = false,
  theme = 'light'
}: BaseChartProps) {
  const [ReactECharts, setReactECharts] = useState<any>(null);

  useEffect(() => {
    // Dynamically import echarts-for-react only on client side
    import('echarts-for-react').then((module) => {
      setReactECharts(() => module.default);
    });
  }, []);

  if (!ReactECharts) {
    return (
      <div style={style} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={style}
      className={className}
      showLoading={loading}
      theme={theme}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: 'canvas' }}
    />
  );
}
