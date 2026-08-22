import { Request, Response, NextFunction } from 'express';
import { OrganizationModel } from '../../organizations/models/OrganizationModel';
import { BusinessModel } from '../../businesses/models/BusinessModel';
import { RoomTypeModel } from '../../rooms/models/RoomTypeModel';
import { WebsiteModel } from '../../websites/models/WebsiteModel';
import { UserModel } from '../../users/models/UserModel';

export class AdminController {
  public registerHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type, baseRoomPrice, email, phone, templateLayout } = req.body;
      const ownerId = req.user!.id; // Authenticated user ID (the super admin)

      // 1. Generate slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // 2. Create Organization
      const organization = await OrganizationModel.create({
        name,
        slug,
        ownerId,
        status: 'PENDING'
      });

      // 3. Update the admin user's organizations array to give them OWNER access
      await UserModel.findByIdAndUpdate(ownerId, {
        $push: {
          organizations: {
            organizationId: organization._id,
            role: 'OWNER'
          }
        }
      });

      // 4. Create Business Profile
      const business = await BusinessModel.create({
        organizationId: organization._id,
        name,
        slug,
        type,
        email,
        phone,
        address: 'To be updated', // Default values since form doesn't provide them
        city: 'To be updated',
        country: 'To be updated',
        currency: 'USD',
        timezone: 'UTC',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        status: 'PENDING'
      });

      // 5. Create Default Room Type
      await RoomTypeModel.create({
        organizationId: organization._id,
        businessId: business._id,
        name: 'Standard Room',
        capacity: 2,
        pricePerNight: baseRoomPrice,
        amenities: ['Wi-Fi', 'Air Conditioning']
      });

      // 6. Create Website Configuration
      await WebsiteModel.create({
        organizationId: organization._id,
        businessId: business._id,
        templateId: templateLayout,
        subdomain: slug,
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1d4ed8',
          font: 'sans',
          buttonStyle: 'rounded-md'
        },
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: 'Hero Banner',
            visible: true,
            content: {
              headline: `Welcome to ${name}`,
              subheadline: `A premier ${type.toLowerCase()} offering top-tier services.`,
              ctaText: 'Explore Rooms'
            }
          },
          {
            id: 'about',
            type: 'about',
            title: 'About Us',
            visible: true,
            content: {
              text: `Welcome to ${name}. We specialize in high-comfort hospitality.`
            }
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Hotel registered successfully',
        data: {
          organization,
          business
        }
      });
    } catch (error) {
      next(error);
    }
  };
  public getAllHotels = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const organizations = await OrganizationModel.find().lean();
      const businesses = await BusinessModel.find().lean();

      // Combine organization and business data for the response
      const hotels = organizations.map(org => {
        const business = businesses.find(b => b.organizationId.toString() === org._id.toString());
        return {
          organization: org,
          business: business || null
        };
      });

      res.status(200).json({
        success: true,
        data: hotels
      });
    } catch (error) {
      next(error);
    }
  };

  public approveHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params; // Expects Organization ID

      const organization = await OrganizationModel.findByIdAndUpdate(
        id,
        { status: 'ACTIVE' },
        { new: true }
      );

      if (!organization) {
        res.status(404).json({ success: false, message: 'Organization not found' });
        return;
      }

      await BusinessModel.findOneAndUpdate(
        { organizationId: id },
        { status: 'ACTIVE' },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Hotel approved successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
