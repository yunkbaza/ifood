import React from 'react';

const IfoodBanner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#EA1D2C] py-8 px-6 rounded-xl shadow-2xl mb-10 border-4 border-white">
      <img
        src="https://logodownload.org/wp-content/uploads/2019/10/ifood-logo-1.png"
        alt="iFood Logo"
        className="h-16 mb-4 drop-shadow-xl"
      />
      <h1 className="text-white text-4xl font-extrabold tracking-widest mb-2">
        API iFood
      </h1>
      <span className="text-white text-lg font-medium bg-black bg-opacity-20 px-4 py-1 rounded-full shadow">
        Plataforma de integração e análise de pedidos
      </span>
    </div>
  );
};

export default IfoodBanner;
