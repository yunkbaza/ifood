import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface AlertProps {
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ message }) => (
  <div className="flex items-center p-4 mb-6 bg-red-100 border border-red-200 rounded-md text-ifood-black">
    <AlertTriangle className="w-5 h-5 text-ifood-red mr-2" />
    <span className="text-sm">{message}</span>
  </div>
);

