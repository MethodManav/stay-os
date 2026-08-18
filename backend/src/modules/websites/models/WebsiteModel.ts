import { Schema, model, Document, Types } from 'mongoose';

export interface IWebsiteSection {
  id: string;
  type: 'hero' | 'about' | 'rooms' | 'amenities' | 'gallery' | 'testimonials' | 'location' | 'contact' | 'footer';
  title: string;
  visible: boolean;
  content: Record<string, string>;
}

export interface IWebsiteTheme {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  buttonStyle: string;
}

export interface IWebsite {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  templateId: string;
  theme: IWebsiteTheme;
  sections: IWebsiteSection[];
  customDomain?: string;
  subdomain: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebsiteDocument extends IWebsite, Document {}

const WebsiteSectionSchema = new Schema<IWebsiteSection>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['hero', 'about', 'rooms', 'amenities', 'gallery', 'testimonials', 'location', 'contact', 'footer'],
    required: true
  },
  title: { type: String, required: true },
  visible: { type: Boolean, default: true },
  content: { type: Map, of: String, default: {} }
}, { _id: false });

const WebsiteThemeSchema = new Schema<IWebsiteTheme>({
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  font: { type: String, required: true },
  buttonStyle: { type: String, required: true }
}, { _id: false });

const WebsiteSchema = new Schema<IWebsiteDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      unique: true,
      index: true
    },
    templateId: {
      type: String,
      required: true,
      default: 'modern'
    },
    theme: {
      type: WebsiteThemeSchema,
      required: true
    },
    sections: {
      type: [WebsiteSectionSchema],
      default: []
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    published: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const WebsiteModel = model<IWebsiteDocument>('Website', WebsiteSchema);
export default WebsiteModel;
