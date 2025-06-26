import React from "react";
import { Progress } from "./ui/progress";
import { BarChart2 } from "lucide-react";

interface Props {
  byCat: { category: string; total: number }[];
  total: number;
  loading: boolean;
}

const ChartBreakdown: React.FC<Props> = ({ byCat, total, loading }) => {
  if (loading) {
    return <div className="h-auto w-full animate-pulse bg-muted rounded-md" />;
  }

  if (!byCat.length) {
    return (
      <div className="flex flex-col items-center justify-center h-auto gap-2">
        <BarChart2 className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No data to display</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or add expenses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-auto flex items-end justify-around gap-2">
        {byCat.map(i => {
          const pct = (i.total / total) * 100;
          const h = Math.max(pct, 5);
          return (
            <div key={i.category} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary rounded-t transition-all duration-500 ease-in-out"
                style={{ height: `${h}%` }}
              />
              <p className="text-xs mt-2 text-center font-medium">{i.category}</p>
              <p className="text-xs text-muted-foreground">${i.total.toFixed(2)}</p>
              <p className="text-xs font-semibold">{pct.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {byCat.sort((a, b) => b.total - a.total).map(i => {
          const pct = (i.total / total) * 100;
          return (
            <div key={i.category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  <span>{i.category}</span>
                </div>
                <div className="font-medium">
                  ${i.total.toFixed(2)} ({pct.toFixed(1)}%)
                </div>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartBreakdown;