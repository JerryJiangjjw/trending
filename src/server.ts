import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { getWeiboTrending } from './services/weibo';
import { getDouyinTrending } from './services/douyin';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

class TrendingMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'trending-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_trending',
          description: 'Get trending data from platforms',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                description: 'Platform name (weibo/douyin/all)',
                enum: ['weibo', 'douyin', 'all']
              }
            },
            required: ['platform']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_trending') {
        throw new McpError(ErrorCode.MethodNotFound, 'Unknown tool');
      }

      if (!request.params.arguments || typeof request.params.arguments !== 'object') {
        throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments');
      }
      
      const { platform } = request.params.arguments as { platform: string };
      
      try {
        let data;
        if (platform === 'weibo') {
          data = await getWeiboTrending();
        } else if (platform === 'douyin') {
          data = await getDouyinTrending();
        } else {
          data = await Promise.all([getWeiboTrending(), getDouyinTrending()]);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, data }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ 
              success: false, 
              error: `Failed to fetch ${platform} trending data`
            }, null, 2)
          }],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Trending MCP server running on stdio');
  }
}

const mcpServer = new TrendingMcpServer();
mcpServer.run().catch(console.error);

// 获取所有平台的热搜
app.get('/api/trending', async (req, res) => {
  try {
    const [weibo, douyin] = await Promise.all([
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
