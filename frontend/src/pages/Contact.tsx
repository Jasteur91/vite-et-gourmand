import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MapPin, Phone } from 'lucide-react';
import { $ } from '../lib/api';

export function Contact() {
  const [email, setEmail] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await $.post('/contact', { email, titre, description });
      toast.success('Message envoyé. Nous vous répondrons rapidement.');
      setEmail(''); setTitre(''); setDescription('');
    } catch (e: any) {
      toast.error(e.message || 'Erreur d\'envoi');
    } finally { setSending(false); }
  }

  return (
    <div className="container-edit py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <span className="eyebrow">Contact</span>
        <h1 className="display text-display-xl text-cafe-900 mt-3">
          Une <em className="not-italic text-bordeaux-700">conversation</em>, simplement.
        </h1>
        <p className="mt-6 text-cafe-800 max-w-md leading-relaxed">
          Pour toute demande sur-mesure, devis personnalisé ou simple question, nous lisons chaque message.
          Réponse sous 24-48h ouvrées.
        </p>

        <ul className="mt-10 space-y-5">
          <li className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-creme-100 grid place-items-center text-bordeaux-700"><MapPin size={16} /></span>
            <div>
              <p className="eyebrow text-cafe-700 mb-1">Adresse</p>
              <p className="text-cafe-900">12 rue des Vendanges, 33000 Bordeaux</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-creme-100 grid place-items-center text-bordeaux-700"><Phone size={16} /></span>
            <div>
              <p className="eyebrow text-cafe-700 mb-1">Téléphone</p>
              <p className="text-cafe-900">05 56 00 00 00</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-creme-100 grid place-items-center text-bordeaux-700"><Mail size={16} /></span>
            <div>
              <p className="eyebrow text-cafe-700 mb-1">Email</p>
              <p className="text-cafe-900">contact@vite-et-gourmand.fr</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="lg:col-span-7">
        <form onSubmit={submit} className="card p-8 space-y-5">
          <div>
            <label className="label">Votre email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Sujet</label>
            <input required value={titre} onChange={(e) => setTitre(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" />
          </div>
          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? 'Envoi…' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </div>
  );
}
