'use client';

import { useEffect, useState } from 'react';
import type { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  theme?: string;
}

type EChartsReactComponent = React.ComponentType<{
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  showLoading?: boolean;
  theme?: string;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  opts?: { renderer: 'canvas' | 'svg' };
}>;

export default function BaseChart({
  option,
  style = { height: '400px', width: '100%' },
  className = '',
  loading = false,
  theme = 'light'
}: BaseChartProps) {
  const [Chart, setChart] = useState<EChartsReactComponent | null>(null);

  useEffect(() => {
    // Dynamically import echarts-for-react only on client side
    import('echarts-for-react').then((module) => {
      setChart(() => module.default as EChartsReactComponent);
    });
  }, []);

  if (!Chart) {
    return (
      <div style={style} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <Chart
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
