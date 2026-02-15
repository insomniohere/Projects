import { Shield, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface ProtectionStatusProps {
  protectionLevel: 'basic' | 'standard' | 'enhanced';
  status: 'protected' | 'vulnerable' | 'monitoring';
  className?: string;
}

const PROTECTION_CONFIG = {
  basic: {
    color: 'yellow',
    icon: AlertTriangle,
    label: 'Basic Protection',
    description: 'Standard watermark applied',
  },
  standard: {
    color: 'cyan',
    icon: CheckCircle,
    label: 'Standard Protection',
    description: 'Multiple watermarks + metadata',
  },
  enhanced: {
    color: 'green',
    icon: Shield,
    label: 'Enhanced Protection',
    description: 'Maximum protection with quality reduction',
  },
};

const STATUS_CONFIG = {
  protected: {
    color: 'green',
    label: 'Protected',
    description: 'No violations detected',
  },
  vulnerable: {
    color: 'red',
    label: 'Vulnerable',
    description: 'Potential violations found',
  },
  monitoring: {
    color: 'yellow',
    label: 'Monitoring',
    description: 'Actively monitoring for violations',
  },
};

export default function ProtectionStatus({
  protectionLevel,
  status,
  className = '',
}: ProtectionStatusProps) {
  const protection = PROTECTION_CONFIG[protectionLevel];
  const statusInfo = STATUS_CONFIG[status];
  const Icon = protection.icon;

  const colorClasses = {
    yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
    green: 'bg-green-500/20 border-green-500/50 text-green-400',
    red: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClasses[protection.color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{protection.label}</h3>
            <p className="text-sm text-white/70">{protection.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[statusInfo.color]}`}>
          {statusInfo.label}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Status</span>
          <span className="text-white">{statusInfo.description}</span>
        </div>
      </div>
    </div>
  );
}
