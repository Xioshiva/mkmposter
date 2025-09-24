'use client';

import { useState } from 'react';
import CollectionView from './components/CollectionView';
import PriceManager from './components/PriceManager';
import PostManager from './components/PostManager';
import { MKMCard } from '@/lib/mkm-api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'collection' | 'prices' | 'post'>('collection');
  const [cards, setCards] = useState<MKMCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MKMCard[]>([]);

  const tabs = [
    { id: 'collection', name: 'Collection', icon: '📚' },
    { id: 'prices', name: 'Price Manager', icon: '💰' },
    { id: 'post', name: 'Post to MKM', icon: '📤' }
  ];

  const handleCardSelection = (card: MKMCard, selected: boolean) => {
    if (selected) {
      setSelectedCards(prev => [...prev, card]);
    } else {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MKM</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">MKM Poster</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {cards.length} cards • {selectedCards.length} selected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'collection' | 'prices' | 'post')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'collection' && (
          <CollectionView
            cards={cards}
            setCards={setCards}
            selectedCards={selectedCards}
            onCardSelection={handleCardSelection}
          />
        )}
        
        {activeTab === 'prices' && (
          <PriceManager
            cards={cards}
            selectedCards={selectedCards}
            onCardsUpdate={setCards}
          />
        )}
        
        {activeTab === 'post' && (
          <PostManager
            selectedCards={selectedCards}
            onPostComplete={() => setSelectedCards([])}
          />
        )}
      </main>
    </div>
  );
}
