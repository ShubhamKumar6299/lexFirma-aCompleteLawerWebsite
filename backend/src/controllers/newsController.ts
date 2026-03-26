import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import News from '../models/News';

// GET /api/news — get India legal news
export const getLegalNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check cache first (news updated by cron job)
    const cachedCount = await News.countDocuments();

    if (cachedCount > 0) {
      const total = await News.countDocuments();
      const news = await News.find()
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit));
      res.json({ success: true, total, news });
      return;
    }

    // Fallback: fetch live from NewsAPI
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, message: 'News API key not configured' });
      return;
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'India law court legal case',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey,
      },
    });

    const articles = response.data.articles || [];
    const newsItems = articles.map((a: any) => ({
      title: a.title,
      description: a.description || '',
      url: a.url,
      urlToImage: a.urlToImage,
      source: a.source?.name || 'Unknown',
      publishedAt: new Date(a.publishedAt),
      category: 'Legal',
    }));

    // Bulk insert (ignore duplicates)
    await News.insertMany(newsItems, { ordered: false }).catch(() => {});

    res.json({ success: true, total: newsItems.length, news: newsItems });
  } catch (err) {
    next(err);
  }
};

// Cron-called function to refresh news
export const refreshNews = async (): Promise<void> => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'India law court legal case Supreme Court',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey,
      },
    });

    const articles = response.data.articles || [];
    const newsItems = articles.map((a: any) => ({
      title: a.title,
      description: a.description || '',
      url: a.url,
      urlToImage: a.urlToImage,
      source: a.source?.name || 'Unknown',
      publishedAt: new Date(a.publishedAt),
      category: 'Legal',
    }));

    await News.insertMany(newsItems, { ordered: false }).catch(() => {});
    console.log(`📰 News refreshed: ${newsItems.length} articles fetched`);
  } catch (err) {
    console.error('News refresh error:', err);
  }
};
