import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Thermometer, Ruler, ArrowRight } from 'lucide-react';

const conversionOptions = {
  currency: {
    icon: <DollarSign className="h-5 w-5 mr-2" />,
    units: ['USD', 'EUR', 'JPY', 'GBP', 'CAD'],
    rates: {
      USD: 1, EUR: 0.92, JPY: 157.25, GBP: 0.79, CAD: 1.37
    },
    defaultFrom: 'USD',
    defaultTo: 'EUR',
  },
  temperature: {
    icon: <Thermometer className="h-5 w-5 mr-2" />,
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    defaultFrom: 'Celsius',
    defaultTo: 'Fahrenheit',
  },
  length: {
    icon: <Ruler className="h-5 w-5 mr-2" />,
    units: ['Meters', 'Kilometers', 'Miles', 'Feet'],
    factors: {
      Meters: 1, Kilometers: 0.001, Miles: 0.000621371, Feet: 3.28084
    },
    defaultFrom: 'Meters',
    defaultTo: 'Feet',
  },
};

const ConversionPanel = ({ type }) => {
  const config = conversionOptions[type];
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(config.defaultFrom);
  const [toUnit, setToUnit] = useState(config.defaultTo);
  const [outputValue, setOutputValue] = useState('');

  const handleConversion = useMemo(() => {
    return (val, from, to) => {
      const numVal = parseFloat(val);
      if (isNaN(numVal)) {
        return '';
      }

      switch (type) {
        case 'currency': {
          if (!config.rates[from] || !config.rates[to]) return '';
          const rateFrom = config.rates[from];
          const rateTo = config.rates[to];
          const result = (numVal / rateFrom) * rateTo;
          return result.toFixed(2);
        }
        case 'temperature': {
          let celsius;
          if (from === 'Celsius') celsius = numVal;
          else if (from === 'Fahrenheit') celsius = (numVal - 32) * 5/9;
          else if (from === 'Kelvin') celsius = numVal - 273.15;
          
          if (to === 'Celsius') return celsius.toFixed(2);
          if (to === 'Fahrenheit') return ((celsius * 9/5) + 32).toFixed(2);
          if (to === 'Kelvin') return (celsius + 273.15).toFixed(2);
          return '';
        }
        case 'length': {
          if (!config.factors[from] || !config.factors[to]) return '';
          const inMeters = numVal / config.factors[from];
          const result = inMeters * config.factors[to];
          return result.toFixed(3);
        }
        default:
          return '';
      }
    };
  }, [type, config]);

  useEffect(() => {
    if(fromUnit === toUnit) {
        const otherUnits = config.units.filter(u => u !== fromUnit);
        if(otherUnits.length > 0) {
            setToUnit(otherUnits[0]);
        }
    }
    setOutputValue(handleConversion(inputValue, fromUnit, toUnit));
  }, [inputValue, fromUnit, toUnit, handleConversion, config.units]);
  
  const fromUnits = config.units;
  const toUnits = config.units.filter(u => u !== fromUnit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Valor</label>
          <Input 
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-slate-400 mb-2 block">De</label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fromUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="flex h-10 items-center">
                <ArrowRight className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-slate-400 mb-2 block">A</label>
                <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{toUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        </div>
      </div>
      
      <div className="text-center bg-black/20 p-6 rounded-lg">
        <p className="text-slate-400 text-sm">Resultado</p>
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">
            <AnimatePresence mode="wait">
                <motion.span
                    key={outputValue + toUnit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {outputValue}
                </motion.span>
            </AnimatePresence>
        </p>
        <p className="text-slate-500 text-sm mt-1">{toUnit}</p>
      </div>

       {type === 'currency' && (
        <p className="text-xs text-center text-slate-500">
          Las tasas de cambio son indicativas y pueden no ser en tiempo real.
        </p>
      )}
    </motion.div>
  );
};

const UnitConverter = () => {
  return (
    <Card className="bg-black/40 backdrop-blur-md border border-slate-700 shadow-2xl shadow-blue-900/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">
          Conversor de Unidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="currency" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            {Object.entries(conversionOptions).map(([key, { icon }]) => (
              <TabsTrigger key={key} value={key} className="capitalize flex items-center">
                {icon} {key}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(conversionOptions).map((key) => (
            <TabsContent key={key} value={key} className="pt-6">
              <ConversionPanel type={key} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnitConverter;