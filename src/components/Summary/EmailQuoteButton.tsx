// Email Quote button with PDF attachment
// Opens modal for user to enter email, then sends quote with PDF

import { useState } from 'react';
import { Mail, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { generateQuotePDF } from '../../lib/pdfGenerator';

export function EmailQuoteButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setIsSending(true);
    setStatus('idle');
    setErrorMessage('');
    
    try {
      // Generate PDF as blob
      const pdfBlob = await generateQuotePDF(
        layer,
        tier,
        locations,
        selectedModules,
        watchtowerModules,
        pricing
      );
      
      // Create FormData for backend submission
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('company', company);
      formData.append('locations', locations.toString());
      formData.append('tier', `${layer}-${tier}`);
      formData.append('monthly', pricing.total.toString());
      formData.append('annual', pricing.annualTotal.toString());
      formData.append('modules', selectedModules.join(','));
      formData.append('pdf', pdfBlob, `Sundae-Quote-${locations}loc.pdf`);
      
      // Send to backend API (you'll need to implement this endpoint)
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      setStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus('idle');
        setEmail('');
        setName('');
        setCompany('');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
      setErrorMessage('Failed to send email. Please try downloading the PDF instead.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="button-secondary flex items-center justify-center gap-2"
      >
        <Mail className="w-5 h-5" />
        Email Quote
      </button>
      
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !isSending && setIsModalOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Email Quote</h3>
                      <p className="text-sm text-slate-400">PDF will be attached</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isSending && setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                    disabled={isSending}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Quote Summary */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Your Quote</div>
                  <div className="text-2xl font-bold text-amber-400">
                    ${pricing.total.toLocaleString()}<span className="text-sm text-slate-400">/mo</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {locations} {locations === 1 ? 'location' : 'locations'} • {layer?.toUpperCase()} {tier}
                  </div>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="John Doe"
                      required
                      disabled={isSending}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="john@restaurant.com"
                      required
                      disabled={isSending}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">
                      Restaurant/Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="My Restaurant Group"
                      disabled={isSending}
                    />
                  </div>
                  
                  {/* Status Messages */}
                  {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4" />
                      <span>Quote sent successfully! Check your email.</span>
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="flex items-start gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                      disabled={isSending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Quote
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-500 text-center">
                    We'll email you a professional PDF quote with competitor comparisons
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
