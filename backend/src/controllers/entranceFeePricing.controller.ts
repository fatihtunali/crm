import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir tedarikçinin tüm giriş ücreti fiyatlarını listele
export const getEntranceFeePricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const pricings = await prisma.entranceFeePricing.findMany({
      where: {
        supplierId: parseInt(supplierId!),
        isActive: true,
      },
      orderBy: [
        { city: 'asc' },
        { startDate: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: pricings.length,
      data: pricings,
    });
  } catch (error) {
    console.error('Get entrance fee pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni giriş ücreti fiyatı oluştur
export const createEntranceFeePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      city,
      seasonName,
      startDate,
      endDate,
      adultPrice,
      child0to6Price,
      child7to12Price,
      studentPrice,
      currency,
      notes,
    } = req.body;

    // Validasyon
    if (!city || !seasonName || !startDate || !endDate ||
        adultPrice === undefined || child0to6Price === undefined ||
        child7to12Price === undefined || studentPrice === undefined) {
      res.status(400).json({
        error: 'Şehir, sezon bilgileri ve tüm fiyat kategorileri zorunludur'
      });
      return;
    }

    // Tedarikçi var mı kontrol et
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(supplierId!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    const pricing = await prisma.entranceFeePricing.create({
      data: {
        supplierId: parseInt(supplierId!),
        city,
        seasonName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adultPrice: parseFloat(adultPrice),
        child0to6Price: parseFloat(child0to6Price),
        child7to12Price: parseFloat(child7to12Price),
        studentPrice: parseFloat(studentPrice),
        currency: currency || 'EUR',
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Giriş ücreti fiyatı başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create entrance fee pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Giriş ücreti fiyatı güncelle
export const updateEntranceFeePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      city,
      seasonName,
      startDate,
      endDate,
      adultPrice,
      child0to6Price,
      child7to12Price,
      studentPrice,
      currency,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.entranceFeePricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    const updateData: any = {};

    if (city !== undefined) updateData.city = city;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (adultPrice !== undefined) updateData.adultPrice = parseFloat(adultPrice);
    if (child0to6Price !== undefined) updateData.child0to6Price = parseFloat(child0to6Price);
    if (child7to12Price !== undefined) updateData.child7to12Price = parseFloat(child7to12Price);
    if (studentPrice !== undefined) updateData.studentPrice = parseFloat(studentPrice);
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.entranceFeePricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Giriş ücreti fiyatı başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update entrance fee pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Giriş ücreti fiyatı sil (soft delete)
export const deleteEntranceFeePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.entranceFeePricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.entranceFeePricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Giriş ücreti fiyatı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete entrance fee pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
