import axios from 'axios';
import crypto from 'crypto';

export interface MKMCard {
  id: string;
  name: string;
  expansion: string;
  rarity: string;
  price: number;
  condition: string;
  language: string;
  foil: boolean;
}

export interface MKMPriceData {
  avg: number;
  low: number;
  trend: number;
  avg30Days: number;
  avg7Days: number;
  avg1Day: number;
}

export class MKMApiClient {
  private baseURL = 'https://api.cardmarket.com/ws/v2.0';
  private appToken: string;
  private appSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;

  constructor() {
    this.appToken = process.env.MKM_API_KEY || '';
    this.appSecret = process.env.MKM_API_SECRET || '';
    this.accessToken = process.env.MKM_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.MKM_ACCESS_TOKEN_SECRET || '';
  }

  private generateOAuthSignature(method: string, url: string, params: Record<string, string>): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('hex');

    const oauthParams = {
      oauth_consumer_key: this.appToken,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0',
      ...params
    };

    // Sort parameters
    const sortedParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent((oauthParams as Record<string, string>)[key])}`)
      .join('&');

    // Create signature base string
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

    // Create signing key
    const signingKey = `${encodeURIComponent(this.appSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    return `OAuth oauth_consumer_key="${this.appToken}", oauth_token="${this.accessToken}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;
  }

  async searchCards(cardName: string): Promise<MKMCard[]> {
    const url = `${this.baseURL}/products/find`;
    const params = { search: cardName, exact: 'false' };
    
    try {
      const authHeader = this.generateOAuthSignature('GET', url, params);
      
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/xml'
        }
      });

      // Parse XML response and convert to MKMCard format
      // This is a simplified version - actual MKM API returns XML
      return this.parseCardsFromResponse(response.data);
    } catch (error) {
      console.error('Error searching cards:', error);
      throw new Error('Failed to search cards on MKM');
    }
  }

  async getCardPrice(productId: string): Promise<MKMPriceData> {
    const url = `${this.baseURL}/products/${productId}`;
    
    try {
      const authHeader = this.generateOAuthSignature('GET', url, {});
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/xml'
        }
      });

      return this.parsePriceFromResponse(response.data);
    } catch (error) {
      console.error('Error getting card price:', error);
      throw new Error('Failed to get card price from MKM');
    }
  }

  async getMyCollection(): Promise<MKMCard[]> {
    const url = `${this.baseURL}/stock`;
    
    try {
      const authHeader = this.generateOAuthSignature('GET', url, {});
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/xml'
        }
      });

      return this.parseCardsFromResponse(response.data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw new Error('Failed to fetch collection from MKM');
    }
  }

  async postCardToMarket(card: {
    productId: string;
    price: number;
    condition: string;
    language: string;
    foil: boolean;
    quantity: number;
    comment?: string;
  }): Promise<boolean> {
    const url = `${this.baseURL}/stock`;
    
    const articleData = this.buildArticleXML(card);
    
    try {
      const authHeader = this.generateOAuthSignature('POST', url, {});
      
      const response = await axios.post(url, articleData, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/xml'
        }
      });

      return response.status === 201;
    } catch (error) {
      console.error('Error posting card to market:', error);
      throw new Error('Failed to post card to MKM marketplace');
    }
  }

  private buildArticleXML(card: {
    productId: string;
    price: number;
    condition: string;
    language: string;
    foil: boolean;
    quantity: number;
    comment?: string;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8" ?>
<request>
  <article>
    <idProduct>${card.productId}</idProduct>
    <count>${card.quantity}</count>
    <price>${card.price}</price>
    <condition>${card.condition}</condition>
    <foil>${card.foil ? 'true' : 'false'}</foil>
    <signed>false</signed>
    <playset>false</playset>
    <altered>false</altered>
    <language>
      <idLanguage>${this.getLanguageId(card.language)}</idLanguage>
    </language>
    ${card.comment ? `<comment>${card.comment}</comment>` : ''}
  </article>
</request>`;
  }

  private getLanguageId(language: string): number {
    const languageMap: Record<string, number> = {
      'English': 1,
      'French': 2,
      'German': 3,
      'Spanish': 4,
      'Italian': 5,
      'Japanese': 8,
      'Portuguese': 9,
      'Russian': 10,
      'Korean': 11,
      'Traditional Chinese': 12,
      'Simplified Chinese': 13
    };
    return languageMap[language] || 1; // Default to English
  }

  private parseCardsFromResponse(_xmlData: string): MKMCard[] {
    // This is a placeholder for XML parsing
    // In a real implementation, you'd parse the XML response from MKM
    // For now, return mock data to show the structure
    return [
      {
        id: '1',
        name: 'Sample Card',
        expansion: 'Sample Set',
        rarity: 'Rare',
        price: 10.50,
        condition: 'Near Mint',
        language: 'English',
        foil: false
      }
    ];
  }

  private parsePriceFromResponse(_xmlData: string): MKMPriceData {
    // This is a placeholder for XML parsing
    // In a real implementation, you'd parse the XML response from MKM
    return {
      avg: 10.50,
      low: 8.00,
      trend: 11.25,
      avg30Days: 10.75,
      avg7Days: 10.25,
      avg1Day: 10.50
    };
  }

  // Mock method for development/testing
  async getMockCollection(): Promise<MKMCard[]> {
    return [
      {
        id: 'lightning-bolt-1',
        name: 'Lightning Bolt',
        expansion: 'Alpha',
        rarity: 'Common',
        price: 85.50,
        condition: 'Near Mint',
        language: 'English',
        foil: false
      },
      {
        id: 'black-lotus-1',
        name: 'Black Lotus',
        expansion: 'Alpha',
        rarity: 'Rare',
        price: 25000.00,
        condition: 'Near Mint',
        language: 'English',
        foil: false
      },
      {
        id: 'sol-ring-1',
        name: 'Sol Ring',
        expansion: 'Commander 2019',
        rarity: 'Uncommon',
        price: 2.50,
        condition: 'Near Mint',
        language: 'English',
        foil: true
      }
    ];
  }

  // Calculate recommended price based on market data
  calculateRecommendedPrice(priceData: MKMPriceData, strategy: 'competitive' | 'average' | 'premium' = 'average'): number {
    switch (strategy) {
      case 'competitive':
        return Math.max(priceData.low * 0.95, priceData.avg * 0.85);
      case 'premium':
        return priceData.trend * 1.1;
      case 'average':
      default:
        return (priceData.avg + priceData.trend) / 2;
    }
  }
}

export function createMKMClient(): MKMApiClient {
  return new MKMApiClient();
}