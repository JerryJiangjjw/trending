import axios from 'axios';
import { TrendingItem, TrendingResponse } from '../types';

export async function getDouyinTrending(): Promise<TrendingResponse> {
  try {
    const response = await axios.get('https://www.douyin.com/aweme/v1/web/hot/search/list/', {
      headers: {
        'referer': 'https://www.douyin.com/hot'
      }
    });

    const $ = response.data.data.word_list;
    const items: TrendingItem[] = [];

    $.forEach((word: { word: string; word_cover: { url_list: string[] }; hot_value: number }) => {
      const title = word.word;
      const url = word.word_cover.url_list[0];
      const hot = String(word.hot_value);
      
      if (title && url) {
        items.push({
          title,
          url: url.startsWith('http') ? url : `https://www.douyin.com${url}`,
          hot,
          platform: 'douyin'
        });
      }
    });

    return {
      platform: 'douyin',
      items,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching Douyin trending:', error);
    throw error;
  }
}
