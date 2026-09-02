import { StackName } from "@/components/common/StackIcon";

export type TDiaryEntry = {
  id: string;
  title: string;
  summary: string;
  date: string;
  context?: string;
  contributions: string[];
  impact?: string;
  stack?: StackName[];
};

export type TOrgDiary = {
  org: string;
  overview?: string;
  featured: TDiaryEntry[];
  other?: { title: string; summary: string; date?: string }[];
};

export const diaries: TOrgDiary[] = [];

export function getDiary(slug: string): TOrgDiary | undefined {
  return diaries.find((d) => d.org === slug);
}
