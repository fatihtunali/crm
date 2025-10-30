import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir rehberin tüm fiyatlarını listele
export const getGuidePricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guideId } = req.params;

    const pricings = await prisma.guidePricing.findMany({
      where: {
        guideId: parseInt(guideId!),
        isActive: true,
      },
      orderBy: [
        { city: 'asc' },
        { language: 'asc' },
        { serviceType: 'asc' },
        { startDate: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: pricings.length,
      data: pricings,
    });
  } catch (error) {
    console.error('Get guide pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni fiyat oluştur
export const createGuidePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guideId } = req.params;
    const {
      city,
      language,
      serviceType,
      seasonName,
      startDate,
      endDate,
      price,
      currency,
      notes,
    } = req.body;

    // Validasyon
    if (!city || !language || !serviceType || !seasonName || !startDate || !endDate || !price) {
      res.status(400).json({
        error: 'Şehir, dil, hizmet tipi, sezon adı, tarihler ve fiyat zorunludur'
      });
      return;
    }

    // Geçerli service type'ları kontrol et
    const validServiceTypes = ['FULL_DAY', 'HALF_DAY', 'TRANSFER', 'NIGHT_SERVICE'];
    if (!validServiceTypes.includes(serviceType)) {
      res.status(400).json({
        error: 'Geçersiz hizmet tipi. Seçenekler: FULL_DAY, HALF_DAY, TRANSFER, NIGHT_SERVICE'
      });
      return;
    }

    // Rehber var mı kontrol et
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(guideId!) },
    });

    if (!guide) {
      res.status(404).json({ error: 'Rehber bulunamadı' });
      return;
    }

    const pricing = await prisma.guidePricing.create({
      data: {
        guideId: parseInt(guideId!),
        city,
        language: language.toUpperCase(), // EN, TR, DE, RU, AR...
        serviceType,
        seasonName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        currency: currency || 'EUR',
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Rehber fiyatı başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create guide pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fiyat güncelle
export const updateGuidePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      city,
      language,
      serviceType,
      seasonName,
      startDate,
      endDate,
      price,
      currency,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.guidePricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Service type validasyonu (eğer güncelleniyorsa)
    if (serviceType !== undefined) {
      const validServiceTypes = ['FULL_DAY', 'HALF_DAY', 'TRANSFER', 'NIGHT_SERVICE'];
      if (!validServiceTypes.includes(serviceType)) {
        res.status(400).json({
          error: 'Geçersiz hizmet tipi. Seçenekler: FULL_DAY, HALF_DAY, TRANSFER, NIGHT_SERVICE'
        });
        return;
      }
    }

    const updateData: any = {};

    if (city !== undefined) updateData.city = city;
    if (language !== undefined) updateData.language = language.toUpperCase();
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.guidePricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Rehber fiyatı başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update guide pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fiyat sil (soft delete)
export const deleteGuidePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.guidePricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.guidePricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Rehber fiyatı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete guide pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
