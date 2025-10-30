import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir tedarikçinin tüm transfer fiyatlarını listele
export const getTransferPricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const pricings = await prisma.transferPricing.findMany({
      where: { supplierId: parseInt(supplierId!) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: pricings.length,
      data: pricings,
    });
  } catch (error) {
    console.error('Get transfer pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni transfer fiyatı oluştur
export const createTransferPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      vehicleType,
      fromLocation,
      toLocation,
      fromCity,
      toCity,
      price,
      currency,
      seasonName,
      startDate,
      endDate,
      notes,
    } = req.body;

    // Validasyon
    if (!vehicleType || !fromLocation || !toLocation || !fromCity || !toCity || !price) {
      res.status(400).json({
        error: 'Araç tipi, başlangıç/bitiş konumu ve şehirleri, fiyat zorunludur'
      });
      return;
    }

    // Tedarikçi var mı kontrol et
    const supplier = await prisma.vehicleSupplier.findUnique({
      where: { id: parseInt(supplierId!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    const pricing = await prisma.transferPricing.create({
      data: {
        supplierId: parseInt(supplierId!),
        vehicleType,
        fromLocation,
        toLocation,
        fromCity,
        toCity,
        price: parseFloat(price),
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
      message: 'Transfer fiyatı başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create transfer pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Transfer fiyatı güncelle
export const updateTransferPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      vehicleType,
      fromLocation,
      toLocation,
      fromCity,
      toCity,
      price,
      currency,
      seasonName,
      startDate,
      endDate,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.transferPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Transfer fiyatı bulunamadı' });
      return;
    }

    const updateData: any = {};

    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (fromLocation !== undefined) updateData.fromLocation = fromLocation;
    if (toLocation !== undefined) updateData.toLocation = toLocation;
    if (fromCity !== undefined) updateData.fromCity = fromCity;
    if (toCity !== undefined) updateData.toCity = toCity;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency !== undefined) updateData.currency = currency;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.transferPricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Transfer fiyatı başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update transfer pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Transfer fiyatı sil
export const deleteTransferPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.transferPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Transfer fiyatı bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.transferPricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Transfer fiyatı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete transfer pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
