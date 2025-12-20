'use client';

import { useMemo } from 'react';
import BaseChart from './BaseChart';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  data?: number[];
  categories?: string[];
  title?: string;
  loading?: boolean;
}

export default function BarChart({
  data = [820, 932, 901, 934, 1290, 1330, 1320],
  categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  title = 'Weekly Data',
  loading = false
}: BarChartProps) {
  const option: EChartsOption = useMemo(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Value',
        type: 'bar',
        data: data,
        itemStyle: {
          color: '#4f46e5', // Indigo color
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#6366f1'
          }
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }
    ]
  }), [data, categories, title]);

  return <BaseChart option={option} loading={loading} />;
}
