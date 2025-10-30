import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// Get all tour packages for a supplier
export const getTourPackagesBySupplierId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const packages = await prisma.tourPackagePricing.findMany({
      where: {
        supplierId: parseInt(supplierId!),
        isActive: true,
      },
      orderBy: [
        { city: 'asc' },
        { packageName: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error('Get tour packages error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur paketleri alınırken hata oluştu',
    });
  }
};

// Get single tour package
export const getTourPackageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tourPackage = await prisma.tourPackagePricing.findUnique({
      where: { id: parseInt(id!) },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tourPackage) {
      res.status(404).json({
        success: false,
        error: 'Tur paketi bulunamadı',
      });
      return;
    }

    res.json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    console.error('Get tour package error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur paketi alınırken hata oluştu',
    });
  }
};

// Create tour package
export const createTourPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      packageName,
      city,
      duration,
      description,
      seasonName,
      startDate,
      endDate,
      adultPrice,
      child0to6Price,
      child7to12Price,
      studentPrice,
      includesLunch,
      includesEntrance,
      includesGuide,
      includesTransport,
      currency,
      notes,
    } = req.body;

    const tourPackage = await prisma.tourPackagePricing.create({
      data: {
        supplierId: parseInt(supplierId!),
        packageName,
        city,
        duration: parseInt(duration),
        description,
        seasonName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adultPrice,
        child0to6Price,
        child7to12Price,
        studentPrice,
        includesLunch: includesLunch || false,
        includesEntrance: includesEntrance || false,
        includesGuide: includesGuide || false,
        includesTransport: includesTransport || false,
        currency: currency || 'EUR',
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    console.error('Create tour package error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur paketi oluşturulurken hata oluştu',
    });
  }
};

// Update tour package
export const updateTourPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      packageName,
      city,
      duration,
      description,
      seasonName,
      startDate,
      endDate,
      adultPrice,
      child0to6Price,
      child7to12Price,
      studentPrice,
      includesLunch,
      includesEntrance,
      includesGuide,
      includesTransport,
      currency,
      notes,
      isActive,
    } = req.body;

    const updateData: any = {};

    if (packageName !== undefined) updateData.packageName = packageName;
    if (city !== undefined) updateData.city = city;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (description !== undefined) updateData.description = description;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (adultPrice !== undefined) updateData.adultPrice = adultPrice;
    if (child0to6Price !== undefined) updateData.child0to6Price = child0to6Price;
    if (child7to12Price !== undefined) updateData.child7to12Price = child7to12Price;
    if (studentPrice !== undefined) updateData.studentPrice = studentPrice;
    if (includesLunch !== undefined) updateData.includesLunch = includesLunch;
    if (includesEntrance !== undefined) updateData.includesEntrance = includesEntrance;
    if (includesGuide !== undefined) updateData.includesGuide = includesGuide;
    if (includesTransport !== undefined) updateData.includesTransport = includesTransport;
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const tourPackage = await prisma.tourPackagePricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    console.error('Update tour package error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur paketi güncellenirken hata oluştu',
    });
  }
};

// Delete tour package (soft delete)
export const deleteTourPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tourPackagePricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tur paketi silindi',
    });
  } catch (error) {
    console.error('Delete tour package error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur paketi silinirken hata oluştu',
    });
  }
};
