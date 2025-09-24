'use client';

import { useState } from 'react';
import { MKMCard, createMKMClient } from '@/lib/mkm-api';

interface CollectionViewProps {
  cards: MKMCard[];
  setCards: (cards: MKMCard[]) => void;
  selectedCards: MKMCard[];
  onCardSelection: (card: MKMCard, selected: boolean) => void;
}

export default function CollectionView({ 
  cards, 
  setCards, 
  selectedCards, 
  onCardSelection 
}: CollectionViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mkmClient = createMKMClient();

  const loadCollection = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, use mock data since we need API credentials for real data
      const collection = await mkmClient.getMockCollection();
      setCards(collection);
    } catch (err) {
      setError('Failed to load collection from MKM API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.expansion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (card: MKMCard) => 
    selectedCards.some(selectedCard => selectedCard.id === card.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Your Collection</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadCollection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sync Collection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <span className="text-red-400 mr-2">⚠️</span>
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Collection Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
          <p className="text-gray-500">
            {cards.length === 0 
              ? "Click 'Sync Collection' to fetch your cards from MKM API" 
              : "Try adjusting your search terms"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              selected={isSelected(card)}
              onSelectionChange={(selected) => onCardSelection(card, selected)}
            />
          ))}
        </div>
      )}

      {/* Collection Stats */}
      {cards.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Collection Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
              <div className="text-sm text-gray-500">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                €{cards.reduce((sum, card) => sum + card.price, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(cards.map(card => card.expansion)).size}
              </div>
              <div className="text-sm text-gray-500">Unique Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {cards.filter(card => card.foil).length}
              </div>
              <div className="text-sm text-gray-500">Foils</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CardItemProps {
  card: MKMCard;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
}

function CardItem({ card, selected, onSelectionChange }: CardItemProps) {
  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectionChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          {card.foil && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              ✨ Foil
            </span>
          )}
        </div>
        
        <h4 className="font-medium text-gray-900 mb-1">{card.name}</h4>
        <p className="text-sm text-gray-600 mb-2">{card.expansion}</p>
        
        <div className="flex justify-between items-center text-sm">
          <span className={`px-2 py-1 rounded-full text-xs ${
            card.rarity === 'Rare' ? 'bg-yellow-100 text-yellow-800' :
            card.rarity === 'Uncommon' ? 'bg-gray-100 text-gray-800' :
            'bg-green-100 text-green-800'
          }`}>
            {card.rarity}
          </span>
          <span className="text-lg font-semibold text-green-600">
            €{card.price.toFixed(2)}
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{card.condition}</span>
            <span>{card.language}</span>
          </div>
        </div>
      </div>
    </div>
  );
}