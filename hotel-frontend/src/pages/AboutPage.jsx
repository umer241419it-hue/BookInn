import React from 'react';
import { Sparkles, Clock, CreditCard, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../components/Logo';

const AboutPage = () => {
  return (
    <div className="about-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1a2b3c 0%, #111d28 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          boxShadow: '0 8px 30px rgba(26, 43, 60, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Logo size="large" variant="light" />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Redefining Hospitality & Luxury Bookings
        </h1>
        <p
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6,
          }}
        >
          BookInn is a premier hotel management and reservation platform designed to deliver frictionless booking experiences, instant real-time room availability, and enterprise-grade payment verification.
        </p>
      </section>

      {/* Mission & Vision Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>🎯</span>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', margin: 0 }}>Our Mission</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            To simplify hospitality management for guests and hoteliers alike by offering transparent pricing, immediate availability updates, and guaranteed room reservations powered by modern cryptographic technology.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>👁️</span>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', margin: 0 }}>Our Vision</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            To become the benchmark SaaS platform for global luxury hotel stays, providing effortless date management, instant automated refunds, and seamless end-to-end guest satisfaction.
          </p>
        </div>
      </div>

      {/* Why Choose BookInn Feature Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', textAlign: 'center', marginBottom: '1.75rem' }}>
          Why Choose BookInn?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              Curated Luxury Stays
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Handpicked suites and rooms designed to provide exceptional comfort and premium hospitality.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              Real-Time Conflict Engine
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Smart date overlap validation ensures zero double bookings and permits same-day turnover.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              <CreditCard size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              Razorpay Payment Gateway
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Instant HMAC signature verification ensures 100% safe payments and immediate status confirmation.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              Automated Refunds & Control
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Hassle-free reservation cancellation with automated Razorpay refunds directly to original payment methods.
            </p>
          </div>
        </div>
      </section>

      {/* Support & Contact Section */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          Concierge & Support Information
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={18} style={{ color: 'var(--accent-color)' }} />
            <span>Support Email: <strong>support@bookinn.com</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Phone size={18} style={{ color: 'var(--accent-color)' }} />
            <span>Helpline: <strong>+91 (800) 123-4567</strong> (24/7 Concierge Service)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={18} style={{ color: 'var(--accent-color)' }} />
            <span>Headquarters: <strong>BookInn Towers, Hospitality Boulevard, Mumbai, India</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
