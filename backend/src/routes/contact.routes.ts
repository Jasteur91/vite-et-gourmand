import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../services/audit.service.js';
import { emailService } from '../services/email.service.js';
import { env } from '../config/env.js';

const router = Router();

const contactSchema = z.object({
  email: z.string().email(),
  titre: z.string().min(2).max(150),
  description: z.string().min(5).max(5000),
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = contactSchema.parse(req.body);
    const { data: created, error } = await supabase
      .from('contact_message').insert(body).select('contact_id').single();
    if (error || !created) throw new Error(error?.message || 'Envoi échoué');

    await audit.logContact({ contact_id: created.contact_id, email: body.email, titre: body.titre });
    // Mail à l'entreprise
    void emailService.contactReceived(env.RESEND_FROM, { titre: body.titre, description: body.description, from: body.email });
    res.status(201).json({ ok: true, contact_id: created.contact_id });
  }),
);

export default router;
