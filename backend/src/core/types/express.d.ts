declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        organizations: { organizationId: string; role: string }[];
      };
      organization?: {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
      };
      organizationId?: string;
      businessId?: string;
    }
  }
}

export {};
