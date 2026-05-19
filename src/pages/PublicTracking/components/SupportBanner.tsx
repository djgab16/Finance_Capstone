import { Phone, Mail, HelpCircle } from 'lucide-react';
import './SupportBanner.css';

export default function SupportBanner() {
  return (
    <footer className="support-banner">
      <div className="support-content">
        <div className="support-icon-wrapper">
          <HelpCircle size={24} />
        </div>
        <div className="support-text">
          <h3>Need Help With Your Delivery?</h3>
          <p>Our customer support team is here to assist you with tracking or failed deliveries.</p>
        </div>
        
        <div className="support-contacts">
          <a href="tel:+18001234567" className="contact-btn">
            <Phone size={16} />
            <span>1-800-SPEEDEX</span>
          </a>
          <a href="mailto:support@speedex.com" className="contact-btn secondary">
            <Mail size={16} />
            <span>support@speedex.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
