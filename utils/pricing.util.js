
export const updatePrice = (startup, buyVolume) => {
  const k = 0.001; 
  const newPrice = startup.value * (1 + k * buyVolume);
  startup.value = Math.round(newPrice * 100) / 100;
  startup.marketCap = startup.totalShares * startup.value;
  return startup;
};
