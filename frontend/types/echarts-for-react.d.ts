// types/echarts-for-react.d.ts
declare module 'echarts-for-react' {
  import * as React from 'react';
  import type { CSSProperties } from 'react';
  import type { EChartsOption, ECharts } from 'echarts';

  export interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    className?: string;
    theme?: string | object;
    showLoading?: boolean;
    notMerge?: boolean;
    lazyUpdate?: boolean;
    opts?: {
      renderer?: 'canvas' | 'svg';
      width?: number | string;
      height?: number | string;
      devicePixelRatio?: number;
    };
    onChartReady?: (chart: ECharts) => void;
    onEvents?: Record<string, (params: unknown) => void>;
  }

  export default class ReactECharts extends React.Component<ReactEChartsProps> {}
}
