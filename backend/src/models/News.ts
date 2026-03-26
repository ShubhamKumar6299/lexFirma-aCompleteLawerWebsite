import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: string;
  publishedAt: Date;
  category: string;
  createdAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true, unique: true },
    urlToImage: { type: String },
    source: { type: String },
    publishedAt: { type: Date },
    category: { type: String, default: 'Legal' },
  },
  { timestamps: true }
);

newsSchema.index({ publishedAt: -1 });

const News: Model<INews> = mongoose.model<INews>('News', newsSchema);
export default News;
