
export const updatePrice = (stock, buyVolume) => {
  const k = 0.001; 
  const newPrice = stock.pricePerShare * (1 + k * buyVolume);
  stock.pricePerShare = Math.round(newPrice * 100) / 100;

  return stock;
};
