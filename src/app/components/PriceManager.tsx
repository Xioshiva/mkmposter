'use client';

import { useState } from 'react';
import { MKMCard, MKMPriceData, createMKMClient } from '@/lib/mkm-api';

interface PriceManagerProps {
  cards: MKMCard[];
  selectedCards: MKMCard[];
  onCardsUpdate: (cards: MKMCard[]) => void;
}

export default function PriceManager({ cards, selectedCards, onCardsUpdate }: PriceManagerProps) {
  const [loading, setLoading] = useState(false);
  const [pricingStrategy, setPricingStrategy] = useState<'competitive' | 'average' | 'premium'>('average');
  const [priceUpdates, setPriceUpdates] = useState<Record<string, MKMPriceData>>({});

  const mkmClient = createMKMClient();

  const updatePrices = async () => {
    if (selectedCards.length === 0) {
      alert('Please select cards to update prices for');
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, MKMPriceData> = {};
      
      for (const card of selectedCards) {
        // For demo purposes, generate mock price data
        const mockPriceData: MKMPriceData = {
          avg: card.price,
          low: card.price * 0.8,
          trend: card.price * 1.1,
          avg30Days: card.price * 0.95,
          avg7Days: card.price * 1.02,
          avg1Day: card.price * 1.01
        };
        updates[card.id] = mockPriceData;
      }

      setPriceUpdates(updates);

      // Update cards with new recommended prices
      const updatedCards = cards.map(card => {
        if (updates[card.id]) {
          const recommendedPrice = mkmClient.calculateRecommendedPrice(updates[card.id], pricingStrategy);
          return { ...card, price: recommendedPrice };
        }
        return card;
      });

      onCardsUpdate(updatedCards);
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Failed to update prices. Please check your MKM API credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;

  const getPriceChangeColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriceChangeIcon = (current: number, previous: number) => {
    if (current > previous) return '📈';
    if (current < previous) return '📉';
    return '➡️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Price Manager</h2>
          <p className="text-sm text-gray-500">
            Update market prices and get recommendations for your selected cards
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Strategy
              </label>
              <select
                value={pricingStrategy}
                onChange={(e) => setPricingStrategy(e.target.value as 'competitive' | 'average' | 'premium')}
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="competitive">Competitive (Lower prices, faster sales)</option>
                <option value="average">Average (Balanced approach)</option>
                <option value="premium">Premium (Higher prices, slower sales)</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 mb-2">Selected Cards</span>
              <span className="text-2xl font-bold text-blue-600">{selectedCards.length}</span>
            </div>
          </div>

          <button
            onClick={updatePrices}
            disabled={loading || selectedCards.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Prices'}
          </button>
        </div>
      </div>

      {/* Strategy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <span className="text-blue-400 mr-2">💡</span>
          <div className="text-sm text-blue-700">
            <strong>
              {pricingStrategy === 'competitive' && 'Competitive Strategy:'}
              {pricingStrategy === 'average' && 'Average Strategy:'}
              {pricingStrategy === 'premium' && 'Premium Strategy:'}
            </strong>
            <span className="ml-2">
              {pricingStrategy === 'competitive' && 'Prices set 5-15% below average market price for quick sales.'}
              {pricingStrategy === 'average' && 'Prices set between average and trend prices for balanced sales.'}
              {pricingStrategy === 'premium' && 'Prices set 10% above trend for maximum profit.'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Updates Table */}
      {selectedCards.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Price Analysis</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedCards.map((card) => {
                  const priceData = priceUpdates[card.id];
                  const recommendedPrice = priceData 
                    ? mkmClient.calculateRecommendedPrice(priceData, pricingStrategy)
                    : card.price;
                  
                  return (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{card.name}</div>
                          <div className="text-sm text-gray-500">{card.expansion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(card.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {priceData ? (
                          <div className="space-y-1">
                            <div>Avg: {formatPrice(priceData.avg)}</div>
                            <div>Low: {formatPrice(priceData.low)}</div>
                            <div>Trend: {formatPrice(priceData.trend)}</div>
                          </div>
                        ) : (
                          <span>Click &quot;Update Prices&quot;</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatPrice(recommendedPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getPriceChangeColor(recommendedPrice, card.price)}>
                          {getPriceChangeIcon(recommendedPrice, card.price)}
                          {((recommendedPrice - card.price) / card.price * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards selected</h3>
          <p className="text-gray-500">
            Go to the Collection tab and select cards to manage their prices
          </p>
        </div>
      )}
    </div>
  );
}