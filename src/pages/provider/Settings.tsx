import React from 'react';
import { SettingsManager } from '@/components/provider/SettingsManager';
import { EnhancedErrorBoundary } from '@/components/ui/error-boundary-enhanced';

export default function Settings() {
  return (
    <EnhancedErrorBoundary>
      <SettingsManager />
    </EnhancedErrorBoundary>
  );
}