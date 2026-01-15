
//import React from 'react';

export const BrandLogos = {
  Walmart: () => (
    <div className="flex items-center gap-2">
      <span className="text-zinc-300 font-bold text-xl">Walmart</span>
      <div className="flex gap-0.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-4 bg-yellow-400 rounded-full rotate-[30deg] transform origin-bottom" style={{ transform: `rotate(${i * 60}deg)` }}></div>
        ))}
      </div>
    </div>
  ),
  Microsoft: () => (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-2 gap-0.5">
        <div className="w-2.5 h-2.5 bg-[#f25022]"></div>
        <div className="w-2.5 h-2.5 bg-[#7fba00]"></div>
        <div className="w-2.5 h-2.5 bg-[#00a4ef]"></div>
        <div className="w-2.5 h-2.5 bg-[#ffb900]"></div>
      </div>
      <span className="text-zinc-400 font-semibold text-lg">Microsoft</span>
    </div>
  ),
  Airbnb: () => (
    <div className="flex items-center gap-2">
      <svg className="w-6 h-6 text-[#ff5a5f]" fill="currentColor" viewBox="0 0 32 32">
        <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.392 3.415-6.701 3.415-3.477 0-6.357-2.416-6.357-6.478v-.228l.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.062 12.426-7.043 14.711-.634 1.512-.83 2.257-.872 3.022L4.57 24.31l.005.122c.002 2.96 2.056 4.546 4.357 4.546 1.761 0 3.791-1.126 5.828-3.265l.504-.54.26-.282.476.51c2.028 2.146 4.043 3.344 5.823 3.344 2.301 0 4.357-1.586 4.357-4.546l.005-.122-.005-.359c-.042-.765-.238-1.51-.872-3.022-1.01-2.355-5.188-11.1-7.043-14.711l-.523-1.008C18.053 3.539 17.24 3 16 3zm.01 10.316c-2.01 0-3.691 1.806-3.691 3.983 0 2.176 1.681 3.982 3.691 3.982s3.691-1.806 3.691-3.982c0-2.177-1.68-3.983-3.691-3.983zm0 2c1.006 0 1.691.808 1.691 1.983 0 1.175-.685 1.982-1.691 1.982s-1.691-.807-1.691-1.982c0-1.175.685-1.983 1.691-1.983z" />
      </svg>
      <span className="text-[#ff5a5f] font-bold text-xl tracking-tighter">airbnb</span>
    </div>
  ),
  FedEx: () => (
    <div className="flex items-center font-black text-2xl">
      <span className="text-[#4D148C]">Fed</span>
      <span className="text-[#FF6600]">Ex</span>
    </div>
  ),
  Google: () => (
    <div className="flex items-center gap-0.5 font-semibold text-xl">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </div>
  ),
  Amazon: () => (
    <div className="flex flex-col items-center leading-none">
      <span className="text-zinc-300 font-bold text-xl">amazon</span>
      <svg className="w-12 h-2 text-[#FF9900]" viewBox="0 0 100 20">
        <path d="M5 5 Q50 20 95 5" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M90 2 L96 6 L90 10" fill="currentColor" />
      </svg>
    </div>
  ),
  HubSpot: () => (
    <div className="flex items-center gap-1">
      <svg className="w-5 h-5 text-[#FF7A59]" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
      <span className="text-zinc-400 font-bold">HubSpot</span>
    </div>
  ),
  Huawei: () => (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-1 h-4 bg-[#ED1C24] rounded-full" style={{ transform: `rotate(${i * 45}deg) translateY(-2px)` }}></div>
        ))}
      </div>
      <span className="text-zinc-400 font-bold tracking-widest text-sm">HUAWEI</span>
    </div>
  ),
  BookMyShow: () => (
    <div className="flex items-center gap-1">
      <span className="text-zinc-500 text-xs">book</span>
      <div className="bg-[#EF344F] text-white text-[10px] font-bold px-1 py-0.5 rounded rotate-[-10deg]">my</div>
      <span className="text-zinc-500 text-xs">show</span>
    </div>
  ),
  Adobe: () => (
    <div className="flex items-center gap-2">
      <svg className="w-6 h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.58 3H22V19.5L14.58 3ZM9.42 3H2V19.5L9.42 3ZM12 9.147L17.208 21H14.802L13.464 17.859H10.536L9.198 21H6.792L12 9.147Z" />
      </svg>
      <span className="text-[#FF0000] font-bold">Adobe</span>
    </div>
  ),
  Shopify: () => (
    <div className="flex items-center gap-2">
      <svg className="w-6 h-6 text-[#95BF47]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.5 6.5s-2.5 0-3.5-1c-.8-.8-1-2.5-1-2.5h-8s-.2 1.7-1 2.5c-1 1-3.5 1-3.5 1v12s2.5 0 3.5 1c.8.8 1 2.5 1 2.5h8s.2-1.7 1-2.5c1-1 3.5-1 3.5-1v-12z" />
      </svg>
      <span className="text-zinc-300 font-semibold italic">shopify</span>
    </div>
  ),
  Ola: () => (
    <div className="flex items-center gap-1">
      <div className="w-6 h-6 rounded-full border-4 border-zinc-700 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
      </div>
      <span className="text-zinc-400 font-black italic text-xl">OLA</span>
    </div>
  ),
};
