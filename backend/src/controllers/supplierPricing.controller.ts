import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Bir tedarikçinin tüm hizmet fiyatlarını listele
export const getSupplierPricings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const pricings = await prisma.supplierPricing.findMany({
      where: {
        supplierId: parseInt(supplierId!),
        isActive: true,
      },
      orderBy: [
        { city: 'asc' },
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
    console.error('Get supplier pricings error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni hizmet fiyatı oluştur
export const createSupplierPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      city,
      serviceType,
      seasonName,
      startDate,
      endDate,
      price,
      currency,
      notes,
    } = req.body;

    // Validasyon
    if (!city || !serviceType || !seasonName || !startDate || !endDate || !price) {
      res.status(400).json({
        error: 'Şehir, hizmet tipi, sezon bilgileri ve fiyat zorunludur'
      });
      return;
    }

    // Geçerli service type'ları kontrol et
    const validServiceTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'ACTIVITY', 'OTHER'];
    if (!validServiceTypes.includes(serviceType)) {
      res.status(400).json({
        error: 'Geçersiz hizmet tipi. Seçenekler: BREAKFAST, LUNCH, DINNER, ACTIVITY, OTHER'
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

    const pricing = await prisma.supplierPricing.create({
      data: {
        supplierId: parseInt(supplierId!),
        city,
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
      message: 'Tedarikçi hizmet fiyatı başarıyla oluşturuldu',
      data: pricing,
    });
  } catch (error) {
    console.error('Create supplier pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Hizmet fiyatı güncelle
export const updateSupplierPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      city,
      serviceType,
      seasonName,
      startDate,
      endDate,
      price,
      currency,
      notes,
      isActive,
    } = req.body;

    const pricing = await prisma.supplierPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Service type validasyonu (eğer güncelleniyorsa)
    if (serviceType !== undefined) {
      const validServiceTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'ACTIVITY', 'OTHER'];
      if (!validServiceTypes.includes(serviceType)) {
        res.status(400).json({
          error: 'Geçersiz hizmet tipi. Seçenekler: BREAKFAST, LUNCH, DINNER, ACTIVITY, OTHER'
        });
        return;
      }
    }

    const updateData: any = {};

    if (city !== undefined) updateData.city = city;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (seasonName !== undefined) updateData.seasonName = seasonName;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPricing = await prisma.supplierPricing.update({
      where: { id: parseInt(id!) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Tedarikçi hizmet fiyatı başarıyla güncellendi',
      data: updatedPricing,
    });
  } catch (error) {
    console.error('Update supplier pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Hizmet fiyatı sil (soft delete)
export const deleteSupplierPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pricing = await prisma.supplierPricing.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!pricing) {
      res.status(404).json({ error: 'Fiyat bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.supplierPricing.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tedarikçi hizmet fiyatı başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete supplier pricing error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
