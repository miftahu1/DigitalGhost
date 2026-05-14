
"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ChartDataPoint = {
  name: string;
  emotional: number;
  growth: number;
  mood: number;
};

interface EvolutionChartProps {
  data?: ChartDataPoint[];
}

export function EvolutionChart({ data = [] }: EvolutionChartProps) {
  return (
    <Card className="glass-morphism border-white/5 bg-transparent h-[400px]">
      <CardHeader>
        <CardTitle className="font-headline text-lg font-medium tracking-wide flex items-center justify-between text-white">
          Identity Evolution Map
          <span className="text-xs font-light text-muted-foreground uppercase tracking-widest">Active Neural Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] w-full pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2833" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              hide
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 16, 22, 0.9)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                color: '#fff'
              }}
              itemStyle={{ color: '#A38CF4' }}
            />
            <Line 
              type="monotone" 
              dataKey="growth" 
              stroke="#A38CF4" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#A38CF4' }} 
              activeDot={{ r: 8, stroke: '#A38CF4', strokeWidth: 2, fill: '#111016' }}
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#5F8CFA" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#5F8CFA' }} 
              activeDot={{ r: 8, stroke: '#5F8CFA', strokeWidth: 2, fill: '#111016' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
