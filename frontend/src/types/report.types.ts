// src/types/report.types.ts
export type ReportTimeframe = "week" | "month" | "quarter" | "year" | "custom";
export type ReportType =
  | "spending"
  | "income"
  | "net_worth"
  | "category"
  | "custom";

export interface ReportConfig {
  type: ReportType;
  title: string;
  timeframe: ReportTimeframe;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  compareWithPrevious?: boolean;
  groupBy?: "day" | "week" | "month" | "category";
}
