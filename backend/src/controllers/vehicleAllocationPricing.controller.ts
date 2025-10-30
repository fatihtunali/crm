import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir tedarikçinin tüm tahsis fiyatlarını listele
export const getAllocationPricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const pricings = await prisma.vehicleAllocationPricing.findMany({
      where: { supplierId: parseInt(supplierId!) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: pricings.length,
      data: pricings,
    });
  } catch (error) {
    console.error('Get allocation pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni tahsis fiyatı oluştur
export const createAllocationPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      vehicleType,
      city,
      allocationType,
      basePrice,
      baseHours,
      extraHourPrice,
      packageDays,
      packagePrice,
      extraDayPrice,
      currency,
      seasonName,
      startDate,
      endDate,
      notes,
    } = req.body;

    // Validasyon
    if (!vehicleType || !city || !allocationType) {
      res.status(400).json({
        error: 'Araç tipi, şehir ve tahsis tipi zorunludur'
      });
      return;
    }

    // Tahsis tipine göre validasyon
    if (allocationType === 'PACKAGE_TOUR') {
      if (!packageDays || !packagePrice) {
        res.status(400).json({
          error: 'Paket tur için gün sayısı ve fiyat zorunludur'
        });
        return;
      }
    } else {
      // FULL_DAY, HALF_DAY, NIGHT_SERVICE
      if (!basePrice || !baseHours) {
        res.status(400).json({
          error: 'Baz fiyat ve saat zorunludur'
        });
        return;
      }
    }

    // Tedarikçi var mı kontrol et
    const supplier = await prisma.vehicleSupplier.findUnique({
      where: { id: parseInt(supplierId!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    const pricing = await prisma.vehicleAllocationPricing.create({
      data: {
        supplierId: parseInt(supplierId!),
        vehicleType,
        city,
        allocationType,
        basePrice: basePrice ? parseFloat(basePrice) : null,
        baseHours: baseHours ? parseInt(baseHours) : null,
        extraHourPrice: extraHourPrice ? parseFloat(extraHourPrice) : null,
        packageDays: packageDays ? parseInt(packageDays) : null,
        packagePrice: packagePrice ? parseFloat(packagePrice) : null,
        extraDayPrice: extraDayPrice ? parseFloat(extraDayPrice) : null,
        currency: currency || 'EUR',
        seasonName: seasonName || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tahsis fiyatı başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create allocation pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tahsis fiyatı güncelle
export const updateAllocationPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      vehicleType,
      city,
      allocationType,
      basePrice,
      baseHours,
      extraHourPrice,
      packageDays,
      packagePrice,
      extraDayPrice,
      currency,
      seasonName,
      startDate,
      endDate,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.vehicleAllocationPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Tahsis fiyatı bulunamadı' });
      return;
    }

    const updateData: any = {};

    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (city !== undefined) updateData.city = city;
    if (allocationType !== undefined) updateData.allocationType = allocationType;
    if (basePrice !== undefined) updateData.basePrice = basePrice ? parseFloat(basePrice) : null;
    if (baseHours !== undefined) updateData.baseHours = baseHours ? parseInt(baseHours) : null;
    if (extraHourPrice !== undefined) updateData.extraHourPrice = extraHourPrice ? parseFloat(extraHourPrice) : null;
    if (packageDays !== undefined) updateData.packageDays = packageDays ? parseInt(packageDays) : null;
    if (packagePrice !== undefined) updateData.packagePrice = packagePrice ? parseFloat(packagePrice) : null;
    if (extraDayPrice !== undefined) updateData.extraDayPrice = extraDayPrice ? parseFloat(extraDayPrice) : null;
    if (currency !== undefined) updateData.currency = currency;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.vehicleAllocationPricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Tahsis fiyatı başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update allocation pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tahsis fiyatı sil
export const deleteAllocationPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.vehicleAllocationPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Tahsis fiyatı bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.vehicleAllocationPricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tahsis fiyatı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete allocation pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
