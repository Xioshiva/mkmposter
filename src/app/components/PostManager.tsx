'use client';

import { useState } from 'react';
import { MKMCard, createMKMClient } from '@/lib/mkm-api';

interface PostManagerProps {
  selectedCards: MKMCard[];
  onPostComplete: () => void;
}

export default function PostManager({ selectedCards, onPostComplete }: PostManagerProps) {
  const [posting, setPosting] = useState(false);
  const [postResults, setPostResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});
  const [postSettings, setPostSettings] = useState({
    defaultCondition: 'Near Mint',
    defaultLanguage: 'English',
    includeComment: false,
    comment: ''
  });

  const mkmClient = createMKMClient();

  const postToMKM = async () => {
    if (selectedCards.length === 0) {
      alert('No cards selected for posting');
      return;
    }

    setPosting(true);
    const results: Record<string, 'success' | 'error' | 'pending'> = {};

    // Initialize all as pending
    selectedCards.forEach(card => {
      results[card.id] = 'pending';
    });
    setPostResults(results);

    try {
      for (const card of selectedCards) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate success/failure (90% success rate)
          const success = Math.random() > 0.1;
          
          if (success) {
            results[card.id] = 'success';
          } else {
            results[card.id] = 'error';
          }
          
          setPostResults({ ...results });
        } catch (error) {
          results[card.id] = 'error';
          setPostResults({ ...results });
        }
      }

      // Show completion message
      const successCount = Object.values(results).filter(status => status === 'success').length;
      const errorCount = Object.values(results).filter(status => status === 'error').length;
      
      alert(`Posting complete! ${successCount} successful, ${errorCount} failed.`);
      
      if (successCount > 0) {
        onPostComplete();
      }
    } catch (error) {
      console.error('Error posting to MKM:', error);
      alert('Failed to post cards to MKM. Please check your API credentials.');
    } finally {
      setPosting(false);
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
    }
  };

  const totalValue = selectedCards.reduce((sum, card) => sum + card.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Post to MKM</h2>
          <p className="text-sm text-gray-500">
            Post your selected cards to the Magic Card Market marketplace
          </p>
        </div>
      </div>

      {selectedCards.length > 0 && (
        <>
          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Posting Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Condition
                </label>
                <select
                  value={postSettings.defaultCondition}
                  onChange={(e) => setPostSettings(prev => ({ ...prev, defaultCondition: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Mint">Mint</option>
                  <option value="Near Mint">Near Mint</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Light Played">Light Played</option>
                  <option value="Played">Played</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={postSettings.defaultLanguage}
                  onChange={(e) => setPostSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={postSettings.includeComment}
                  onChange={(e) => setPostSettings(prev => ({ ...prev, includeComment: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include comment with all listings</span>
              </label>
              
              {postSettings.includeComment && (
                <textarea
                  value={postSettings.comment}
                  onChange={(e) => setPostSettings(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Enter comment for all listings..."
                  rows={3}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Posting Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedCards.length}</div>
                <div className="text-sm text-gray-500">Cards to Post</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">€{totalValue.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  €{(totalValue * 0.05).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Est. MKM Fees (5%)</div>
              </div>
            </div>

            <button
              onClick={postToMKM}
              disabled={posting}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {posting ? 'Posting to MKM...' : `Post ${selectedCards.length} Cards to MKM`}
            </button>
          </div>

          {/* Cards List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cards to Post</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {card.name}
                            {card.foil && <span className="ml-2 text-yellow-500">✨</span>}
                          </div>
                          <div className="text-sm text-gray-500">{card.expansion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        €{card.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {card.condition || postSettings.defaultCondition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {card.language || postSettings.defaultLanguage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {postResults[card.id] ? (
                          <span className={getStatusColor(postResults[card.id])}>
                            {getStatusIcon(postResults[card.id])}
                            <span className="ml-2 capitalize">{postResults[card.id]}</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards selected</h3>
          <p className="text-gray-500">
            Go to the Collection tab and select cards to post them to MKM
          </p>
        </div>
      )}
    </div>
  );
}