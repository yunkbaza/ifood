// src/components/Dashboard/MetricCard.tsx

import React from 'react';

// --- Ícones para os Cards (SVG como componentes) ---

const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const CancelIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9"x2="15" y2="15"></line></svg>
);


// --- Props do Componente ---

interface MetricCardProps {
  title: string;
  value: string;
  change?: string; // Ex: "+5.2%"
  variant?: 'primary' | 'secondary';
  icon: 'money' | 'orders' | 'delivered' | 'cancelled';
}

// Mapeia o nome do ícone para o componente SVG correspondente
const icons = {
  money: DollarSignIcon,
  orders: ShoppingBagIcon,
  delivered: CheckCircleIcon,
  cancelled: CancelIcon,
};


// --- Componente Principal do Card ---

export const MetricCard = ({ title, value, change, variant = 'secondary', icon }: MetricCardProps) => {
  const IconComponent = icons[icon];
  
  // Define os estilos com base na variante (primary ou secondary)
  const isPrimary = variant === 'primary';
  const cardClasses = isPrimary
    ? 'bg-ifood-red text-white'
    : 'bg-white text-ifood-black';
  const iconClasses = isPrimary ? 'text-white/70' : 'text-ifood-red';
  const changeClasses = isPrimary ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800';

  return (
    <div className={`rounded-lg p-6 shadow-md flex flex-col justify-between transition-transform transform hover:-translate-y-1 ${cardClasses}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className={`p-2 rounded-full ${isPrimary ? 'bg-white/20' : 'bg-ifood-red/10'}`}>
          <IconComponent className={iconClasses} />
        </div>
      </div>
      
      <div>
        <p className="text-4xl font-bold mt-4">{value}</p>
        {change && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-full mt-2 inline-block ${changeClasses}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};