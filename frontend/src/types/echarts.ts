import type { EChartsOption } from 'echarts';

export interface ChartProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  theme?: string | object;
}

export type { EChartsOption };
