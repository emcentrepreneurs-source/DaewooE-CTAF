import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getAllTravelers, saveTravelers, deleteTravelerById, clearAllTravelers } from './src/db/travelers.ts';
import { getAllUsers, createUser, deleteUserById, deleteUserByUid, getOrCreateUser } from './src/db/users.ts';
import { scanIdOrPassport } from './src/server/idScanner.ts';
import { createDocuPassSession } from './src/server/idAnalyzer.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Seed default admin user on startup
  try {
    await getOrCreateUser('AdminE&C', 'ericstamarais@gmail.com', 'Eric Matola (Admin)', 'admin');
  } catch (err) {
    console.warn('Initial admin user seed notice:', err);
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CCS JV TAF Portal',
      database: 'Cloud SQL PostgreSQL / Supabase Compatible',
      timestamp: new Date().toISOString(),
    });
  });

  // Export Supabase Migration SQL
  app.get('/api/migrations/sql', (req, res) => {
    try {
      const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260820000000_create_taf_tables.sql');
      if (fs.existsSync(migrationPath)) {
        const content = fs.readFileSync(migrationPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(content);
      }
      res.status(404).json({ error: 'Migration file not found' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // List all users
  app.get('/api/users', async (req, res) => {
    try {
      const usersList = await getAllUsers();
      res.json(usersList);
    } catch (error: any) {
      console.error('Error in GET /api/users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  // Create / Add User
  app.post('/api/users', async (req, res) => {
    try {
      const { uid, email, displayName, role } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Username/UID and Email are required' });
      }
      const newUser = await createUser({
        uid: uid.trim(),
        email: email.trim(),
        displayName: displayName ? displayName.trim() : uid.trim(),
        role: role || 'user',
      });
      res.json({ success: true, user: newUser });
    } catch (error: any) {
      console.error('Error in POST /api/users:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  });

  // Delete User
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        await deleteUserById(numId);
      } else {
        await deleteUserByUid(id);
      }
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Error in DELETE /api/users/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  });

  // User Sync
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const { uid, email, displayName, role } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateUser(uid, email, displayName, role);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error in /api/auth/sync:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // Get Travelers
  app.get('/api/travelers', async (req, res) => {
    try {
      const userUid = req.query.userUid as string | undefined;
      const records = await getAllTravelers(userUid);
      res.json(records);
    } catch (error: any) {
      console.error('Error in GET /api/travelers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch travelers' });
    }
  });

  // Save / Batch Upsert Travelers
  app.post('/api/travelers', async (req, res) => {
    try {
      const { travelers: records, userUid } = req.body;
      if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Expected an array of travelers' });
      }
      const saved = await saveTravelers(records, userUid);
      res.json({ success: true, count: saved.length, data: saved });
    } catch (error: any) {
      console.error('Error in POST /api/travelers:', error);
      res.status(500).json({ error: error.message || 'Failed to save travelers' });
    }
  });

  // Delete single traveler
  app.delete('/api/travelers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteTravelerById(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Error in DELETE /api/travelers/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to delete traveler' });
    }
  });

  // Clear travelers
  app.post('/api/travelers/clear', async (req, res) => {
    try {
      const { userUid } = req.body;
      await clearAllTravelers(userUid);
      res.json({ success: true, message: 'All travelers cleared' });
    } catch (error: any) {
      console.error('Error in POST /api/travelers/clear:', error);
      res.status(500).json({ error: error.message || 'Failed to clear travelers' });
    }
  });

  // AI & Optical Scan for Passport / National ID Card (Gemini Vision + ID Analyzer Global 190+ Engine)
  app.post('/api/scan-id', async (req, res) => {
    try {
      const { image, mimeType, provider, idAnalyzerKey } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image base64 payload is required' });
      }
      const extracted = await scanIdOrPassport(image, mimeType || 'image/jpeg', {
        provider,
        idAnalyzerKey
      });
      res.json({ success: true, data: extracted });
    } catch (error: any) {
      console.error('Error in POST /api/scan-id:', error);
      res.status(500).json({ error: error.message || 'Failed to extract ID information' });
    }
  });

  // Batch Scan multiple IDs / Passports
  app.post('/api/scan-id/batch', async (req, res) => {
    try {
      const { images, provider, idAnalyzerKey } = req.body;
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'Images array is required' });
      }
      const results = [];
      for (const item of images) {
        const imgData = typeof item === 'string' ? item : item.image;
        const mime = typeof item === 'object' && item.mimeType ? item.mimeType : 'image/jpeg';
        const fileName = typeof item === 'object' && item.name ? item.name : undefined;
        try {
          const extracted = await scanIdOrPassport(imgData, mime, {
            provider,
            idAnalyzerKey
          });
          results.push({ ...extracted, sourceFile: fileName });
        } catch (err: any) {
          results.push({ error: err.message, sourceFile: fileName });
        }
      }
      res.json({ success: true, count: results.length, data: results });
    } catch (error: any) {
      console.error('Error in POST /api/scan-id/batch:', error);
      res.status(500).json({ error: error.message || 'Failed to process batch scans' });
    }
  });

  // DocuPass Hosted Mobile Flow Session Trigger
  app.post('/api/docupass/session', async (req, res) => {
    try {
      const { idAnalyzerKey, returnUrl } = req.body;
      const session = await createDocuPassSession(idAnalyzerKey, returnUrl);
      res.json(session);
    } catch (error: any) {
      console.error('Error in POST /api/docupass/session:', error);
      res.status(500).json({ error: error.message || 'Failed to create DocuPass session' });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TAF Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
