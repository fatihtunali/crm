import { Request, Response } from 'express';
import { TURKISH_CITIES, CITIES_WITH_CODES } from '../constants/cities';

// Tüm Türk şehirlerini listele (sadece isimler)
export const getAllCities = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      count: TURKISH_CITIES.length,
      data: TURKISH_CITIES,
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Plaka kodlarıyla birlikte şehirleri listele
export const getCitiesWithCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      count: CITIES_WITH_CODES.length,
      data: CITIES_WITH_CODES,
    });
  } catch (error) {
    console.error('Get cities with codes error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
