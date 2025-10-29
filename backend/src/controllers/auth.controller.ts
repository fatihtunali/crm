import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { AuthRequest } from '../middleware/auth';

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      res.status(400).json({ error: 'Email ve şifre gerekli' });
      return;
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Email veya şifre hatalı' });
      return;
    }

    // Aktif mi kontrol et
    if (!user.isActive) {
      res.status(403).json({ error: 'Hesabınız aktif değil' });
      return;
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Email veya şifre hatalı' });
      return;
    }

    // JWT token oluştur
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Kullanıcı bilgileri (şifre hariç)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.json({
      message: 'Giriş başarılı',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Register (Sadece SUPER_ADMIN veya ADMIN kullanabilir)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validasyon
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Tüm alanlar gerekli' });
      return;
    }

    // Email zaten var mı?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Bu email zaten kullanılıyor' });
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'OPERATOR',
      },
    });

    // Kullanıcı bilgileri (şifre hariç)
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    };

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userResponse,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mevcut kullanıcı bilgisi (token'dan)
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Yetkilendirme gerekli' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
