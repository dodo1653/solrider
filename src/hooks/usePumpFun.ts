import { useState, useCallback, useEffect } from 'react';

const KNOWN_TOP_MINTS = [
  '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
  '61V8vBaqAGMpgDQi4JcAwo1dmBGHsyhzodcPqnEVpump',
  'J1Wpmugrooj1yMyQKrdZ2vwRXG5rhfx3vTnYE39gpump',
  '9PR7nCP9DpcUotnDPVLUBUZKu5WAYkwrCUx9wDnSpump',
  '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2',
  'FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump',
  'HNg5PYJmtqcmzXrv6S9zP1CDKk5BgDuyFBxbvNApump',
  'ArUyEVWGCzZMtAxcPmNH8nDFZ4kMjxrMbpsQf3NEpump',
  '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump',
  'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
  'BCdwQBAn8dYB5YjTsoB6TdHAWokxv28k2oZUodERpump',
  '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn',
  'Ce2gx9KGXJ6C9Mp5b5x1sn9Mg87JwEbrQby4Zqo3pump',
  'Cm6fNnMk7NfzStP9CZpsQA2v3jjzbcYGAxdJySmHpump',
  'Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump',
  'Eg2ymQ2aQqjMcibnmTt8erC6Tvk9PVpJZCxvVPJz2agu',
  'HgBRWfYxEfvPhtqkaeymCQtHCrKE46qQ43pKe8HCpump',
  'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',
];

export interface PumpCoin {
  mint: string;
  name: string;
  symbol: string;
  marketCapUsd?: number;
  priceUsd?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidityUsd?: number;
  imageUrl?: string;
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateCandles(
  currentPrice: number,
  change24h: number,
  count: number = 200,
  seed?: number
): Candle[] {
  const rand = seededRandom(seed ?? Math.floor(Math.random() * 100000));
  const startPrice = currentPrice / (1 + change24h / 100);
  const candles: Candle[] = [];
  const now = Date.now();
  const intervalMs = 900000;
  let price = startPrice;

  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const targetPull = (currentPrice - startPrice) * progress;
    const noise = price * (rand() - 0.48) * 0.04;
    const close = price + targetPull * 0.1 + noise;
    const high = Math.max(price, close) * (1 + rand() * 0.03);
    const low = Math.min(price, close) * (1 - rand() * 0.03);

    candles.push({
      open: price,
      high,
      low,
      close: Math.max(close, 1e-8),
      timestamp: now - (count - i) * intervalMs,
    });
    price = close;
  }

  return candles;
}

function parseDexScreenerPair(pair: any): Omit<PumpCoin, 'mint' | 'name' | 'symbol'> | null {
  if (!pair) return null;
  return {
    priceUsd: parseFloat(pair.priceUsd) || undefined,
    priceChange24h: pair.priceChange?.h24,
    volume24h: pair.volume?.h24,
    liquidityUsd: pair.liquidity?.usd,
    marketCapUsd: pair.marketCap || pair.fdv,
    imageUrl: pair.info?.imageUrl,
  };
}

async function fetchBatchFromDex(mints: string[]): Promise<Map<string, PumpCoin>> {
  const map = new Map<string, PumpCoin>();
  const batchSize = 5;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const pairs = data.pairs || [];
      const bestPair = new Map<string, any>();
      for (const p of pairs) {
        const addr = p.baseToken?.address;
        if (addr && (!bestPair.has(addr) || (p.liquidity?.usd || 0) > (bestPair.get(addr)?.liquidity?.usd || 0))) {
          bestPair.set(addr, p);
        }
      }
      for (const [addr, pair] of bestPair) {
        const existing = map.get(addr) || { mint: addr, name: addr.slice(0, 8), symbol: addr.slice(0, 5) };
        const dexData = parseDexScreenerPair(pair);
        if (dexData) Object.assign(existing, dexData);
        map.set(addr, existing);
      }
    } catch { continue; }
  }
  return map;
}

async function fetchTokenMeta(mint: string): Promise<{ name: string; symbol: string } | null> {
  try {
    const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const c = await res.json();
    return { name: c.name || c.symbol || mint, symbol: c.symbol || mint };
  } catch { return null; }
}

