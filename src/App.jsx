import React from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import PokemonGuesser from '@/components/PokemonGuesser';

function App() {
  return (
    <>
      <Helmet>
        <title>¿Quién es ese Pokémon?</title>
        <meta name="description" content="Un divertido juego para adivinar Pokémon por su silueta." />
      </Helmet>
      <main className="min-h-screen w-full bg-[#0d1031] text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 -z-20 h-full w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900" />
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#a5b4fc_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
        <PokemonGuesser />
        <Toaster />
      </main>
    </>
  );
}

export default App;