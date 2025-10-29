import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir otelin tüm fiyatlarını listele
export const getHotelPricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params;

    const pricings = await prisma.hotelPricing.findMany({
      where: { hotelId: parseInt(hotelId!) },
      orderBy: { startDate: 'desc' },
    });

    res.json({
      success: true,
      count: pricings.length,
      data: pricings,
    });
  } catch (error) {
    console.error('Get hotel pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni fiyat oluştur
export const createHotelPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params;
    const {
      seasonName,
      startDate,
      endDate,
      doubleRoomPrice,
      singleSupplement,
      tripleRoomPrice,
      child0to2Price,
      child3to5Price,
      child6to11Price,
      notes,
    } = req.body;

    // Validasyon
    if (!seasonName || !startDate || !endDate || !doubleRoomPrice) {
      res.status(400).json({ error: 'Sezon adı, tarihler ve double room fiyatı zorunludur' });
      return;
    }

    // Otel var mı kontrol et
    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId!) },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Otel bulunamadı' });
      return;
    }

    const pricing = await prisma.hotelPricing.create({
      data: {
        hotelId: parseInt(hotelId!),
        seasonName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        doubleRoomPrice: parseFloat(doubleRoomPrice),
        singleSupplement: parseFloat(singleSupplement || 0),
        tripleRoomPrice: parseFloat(tripleRoomPrice || 0),
        child0to2Price: parseFloat(child0to2Price || 0),
        child3to5Price: parseFloat(child3to5Price || 0),
        child6to11Price: parseFloat(child6to11Price || 0),
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Fiyat başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fiyat güncelle
export const updateHotelPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      seasonName,
      startDate,
      endDate,
      doubleRoomPrice,
      singleSupplement,
      tripleRoomPrice,
      child0to2Price,
      child3to5Price,
      child6to11Price,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.hotelPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    const updateData: any = {};

    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (doubleRoomPrice !== undefined) updateData.doubleRoomPrice = parseFloat(doubleRoomPrice);
    if (singleSupplement !== undefined) updateData.singleSupplement = parseFloat(singleSupplement);
    if (tripleRoomPrice !== undefined) updateData.tripleRoomPrice = parseFloat(tripleRoomPrice);
    if (child0to2Price !== undefined) updateData.child0to2Price = parseFloat(child0to2Price);
    if (child3to5Price !== undefined) updateData.child3to5Price = parseFloat(child3to5Price);
    if (child6to11Price !== undefined) updateData.child6to11Price = parseFloat(child6to11Price);
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.hotelPricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Fiyat başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fiyat sil
export const deleteHotelPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.hotelPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.hotelPricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Fiyat başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
