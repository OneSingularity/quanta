'use client';

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  worker: boolean;
  supabase: boolean;
  kv: boolean;
  websockets: boolean;
}

export default function StatusBar() {
  const [status, setStatus] = useState<SystemStatus>({
    worker: false,
    supabase: false,
    kv: false,
    websockets: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const workerResponse = await fetch('/api/worker-proxy/health');
      const workerHealthy = workerResponse.ok;

      const versionResponse = await fetch('/api/worker-proxy/version');
      const versionData = workerHealthy && versionResponse.ok ? await versionResponse.json() : {};

      setStatus({
        worker: workerHealthy,
        supabase: versionData.supabase || false,
        kv: versionData.kv || false,
        websockets: workerHealthy, // Assume WS is healthy if worker is healthy
      });
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus({
        worker: false,
        supabase: false,
        kv: false,
        websockets: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (isHealthy: boolean) => {
    return isHealthy ? 'Operational' : 'Down';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-600">
              Checking system status...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allHealthy = Object.values(status).every(Boolean);

  return (
    <div className={`border-b border-gray-200 py-2 ${allHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.worker)}`}></div>
              <span className="text-sm text-gray-700">
                Worker: {getStatusText(status.worker)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.websockets)}`}></div>
              <span className="text-sm text-gray-700">
                Live Data: {getStatusText(status.websockets)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.supabase)}`}></div>
              <span className="text-sm text-gray-700">
                Database: {getStatusText(status.supabase)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.kv)}`}></div>
              <span className="text-sm text-gray-700">
                Cache: {getStatusText(status.kv)}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
