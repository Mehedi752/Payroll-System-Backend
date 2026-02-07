import { Router } from 'express';
import prisma from '../config/database';
import { Request, Response } from 'express';

const router = Router();

// Get all settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findMany();
    
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.status(200).json({
      success: true,
      data: settingsObj
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Get setting by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;
    
    const setting = await prisma.settings.findUnique({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// Update or create setting
router.put('/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }
    
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

export default router;
