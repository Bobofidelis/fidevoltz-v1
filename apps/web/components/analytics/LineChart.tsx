"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartProps {
  title: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  height?: number;
}

export function LineChart({ title, data, dataKeys, xAxisKey, height = 300 }: LineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={2}
                name={dk.name}
                dot={{ fill: dk.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
