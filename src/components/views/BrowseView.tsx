import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  Tag,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LostItemReport, FoundItemReport, ItemMatch, ItemCategory } from '../../types';
import { ItemImage } from '../common/ItemImage';

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Books and stationery',
  'ID cards and documents',
  'Bags and wallets',
  'Keys',
  'Clothing and accessories',
  'Jewelry',
  'Water bottles and lunch boxes',
  'Sports equipment',
  'Other',
];

interface DiscoveryEntry {
  id: string;
  item: LostItemReport | FoundItemReport;
  type: 'lost' | 'found';
  isOwn: boolean;
  matchScore?: number;
  matchId?: string;
}

export const BrowseView: React.FC = () => {
  const { currentUser, navigate } = useApp();
  const [entries, setEntries] = useState<DiscoveryEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'matches' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setEntries([]);
      return;
    }

    setLoading(true);

    Promise.all([
      api.getLostReports({ reporterId: currentUser.id }),
      api.getFoundReports({ reporterId: currentUser.id }),
      api.getMatches(currentUser.id),
    ])
      .then(async ([myLost, myFound, matches]) => {
        const list: DiscoveryEntry[] = [];

        // 1. Current user's own reports
        myLost.forEach((l) => {
          list.push({
            id: `own_lost_${l.id}`,
            item: l,
            type: 'lost',
            isOwn: true,
          });
        });

        myFound.forEach((f) => {
          list.push({
            id: `own_found_${f.id}`,
            item: f,
            type: 'found',
            isOwn: true,
          });
        });

        // 2. Qualifying matches (score >= 50%) involving current user
        const qualifyingMatches = (matches || []).filter((m) => m.score >= 50);
        for (const m of qualifyingMatches) {
          const isLostOwner = myLost.some((l) => l.id === m.lostReportId);
          try {
            if (isLostOwner) {
              const matchedFound = await api.getItemDetail('found', m.foundReportId, currentUser.id);
              list.push({
                id: `match_${m.id}`,
                item: matchedFound,
                type: 'found',
                isOwn: false,
                matchScore: m.score,
                matchId: m.id,
              });
            } else {
              const matchedLost = await api.getItemDetail('lost', m.lostReportId, currentUser.id);
              list.push({
                id: `match_${m.id}`,
                item: matchedLost,
                type: 'lost',
                isOwn: false,
                matchScore: m.score,
                matchId: m.id,
              });
            }
          } catch {
            // Ignore unauthorized or unavailable items
          }
        }

        // Deduplicate entries by item ID and sort newest first
        const seen = new Set<string>();
        const unique = list.filter((e) => {
          const key = `${e.type}_${e.item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        unique.sort(
          (a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime()
        );
        setEntries(unique);
      })
      .catch((err) => console.warn('Match discovery fetch fallback:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Compute available locations from authorized items
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    entries.forEach((e) => e.item.location && locSet.add(e.item.location));
    return ['All', ...Array.from(locSet)];
  }, [entries]);

  // Combined filtered items
  const filteredItems = useMemo(() => {
    let list = entries;

    if (typeFilter === 'matches') {
      list = list.filter((e) => !e.isOwn || (e.matchScore && e.matchScore >= 50));
    } else if (typeFilter === 'lost') {
      list = list.filter((e) => e.type === 'lost');
    } else if (typeFilter === 'found') {
      list = list.filter((e) => e.type === 'found');
    }

    if (categoryFilter !== 'All') {
      list = list.filter((e) => e.item.category === categoryFilter);
    }
    if (locationFilter !== 'All') {
      list = list.filter((e) => e.item.location === locationFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.item.title.toLowerCase().includes(q) ||
          e.item.description.toLowerCase().includes(q) ||
          e.item.location.toLowerCase().includes(q) ||
          (e.item.brand && e.item.brand.toLowerCase().includes(q)) ||
          (e.item.color && e.item.color.toLowerCase().includes(q))
      );
    }

    return list;
  }, [entries, typeFilter, categoryFilter, locationFilter, searchQuery]);

  // Unauthenticated view: explain privacy-first model and prompt sign in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-campus-sage/20 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-campus-forest text-campus-amber mx-auto flex items-center justify-center shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Campus Privacy Protected
            </span>
            <h1 className="text-2xl font-extrabold text-campus-forest font-heading mt-3">
              Private Match Discovery
            </h1>
            <p className="text-xs text-campus-charcoal/70 mt-2 leading-relaxed">
              FindItAi does not display a public feed of everyone's belongings. Lost and found reports are kept private by default and matched securely using our 50%+ AI matching algorithm.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-campus-ivory text-left text-xs space-y-2 border border-campus-sage/30">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-campus-forest flex-shrink-0 mt-0.5" />
              <span>Sign in with your university account to see your reports.</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-campus-amber flex-shrink-0 mt-0.5" />
              <span>You will only see items connected to you through an authorized match.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('login')}
              className="w-full py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In to FindItAi</span>
              <ArrowRight className="w-4 h-4 text-campus-amber" />
            </button>
            <button
              onClick={() => navigate('signup')}
              className="w-full py-3 rounded-xl bg-campus-ivory hover:bg-gray-200 text-campus-forest font-bold text-xs uppercase tracking-wider transition border border-campus-sage/40 cursor-pointer"
            >
              Create Campus Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-campus-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold mb-1 border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" /> Private Relevance-Based Match Discovery
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
              My Records &amp; Potential Matches
            </h1>
            <p className="text-xs sm:text-sm text-campus-charcoal/70 mt-0.5">
              Strictly showing your own reports and potential AI matches scoring 50% or higher.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('report_lost')}
              className="px-3.5 py-2 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase tracking-wider hover:bg-[#b88636] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </button>
            <button
              onClick={() => navigate('report_found')}
              className="px-3.5 py-2 rounded-xl bg-campus-forest text-campus-ivory font-bold text-xs uppercase tracking-wider hover:bg-campus-forest-light transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-campus-amber" />
              <span>Report Found</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-3xl p-5 border border-campus-sage/20 shadow-sm space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-campus-charcoal/40">
              <Search className="w-4 h-4 text-campus-forest" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, location, brand, or color..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-campus-sage/40 text-xs text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest transition"
            />
          </div>

          {/* Filter Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-campus-sage/15 text-xs">
            {/* Segmented Filter */}
            <div className="flex items-center p-1 rounded-xl bg-campus-ivory border border-campus-sage/30">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  typeFilter === 'all'
                    ? 'bg-campus-forest text-white shadow-xs'
                    : 'text-campus-charcoal/70 hover:text-campus-forest'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                onClick={() => setTypeFilter('matches')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  typeFilter === 'matches'
                    ? 'bg-campus-amber text-campus-charcoal shadow-xs'
                    : 'text-campus-charcoal/70 hover:text-campus-forest'
                }`}
              >
                AI Matches ({entries.filter((e) => e.matchScore && e.matchScore >= 50).length})
              </button>
              <button
                onClick={() => setTypeFilter('lost')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  typeFilter === 'lost'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-campus-charcoal/70 hover:text-amber-700'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setTypeFilter('found')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  typeFilter === 'found'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-campus-charcoal/70 hover:text-emerald-800'
                }`}
              >
                Found
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-campus-charcoal/60 text-[11px] font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-campus-ivory border border-campus-sage/40 rounded-xl px-3 py-1.5 text-xs text-campus-charcoal focus:outline-none focus:border-campus-forest"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            {locations.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-campus-charcoal/60 text-[11px] font-semibold">Location:</span>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-campus-ivory border border-campus-sage/40 rounded-xl px-3 py-1.5 text-xs text-campus-charcoal focus:outline-none focus:border-campus-forest max-w-[200px]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-campus-charcoal/70 px-1">
          <span>
            Showing <strong>{filteredItems.length}</strong> authorized record(s)
          </span>
          {(searchQuery || categoryFilter !== 'All' || locationFilter !== 'All' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setLocationFilter('All');
                setTypeFilter('all');
              }}
              className="text-campus-amber font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white border border-campus-sage/20" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* EXACT REQUIRED EMPTY STATE: "No matching items found yet. We'll notify you when a relevant match appears." */
          <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-campus-ivory border border-campus-sage/30 mx-auto flex items-center justify-center text-campus-forest">
              <Sparkles className="w-6 h-6 text-campus-amber" />
            </div>
            <h3 className="text-base font-bold text-campus-forest font-heading">
              No matching items found yet. We'll notify you when a relevant match appears.
            </h3>
            <p className="text-xs text-campus-charcoal/70 leading-relaxed">
              Our AI matching engine scans all new campus reports in real-time. Only qualified matches with a score of 50% or higher will be presented to you.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => navigate('report_lost')}
                className="px-4 py-2 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase cursor-pointer"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => navigate('report_found')}
                className="px-4 py-2 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase cursor-pointer"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(({ item, type, isOwn, matchScore, matchId }) => {
              const isLost = type === 'lost';
              const dateText = isLost
                ? `Lost ${(item as LostItemReport).dateLost}`
                : `Found ${(item as FoundItemReport).dateFound}`;

              return (
                <div
                  key={`${type}_${item.id}`}
                  onClick={() => {
                    if (matchId) {
                      navigate('match_review', { matchId });
                    } else {
                      navigate('item_detail', { itemId: item.id, itemType: type });
                    }
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-campus-sage/30 hover:border-campus-amber hover:shadow-lg transition cursor-pointer group flex flex-col"
                >
                  <div className="relative h-48 w-full bg-campus-ivory/50 overflow-hidden flex items-center justify-center">
                    <ItemImage
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                          isLost ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {isLost ? 'Lost' : 'Found'}
                      </span>
                      {matchScore ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-campus-amber text-campus-charcoal shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {matchScore}% Match
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                          {isOwn ? 'My Report' : item.category}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-white/90 text-campus-charcoal shadow-xs">
                        #{item.id}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-campus-forest group-hover:text-campus-amber transition line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-campus-sage/20 space-y-1.5 text-[11px] text-campus-charcoal/70">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-campus-sage flex-shrink-0" />
                          <span>{dateText}</span>
                        </div>
                        <span className="text-campus-forest font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          {matchScore ? 'Review Match' : 'View Details'} <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
