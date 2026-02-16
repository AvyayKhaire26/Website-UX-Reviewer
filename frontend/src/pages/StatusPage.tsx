import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useServices } from '../contexts/ServiceContext';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'not-checked';
  message: string;
  icon: string;
}

export const StatusPage: React.FC = () => {
  const { reviewService } = useServices();
  const [checking, setChecking] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Record<string, Date>>({});
  
  const [statuses, setStatuses] = useState<ServiceStatus[]>([
    {
      name: 'Backend API',
      status: 'not-checked',
      message: 'Click "Check" to verify',
      icon: '🖥️',
    },
    {
      name: 'Screenshot Service (Playwright)',
      status: 'not-checked',
      message: 'Click "Check" to verify',
      icon: '📸',
    },
    {
      name: 'Database',
      status: 'not-checked',
      message: 'Click "Check" to verify',
      icon: '💾',
    },
    {
      name: 'LLM (Google Gemini)',
      status: 'not-checked',
      message: 'Click "Check" to verify (uses API quota)',
      icon: '🤖',
    },
  ]);

  // Auto-check basic health on mount
  useEffect(() => {
    checkBasicHealth();
  }, []);

  const checkBasicHealth = async () => {
    setChecking('basic');
    
    try {
      const isHealthy = await reviewService.checkHealth();
      
      setStatuses(prev => prev.map(s => {
        if (s.name === 'Backend API') {
          return {
            ...s,
            status: isHealthy ? 'healthy' : 'unhealthy',
            message: isHealthy ? 'Connected and running' : 'Unable to connect',
          };
        }
        if (s.name === 'Screenshot Service (Playwright)') {
          return {
            ...s,
            status: isHealthy ? 'healthy' : 'unhealthy',
            message: isHealthy ? 'Playwright ready' : 'Playwright not available',
          };
        }
        return s;
      }));

      setLastChecked(prev => ({
        ...prev,
        backend: new Date(),
        screenshot: new Date(),
      }));
    } catch (error) {
      setStatuses(prev => prev.map(s => {
        if (s.name === 'Backend API' || s.name === 'Screenshot Service (Playwright)') {
          return {
            ...s,
            status: 'unhealthy',
            message: 'Connection failed',
          };
        }
        return s;
      }));
    }

    setChecking(null);
  };

  const checkLLMHealth = async () => {
    setChecking('llm');
    
    setStatuses(prev => prev.map(s =>
      s.name === 'LLM (Google Gemini)'
        ? { ...s, status: 'checking', message: 'Checking AI service...' }
        : s
    ));

    try {
      const result = await reviewService.checkLLMHealth();
      
      setStatuses(prev => prev.map(s =>
        s.name === 'LLM (Google Gemini)'
          ? {
              ...s,
              status: result.healthy ? 'healthy' : 'unhealthy',
              message: result.message,
            }
          : s
      ));

      setLastChecked(prev => ({ ...prev, llm: new Date() }));
    } catch (error) {
      setStatuses(prev => prev.map(s =>
        s.name === 'LLM (Google Gemini)'
          ? { ...s, status: 'unhealthy', message: 'Connection failed' }
          : s
      ));
    }

    setChecking(null);
  };

  const checkDatabaseHealth = async () => {
    setChecking('database');
    
    setStatuses(prev => prev.map(s =>
      s.name === 'Database'
        ? { ...s, status: 'checking', message: 'Checking database...' }
        : s
    ));

    try {
      const result = await reviewService.checkDatabaseHealth();
      
      setStatuses(prev => prev.map(s =>
        s.name === 'Database'
          ? {
              ...s,
              status: result.healthy ? 'healthy' : 'unhealthy',
              message: result.message,
            }
          : s
      ));

      setLastChecked(prev => ({ ...prev, database: new Date() }));
    } catch (error) {
      setStatuses(prev => prev.map(s =>
        s.name === 'Database'
          ? { ...s, status: 'unhealthy', message: 'Connection failed' }
          : s
      ));
    }

    setChecking(null);
  };

  const checkScreenshotHealth = async () => {
    setChecking('screenshot');
    
    setStatuses(prev => prev.map(s =>
      s.name === 'Screenshot Service (Playwright)'
        ? { ...s, status: 'checking', message: 'Checking Playwright...' }
        : s
    ));

    try {
      const result = await reviewService.checkScreenshotHealth();
      
      setStatuses(prev => prev.map(s =>
        s.name === 'Screenshot Service (Playwright)'
          ? {
              ...s,
              status: result.healthy ? 'healthy' : 'unhealthy',
              message: result.message,
            }
          : s
      ));

      setLastChecked(prev => ({ ...prev, screenshot: new Date() }));
    } catch (error) {
      setStatuses(prev => prev.map(s =>
        s.name === 'Screenshot Service (Playwright)'
          ? { ...s, status: 'unhealthy', message: 'Connection failed' }
          : s
      ));
    }

    setChecking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCheckButton = (serviceName: string) => {
    const serviceKey = serviceName.toLowerCase().replace(/[^a-z]/g, '');
    const isChecking = checking === serviceKey;

    let checkFunction;
    if (serviceName.includes('LLM')) {
      checkFunction = checkLLMHealth;
    } else if (serviceName.includes('Database')) {
      checkFunction = checkDatabaseHealth;
    } else if (serviceName.includes('Screenshot')) {
      checkFunction = checkScreenshotHealth;
    } else if (serviceName.includes('Backend')) {
      checkFunction = checkBasicHealth;
    }

    return (
      <Button
        variant="secondary"
        onClick={checkFunction}
        disabled={isChecking || checking !== null}
        loading={isChecking}
      >
        {isChecking ? 'Checking...' : 'Check'}
      </Button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-gray-600">
          Click "Check" button for each service to verify its health status
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {statuses.map((service) => {
          const serviceKey = service.name.toLowerCase().replace(/[^a-z]/g, '');
          const lastCheck = lastChecked[serviceKey];

          return (
            <Card key={service.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-4xl">{service.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">{service.message}</p>
                    {lastCheck && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last checked: {lastCheck.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full font-medium text-sm border ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status === 'not-checked' ? 'NOT CHECKED' : service.status.toUpperCase()}
                  </span>
                  {getCheckButton(service.name)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Warning Box for LLM */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              LLM Health Check Notice
            </h3>
            <p className="text-sm text-yellow-800">
              Checking LLM health uses API quota from Google Gemini free tier. 
              Only click "Check" when necessary to avoid rate limits.
            </p>
          </div>
        </div>
      </Card>

      {/* API Info */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">API Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Backend URL:</span>
            <span className="font-mono text-gray-800">
              {import.meta.env.BACKEND_API_URL || 'http://localhost:3000'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Environment:</span>
            <span className="font-mono text-gray-800">
              {import.meta.env.MODE}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">LLM Provider:</span>
            <span className="font-mono text-gray-800">Google Gemini (Free Tier)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