async function fetchGeckoTerminalCandles(mint: string): Promise<Candle[] | null> {
  try {
    const tokenRes = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${mint}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!tokenRes.ok) return null;
    const tokenData = await tokenRes.json();
    const topPools = tokenData?.data?.relationships?.top_pools?.data;
    if (!topPools || topPools.length === 0) return null;

    const poolId: string = topPools[0].id;
    const poolAddress = poolId.replace(/^solana_/, '');
    if (!poolAddress) return null;

    const ohlcvRes = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}/ohlcv/minute`,
      { headers: { Accept: 'application/json' } }
    );
    if (!ohlcvRes.ok) return null;
    const ohlcvData = await ohlcvRes.json();
    const ohlcvList: number[][] = ohlcvData?.data?.attributes?.ohlcv_list;
    if (!ohlcvList || ohlcvList.length < 2) return null;

    return ohlcvList.map(([timestamp, open, high, low, close]: number[]) => ({
      timestamp: timestamp * 1000,
      open,
      high,
      low,
      close,
    }));
  } catch {
    return null;
  }
}

export function usePumpFun() {
  const [topCoins, setTopCoins] = useState<PumpCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<PumpCoin | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  const fetchTopCoins = useCallback(async () => {
    setLoading(true);

    try {
      const metaRes = await Promise.all(
        KNOWN_TOP_MINTS.slice(0, 12).map(mint =>
          fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, {
            headers: { Accept: 'application/json' }
          }).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      );

      const baseCoins: PumpCoin[] = [];
      for (let i = 0; i < KNOWN_TOP_MINTS.slice(0, 12).length; i++) {
        const meta = metaRes[i];
        baseCoins.push({
          mint: KNOWN_TOP_MINTS[i],
          name: meta?.name || meta?.symbol || KNOWN_TOP_MINTS[i].slice(0, 8),
          symbol: meta?.symbol || KNOWN_TOP_MINTS[i].slice(0, 5),
        });
      }

      const dexMap = await fetchBatchFromDex(baseCoins.map(c => c.mint));

      const enriched = baseCoins.map(coin => {
        const fromDex = dexMap.get(coin.mint);
        return fromDex ? { ...coin, ...fromDex } : coin;
      });

      setTopCoins(enriched.filter(c => c.marketCapUsd !== undefined).length > 0
        ? enriched.filter(c => c.marketCapUsd !== undefined)
        : enriched
      );
    } catch {
      setTopCoins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCoinByMint = useCallback(async (mint: string): Promise<PumpCoin | null> => {
    try {
      const meta = await fetchTokenMeta(mint);
      const coin: PumpCoin = {
        mint,
        name: meta?.name || mint.slice(0, 8),
        symbol: meta?.symbol || mint.slice(0, 5),
      };

      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const pair = data.pairs?.[0];
        if (pair) {
          const dexData = parseDexScreenerPair(pair);
          if (dexData) Object.assign(coin, dexData);
        }
      }
      return coin;
    } catch { return null; }
  }, []);

  const prepareGame = useCallback(async (coin: PumpCoin) => {
    setSelectedCoin(coin);
    setCandles([]);

    let price = coin.priceUsd || 0.001;
    let change = coin.priceChange24h || 0;

    if (!coin.priceUsd) {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${coin.mint}`, {
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          const d = await res.json();
          const pair = d.pairs?.[0];
          if (pair) {
            price = parseFloat(pair.priceUsd) || price;
            change = pair.priceChange?.h24 || change;
          }
        }
      } catch {}
    }

    const geckoCandles = await fetchGeckoTerminalCandles(coin.mint);
    if (geckoCandles && geckoCandles.length >= 10) {
      setCandles(geckoCandles);
    } else {
      const seed = coin.mint.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      setCandles(generateCandles(price, change, 200, seed));
    }
  }, []);

  const clearGame = useCallback(() => {
    setSelectedCoin(null);
    setCandles([]);
  }, []);

  return {
    topCoins, loading, selectedCoin, candles,
    fetchTopCoins, fetchCoinByMint, prepareGame, clearGame,
  };
}
