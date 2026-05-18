import bcrypt           from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/all
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id:        true,
        email:     true,
        fullName:  true,
        role:      true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/users/create-agent
export const createAgent = async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ message: 'Email et nom obligatoires.' });
  }

  try {
    const hashed = await bcrypt.hash(password || 'saa123', 10);
    const org    = await prisma.organization.findFirst();

    if (!org) {
      return res.status(500).json({ message: 'Aucune organisation trouvée en base.' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashed,
        role: 'AGENT',
        organization: { connect: { id: org.id } },
      },
    });

    res.json({
      id:       user.id,
      email:    user.email,
      fullName: user.fullName,
      role:     user.role,
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
    res.status(500).json({ message: e.message });
  }
};