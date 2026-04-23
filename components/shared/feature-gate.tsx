"use client";

import React, { useState, useEffect } from "react";
import { Lock, X, Zap, Star, Crown, ArrowRight, CheckCircle2 } from "lucide-react";
import { hasAccess, TIER_METADATA, type UserTier } from "@/constants/permissions";
import { useRouter } from "next/navigation";

// ─── Upsell Modal ──────────────────────────────────────────────────────────────

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: UserTier;
  featureName: string;
}

const TIER_ICONS: Record<UserTier, React.ReactNode> = {
  FREE:   <Zap className="h-5 w-5" />,
  ELITE:  <Star className="h-5 w-5" />,
  MASTER: <Crown className="h-5 w-5" />,
};

export function UpsellModal({ isOpen, onClose, requiredTier, featureName }: UpsellModalProps) {
  const router = useRouter();
  const meta = TIER_METADATA[requiredTier];

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="sipns-upsell-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sipns-upsell-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="sipns-upsell-close"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="sipns-upsell-header">
          <div className={`sipns-upsell-tier-badge sipns-upsell-tier-${requiredTier.toLowerCase()}`}>
            {TIER_ICONS[requiredTier]}
            <span>{meta.label}</span>
          </div>
          <div className="sipns-upsell-lock-icon">
            <Lock className="h-8 w-8" />
          </div>
          <h2 id="upsell-modal-title" className="sipns-upsell-title">
            Fitur Terkunci
          </h2>
          <p className="sipns-upsell-subtitle">
            Maaf, fitur{" "}
            <strong className="sipns-upsell-feature-name">{featureName}</strong>{" "}
            hanya tersedia untuk member{" "}
            <strong className={`sipns-upsell-tier-name sipns-upsell-tier-name-${requiredTier.toLowerCase()}`}>
              {meta.label}
            </strong>
            .
          </p>
        </div>

        {/* Benefits */}
        <div className="sipns-upsell-benefits">
          <p className="sipns-upsell-benefits-title">
            Yang kamu dapatkan dengan {meta.label}:
          </p>
          <ul className="sipns-upsell-benefits-list">
            {meta.benefits.map((benefit) => (
              <li key={benefit} className="sipns-upsell-benefit-item">
                <CheckCircle2 className={`sipns-upsell-check-icon sipns-upsell-tier-${requiredTier.toLowerCase()}-text`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="sipns-upsell-price-row">
          <span className="sipns-upsell-price-label">Mulai dari</span>
          <span className={`sipns-upsell-price sipns-upsell-tier-${requiredTier.toLowerCase()}-text`}>
            {meta.price}
          </span>
        </div>

        {/* CTA */}
        <div className="sipns-upsell-cta-group">
          <button
            onClick={() => router.push(`/dashboard/pembelian?plan=${requiredTier.toLowerCase()}`)}
            className={`sipns-upsell-cta-btn sipns-upsell-cta-${requiredTier.toLowerCase()}`}
          >
            Upgrade ke {meta.label}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="sipns-upsell-cta-secondary">
            Nanti saja
          </button>
        </div>
      </div>

      <style>{`
        .sipns-upsell-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: sipns-fade-in 0.2s ease;
        }
        @keyframes sipns-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .sipns-upsell-card {
          position: relative;
          background: #0f1117;
          border: 1px solid #1e2433;
          border-radius: 1.25rem;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
          animation: sipns-slide-up 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes sipns-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sipns-upsell-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e2433;
          border: none;
          border-radius: 50%;
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .sipns-upsell-close:hover { background: #2d3748; color: #fff; }
        .sipns-upsell-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .sipns-upsell-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          margin-bottom: 1rem;
        }
        .sipns-upsell-tier-elite   { background: rgba(13,148,136,0.15); color: #2dd4bf; border: 1px solid rgba(13,148,136,0.3); }
        .sipns-upsell-tier-master  { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
        .sipns-upsell-tier-free    { background: rgba(100,116,139,0.15); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }
        .sipns-upsell-lock-icon {
          width: 4rem;
          height: 4rem;
          background: #1e2433;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #64748b;
        }
        .sipns-upsell-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.5rem;
        }
        .sipns-upsell-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
        }
        .sipns-upsell-feature-name { color: #f1f5f9; }
        .sipns-upsell-tier-name-elite  { color: #2dd4bf; }
        .sipns-upsell-tier-name-master { color: #fbbf24; }
        .sipns-upsell-benefits {
          background: #131821;
          border: 1px solid #1e2433;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.25rem;
        }
        .sipns-upsell-benefits-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.75rem;
        }
        .sipns-upsell-benefits-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sipns-upsell-benefit-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        .sipns-upsell-check-icon {
          flex-shrink: 0;
          width: 1rem;
          height: 1rem;
        }
        .sipns-upsell-tier-elite-text  { color: #2dd4bf; }
        .sipns-upsell-tier-master-text { color: #fbbf24; }
        .sipns-upsell-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0 0.25rem;
        }
        .sipns-upsell-price-label { font-size: 0.875rem; color: #64748b; }
        .sipns-upsell-price {
          font-size: 1.125rem;
          font-weight: 700;
        }
        .sipns-upsell-cta-group {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .sipns-upsell-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.625rem;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          width: 100%;
          color: #fff;
        }
        .sipns-upsell-cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .sipns-upsell-cta-btn:active { transform: translateY(0); }
        .sipns-upsell-cta-elite  { background: linear-gradient(135deg, #1E73BE, #0F4FA8); box-shadow: 0 4px 20px rgba(13,148,136,0.35); }
        .sipns-upsell-cta-master { background: linear-gradient(135deg, #d97706, #b45309); box-shadow: 0 4px 20px rgba(217,119,6,0.35); }
        .sipns-upsell-cta-secondary {
          background: transparent;
          border: 1px solid #1e2433;
          border-radius: 0.625rem;
          padding: 0.625rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          width: 100%;
        }
        .sipns-upsell-cta-secondary:hover { color: #94a3b8; border-color: #2d3748; }
      `}</style>
    </div>
  );
}

// ─── Feature Gate ──────────────────────────────────────────────────────────────

interface FeatureGateProps {
  /** Minimum tier required to see the children */
  requiredTier: UserTier;
  /** Current authenticated user's tier */
  userTier: UserTier;
  /** Human-readable name shown in the upsell modal */
  featureName: string;
  /** Children to render when user has access */
  children: React.ReactNode;
  /**
   * Custom fallback to render instead of the default locked overlay.
   * If omitted, renders a blurred children + Lock overlay + upsell modal trigger.
   */
  fallback?: React.ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/**
 * <FeatureGate /> — UI-level access control HOC.
 *
 * When user's tier is insufficient:
 * - Renders a blurred version of children with a Lock overlay
 * - Opens professional Upsell Modal on click
 * - Shows "Upgrade to [Tier]" CTA
 */
export function FeatureGate({
  requiredTier,
  userTier,
  featureName,
  children,
  fallback,
  className = "",
}: FeatureGateProps) {
  const [showModal, setShowModal] = useState(false);
  const canAccess = hasAccess(userTier, requiredTier);

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const meta = TIER_METADATA[requiredTier];

  return (
    <>
      <div
        className={`sipns-feature-gate ${className}`}
        onClick={() => setShowModal(true)}
        role="button"
        tabIndex={0}
        aria-label={`Fitur terkunci. Upgrade ke ${meta.label} untuk mengakses.`}
        onKeyDown={(e) => e.key === "Enter" && setShowModal(true)}
      >
        {/* Blurred content */}
        <div className="sipns-gate-blur" aria-hidden="true">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="sipns-gate-overlay">
          <div className="sipns-gate-overlay-card">
            <div className={`sipns-gate-tier-icon sipns-gate-tier-${requiredTier.toLowerCase()}`}>
              {requiredTier === "MASTER" ? (
                <Crown className="h-7 w-7" />
              ) : (
                <Star className="h-7 w-7" />
              )}
            </div>
            <Lock className="sipns-gate-lock" />
            <p className="sipns-gate-label">
              Khusus Member{" "}
              <span className={`sipns-gate-tier-text sipns-gate-tier-text-${requiredTier.toLowerCase()}`}>
                {meta.label}
              </span>
            </p>
            <button
              className={`sipns-gate-btn sipns-gate-btn-${requiredTier.toLowerCase()}`}
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            >
              Upgrade ke {meta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <UpsellModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredTier={requiredTier}
        featureName={featureName}
      />

      <style>{`
        .sipns-feature-gate {
          position: relative;
          cursor: pointer;
          border-radius: inherit;
          overflow: hidden;
        }
        .sipns-gate-blur {
          filter: blur(4px);
          pointer-events: none;
          user-select: none;
          opacity: 0.4;
        }
        .sipns-gate-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(9, 11, 17, 0.5);
          backdrop-filter: blur(2px);
          border-radius: inherit;
        }
        .sipns-gate-overlay-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 2rem;
          background: rgba(15, 17, 23, 0.9);
          border: 1px solid #1e2433;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          text-align: center;
          max-width: 280px;
        }
        .sipns-gate-tier-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }
        .sipns-gate-tier-elite  { background: rgba(13,148,136,0.15); color: #2dd4bf; }
        .sipns-gate-tier-master { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .sipns-gate-lock {
          width: 1.5rem;
          height: 1.5rem;
          color: #475569;
          margin-bottom: 0.25rem;
        }
        .sipns-gate-label {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }
        .sipns-gate-tier-text { font-weight: 700; }
        .sipns-gate-tier-text-elite  { color: #2dd4bf; }
        .sipns-gate-tier-text-master { color: #fbbf24; }
        .sipns-gate-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          color: #fff;
          transition: opacity 0.15s, transform 0.15s;
        }
        .sipns-gate-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .sipns-gate-btn-elite  { background: #1E73BE; }
        .sipns-gate-btn-master { background: #d97706; }
        .sipns-gate-btn-free   { background: #475569; }
      `}</style>
    </>
  );
}
