import axios from 'axios';
import * as cheerio from 'cheerio';
import { TrendingItem, TrendingResponse } from '../types';

export async function getWeiboTrending(): Promise<TrendingResponse> {
  try {
    const response = await axios.get('https://s.weibo.com/top/summary', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Cookie': 'SUB=1'
      }
    });

    const $ = cheerio.load(response.data);
    const items: TrendingItem[] = [];

    $('.td-02').each((_, element) => {
      const title = $(element).find('a').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const hot = $(element).next('.td-03').text().trim();
      
      if (title && url) {
        items.push({
          title,
          url: url.startsWith('http') ? url : `https://s.weibo.com${url}`,
          hot,
          platform: 'weibo'
        });
      }
    });

    return {
      platform: 'weibo',
      items,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching Weibo trending:', error);
    throw error;
  }
}
