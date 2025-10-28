import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import GlassCard from '../components/GlassCard';

export default function Contact() {
  const { addContact } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    addContact({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
    });

    setFormData({
      name: '',
      phone: '',
      email: '',
      message: '',
      consent: false,
    });
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
          Contact Us
        </h1>
        <p className="text-xl text-gray-300">
          Get in touch with our support team for any questions or assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
          
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm">
                Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="input-field w-full resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="consent" className="text-sm text-gray-300">
                I consent to processing of my personal data for the purpose of responding to my inquiry. *
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 inline mr-2" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Contact Information */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
            <div className="space-y-4">
              
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-gray-300">support@suvarnachakram.com</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium text-white">Address</div>
                  <div className="text-gray-300">
                    Suvarna Chakram Lottery Department<br />
                    Thiruvananthapuram, Kerala
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </GlassCard>  

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Emergency Support</h3>
            <p className="text-gray-300 text-sm mb-4">
              For urgent lottery-related inquiries during business hours, 
              you can reach our emergency support line.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}