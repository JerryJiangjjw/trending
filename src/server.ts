import express from 'express';
import { getWeiboTrending } from './services/weibo';
import { getDouyinTrending } from './services/douyin';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 获取所有平台的热搜
app.get('/api/trending', async (req, res) => {
  try {
    const [weibo douyin] = await Promise.all([
      getWeiboTrending(),
      getDouyinTrending()
    ]);

    res.json({
      success: true,
      data: [weibo, douyin]
    });
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending data'
    });
  }
});

// 获取指定平台的热搜
app.get('/api/trending/:platform', async (req, res) => {
  const { platform } = req.params;
  
  try {
    let data;
    switch (platform) {
      case 'weibo':
        data = await getWeiboTrending();
        break;
      case 'douyin':
        data = await getDouyinTrending();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid platform'
        });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error(`Error fetching ${platform} trending:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${platform} trending data`
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 