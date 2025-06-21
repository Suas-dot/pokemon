import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Star, XCircle, Heart, Play, Pause } from 'lucide-react';

const POKEMON_COUNT = 493;
const ROUND_TIME = 15;
const INITIAL_LIVES = 3;

const getRandomId = () => Math.floor(Math.random() * POKEMON_COUNT) + 1;

const PokemonGuesser = () => {
  const [pokemon, setPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('pokemonHighScore') || '0', 10));
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const timerRef = useRef(null);
  const timerControls = useAnimation();
  const { toast } = useToast();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const loadNextPokemon = useCallback(async () => {
    setGameState('loading');
    setSelectedOption(null);
    setPokemon(null);
    clearTimer();
    timerControls.set({ width: '100%' });

    try {
      const pokemonIds = new Set();
      while (pokemonIds.size < 4) {
        pokemonIds.add(getRandomId());
      }

      const promises = Array.from(pokemonIds).map(id =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
      );

      const results = await Promise.all(promises);
      
      const correctPokemon = results[0];
      const pokemonOptions = results.map(p => ({
        id: p.id,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        sprite: p.sprites.other['official-artwork'].front_default,
      }));

      const shuffledOptions = pokemonOptions.sort(() => Math.random() - 0.5);

      setPokemon({
        id: correctPokemon.id,
        name: correctPokemon.name.charAt(0).toUpperCase() + correctPokemon.name.slice(1),
        sprite: correctPokemon.sprites.other['official-artwork'].front_default,
      });
      setOptions(shuffledOptions);
      setTimeLeft(ROUND_TIME);
      setGameState('playing');
    } catch (error) {
      toast({
        title: "Error de Red",
        description: "No se pudieron cargar los Pokémon. Revisa tu conexión.",
        variant: "destructive",
      });
      setGameState('error');
    }
  }, [toast, clearTimer, timerControls]);

  const handleGuess = useCallback((selectedName) => {
    if (gameState !== 'playing') return;

    clearTimer();
    timerControls.stop();
    const isCorrect = selectedName === pokemon.name;
    setSelectedOption({ name: selectedName, correct: isCorrect });
    setGameState('revealed');

    if (isCorrect) {
      const points = 50 + Math.floor(timeLeft * 5);
      setScore(prevScore => prevScore + points);
      toast({
        title: "¡Correcto!",
        description: `¡Es ${pokemon.name}! Ganaste ${points} puntos.`,
        className: 'border-green-500 bg-green-500/20 text-white',
      });
      setTimeout(loadNextPokemon, 2000);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      toast({
        title: selectedName ? "¡Incorrecto!" : "¡Se acabó el tiempo!",
        description: `El Pokémon era ${pokemon.name}.`,
        variant: "destructive",
      });

      if (newLives <= 0) {
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('pokemonHighScore', score.toString());
        }
        setTimeout(() => setGameState('gameOver'), 2000);
      } else {
        setTimeout(loadNextPokemon, 2000);
      }
    }
  }, [gameState, clearTimer, pokemon, timeLeft, lives, score, highScore, toast, loadNextPokemon, timerControls]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      timerControls.start({
        width: '0%',
        transition: { duration: timeLeft, ease: 'linear' },
      });
    } else {
      clearTimer();
      timerControls.stop();
    }
    return clearTimer;
  }, [gameState, timerControls, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'playing') {
      handleGuess(null);
    }
  }, [timeLeft, gameState, handleGuess]);

  const startGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    loadNextPokemon();
  };

  const getButtonClass = (name) => {
    if (gameState !== 'revealed') return 'bg-blue-600/80 hover:bg-blue-500/90';
    if (name === pokemon.name) return 'bg-green-500 hover:bg-green-500';
    if (name === selectedOption?.name && !selectedOption?.correct) return 'bg-red-500 hover:bg-red-500';
    return 'bg-gray-600/50 hover:bg-gray-600/50 opacity-50';
  };

  const renderMenu = () => (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <img  alt="Pokemon Logo" class="w-64 mx-auto mb-4" src="https://images.unsplash.com/photo-1628526498666-add5eddf65df" />
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">¿Quién es ese Pokémon?</h1>
      <p className="text-slate-300 mb-8">Adivina el Pokémon por su silueta.</p>
      <Button onClick={startGame} size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 text-xl font-bold animate-pulse">
        <Play className="mr-2 h-6 w-6" />
        Iniciar Juego
      </Button>
      <div className="mt-6 text-lg text-yellow-400">
        Puntuación Máxima: {highScore}
      </div>
    </motion.div>
  );

  const renderGameOver = () => (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-4">Game Over</h1>
      <p className="text-2xl text-slate-200 mb-2">Tu puntuación final:</p>
      <p className="text-6xl font-bold text-yellow-400 mb-6">{score}</p>
      {score > highScore && <p className="text-green-400 text-xl mb-4">¡Nuevo récord!</p>}
      <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-500">
        Jugar de Nuevo
      </Button>
    </motion.div>
  );

  const renderPauseScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <h2 className="text-4xl font-bold text-white mb-6">Pausado</h2>
      <Button onClick={() => setGameState('playing')} size="lg">
        <Play className="mr-2 h-6 w-6" />
        Reanudar
      </Button>
    </motion.div>
  );

  const renderGame = () => (
    <>
      <AnimatePresence>{gameState === 'paused' && renderPauseScreen()}</AnimatePresence>
      <div className="flex justify-between items-center mb-2 w-full">
        <div className="flex items-center gap-1">
          {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
            <Heart key={i} className={`h-7 w-7 transition-colors ${i < lives ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
          <Star className="h-5 w-5" />
          <span className="font-bold text-lg">{score}</span>
        </div>
        <Button onClick={() => setGameState('paused')} variant="ghost" size="icon" disabled={gameState !== 'playing'}>
          <Pause className="h-7 w-7 text-white" />
        </Button>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full"
          animate={timerControls}
        />
      </div>

      <div className="relative h-64 mb-6 flex items-center justify-center">
        <AnimatePresence>
          {gameState === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
              <p className="mt-2 text-slate-300">Cargando Pokémon...</p>
            </motion.div>
          )}
          {gameState === 'error' && (
             <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-red-400">
              <XCircle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-xl font-bold">¡Oh no!</h2>
              <p>Hubo un error al buscar Pokémon.</p>
              <Button onClick={loadNextPokemon} className="mt-4">Intentar de nuevo</Button>
            </motion.div>
          )}
          {pokemon && (
            <motion.img
              key={pokemon.id}
              src={pokemon.sprite}
              alt="Pokémon a adivinar"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`h-full w-full object-contain transition-all duration-500 ease-in-out ${['playing', 'paused'].includes(gameState) ? 'pokemon-silhouette' : 'pokemon-revealed'}`}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + (gameState === 'loading' ? 0.5 : 0) }}
            >
              <Button
                onClick={() => handleGuess(option.name)}
                disabled={gameState !== 'playing'}
                className={`w-full h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${getButtonClass(option.name)}`}
              >
                {option.name}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );

  return (
    <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 overflow-hidden">
      <CardContent className="p-6 relative">
        <AnimatePresence mode="wait">
          {gameState === 'menu' && <motion.div key="menu">{renderMenu()}</motion.div>}
          {['loading', 'playing', 'paused', 'revealed', 'error'].includes(gameState) && <motion.div key="game">{renderGame()}</motion.div>}
          {gameState === 'gameOver' && <motion.div key="gameOver">{renderGameOver()}</motion.div>}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PokemonGuesser;