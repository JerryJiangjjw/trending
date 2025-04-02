export interface TrendingItem {
  title: string;
  url: string;
  hot: string;
  platform: 'weibo' | 'douyin';
}

export interface TrendingResponse {
  platform: string;
  items: TrendingItem[];
  timestamp: number;
} 