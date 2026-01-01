'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

interface KeywordSet {
  id: string;
  type: 'planet' | 'sign';
  name: string;
  keywords: string[];
}

export default function SuperuserPage() {
  const { user, userRole, isSuperuser, isLoading } = useAuth();
  const [keywordSets, setKeywordSets] = useState<KeywordSet[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [selectedSet, setSelectedSet] = useState<KeywordSet | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'planet' | 'sign'>('planet');
  const router = useRouter();

  // Redirect non-superusers (wait for role to actually load)
  const isRoleLoaded = !isLoading && (userRole !== null || !user);

  useEffect(() => {
    if (isRoleLoaded && !isSuperuser) {
      router.push('/');
    }
  }, [isRoleLoaded, isSuperuser, router]);

  // Fetch keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      if (!isSuperuser) return;

      try {
        const response = await fetch('/api/keywords');
        if (response.ok) {
          const data = await response.json();
          setKeywordSets(data.keywords);
        }
      } catch (error) {
        console.error('Failed to fetch keywords:', error);
      } finally {
        setLoadingKeywords(false);
      }
    };

    if (isSuperuser) {
      fetchKeywords();
    }
  }, [isSuperuser]);

  const handleAddKeyword = async () => {
    if (!selectedSet || !newKeyword.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSet.id,
          keyword: newKeyword.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setKeywordSets(sets =>
          sets.map(s => s.id === selectedSet.id ? { ...s, keywords: data.keywords } : s)
        );
        setSelectedSet(prev => prev ? { ...prev, keywords: data.keywords } : null);
        setNewKeyword('');
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    if (!selectedSet) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/keywords?id=${selectedSet.id}&keyword=${encodeURIComponent(keyword)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setKeywordSets(sets =>
          sets.map(s => s.id === selectedSet.id ? { ...s, keywords: data.keywords } : s)
        );
        setSelectedSet(prev => prev ? { ...prev, keywords: data.keywords } : null);
      }
    } catch (error) {
      console.error('Failed to remove keyword:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedSet || selectedSet.keywords.length === 0) return;

    if (!confirm(`Delete all ${selectedSet.keywords.length} keywords from ${selectedSet.name}?`)) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/keywords?id=${selectedSet.id}&deleteAll=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setKeywordSets(sets =>
          sets.map(s => s.id === selectedSet.id ? { ...s, keywords: data.keywords } : s)
        );
        setSelectedSet(prev => prev ? { ...prev, keywords: data.keywords } : null);
      }
    } catch (error) {
      console.error('Failed to delete all keywords:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (user && userRole === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#a855f7] animate-spin" />
          </div>
          <p className="text-[#a855f7] text-sm tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isSuperuser) {
    return null;
  }

  const filteredSets = keywordSets.filter(s => s.type === activeTab);

  return (
    <div className="space-y-8 px-6 md:px-12">
      {/* Header */}
      <div
        className="relative rounded-2xl p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.1)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <svg className="w-7 h-7 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Keywords Editor
            </h1>
            <p className="text-[#6b7a90] text-sm mt-1">Manage calculator keywords for planets and signs</p>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div
        className="inline-flex p-2 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        <button
          onClick={() => { setActiveTab('planet'); setSelectedSet(null); }}
          className={`relative rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'planet'
              ? 'text-white'
              : 'text-[#6b7a90] hover:text-white'
          }`}
          style={{ paddingLeft: '5px', paddingRight: '12px', paddingTop: '5px', paddingBottom: '5px' }}
        >
          {activeTab === 'planet' && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <circle cx="12" cy="12" r="4" strokeWidth={2} />
            </svg>
            Planets
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('sign'); setSelectedSet(null); }}
          className={`relative rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'sign'
              ? 'text-white'
              : 'text-[#6b7a90] hover:text-white'
          }`}
          style={{ paddingLeft: '5px', paddingRight: '12px', paddingTop: '0px', paddingBottom: '0px' }}
        >
          {activeTab === 'sign' && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Zodiac Signs
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Planet/Sign List */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
          }}
        >
          <div className="py-4 border-b border-[#67e8f9]/10" style={{ paddingLeft: '12px', paddingRight: '16px' }}>
            <h2 className="text-[#67e8f9] font-semibold">
              {activeTab === 'planet' ? 'Planets' : 'Zodiac Signs'}
            </h2>
          </div>

          {loadingKeywords ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-[#67e8f9]/10">
              {filteredSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(set)}
                  className={`w-full py-4 text-left transition-all duration-200 hover:bg-[#a855f7]/10 ${
                    selectedSet?.id === set.id ? 'bg-[#a855f7]/20' : ''
                  }`}
                  style={{ paddingLeft: '12px', paddingRight: '16px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${selectedSet?.id === set.id ? 'text-[#a855f7]' : 'text-white'}`}>
                      {set.name}
                    </span>
                    <span className="text-[#6b7a90] text-sm">
                      {set.keywords.length} keywords
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Keywords Editor */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
          }}
        >
          {selectedSet ? (
            <>
              <div className="py-4 border-b border-[#67e8f9]/10 flex items-center justify-between" style={{ paddingLeft: '12px', paddingRight: '16px' }}>
                <h2 className="text-[#a855f7] font-semibold text-lg">
                  {selectedSet.name} Keywords
                </h2>
                <span className="text-[#6b7a90] text-sm">
                  {selectedSet.keywords.length} total
                </span>
              </div>

              {/* Add Keyword */}
              <div className="py-5 border-b border-[#67e8f9]/10" style={{ paddingLeft: '12px', paddingRight: '16px' }}>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder="Add new keyword..."
                    className="flex-1 py-3.5 rounded-xl bg-[#0a0e1a] border border-[#67e8f9]/20 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/50"
                    style={{ paddingLeft: '16px', paddingRight: '12px' }}
                  />
                  <button
                    onClick={handleAddKeyword}
                    disabled={saving || !newKeyword.trim()}
                    className="py-3.5 rounded-xl font-medium bg-[#a855f7] text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ paddingLeft: '24px', paddingRight: '24px' }}
                  >
                    {saving ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={saving || selectedSet.keywords.length === 0}
                    className="py-3.5 rounded-xl font-medium bg-[#f87171] text-white hover:shadow-[0_0_20px_rgba(248,113,113,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ paddingLeft: '24px', paddingRight: '24px' }}
                  >
                    Delete All
                  </button>
                </div>
              </div>

              {/* Keywords List */}
              <div className="max-h-[500px] overflow-y-auto" style={{ paddingLeft: '12px', paddingRight: '16px', paddingTop: '20px', paddingBottom: '20px' }}>
                <div className="flex flex-wrap gap-3">
                  {selectedSet.keywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="group flex items-center gap-3 py-2.5 rounded-lg bg-[#1a1f2e] border border-[#67e8f9]/10 hover:border-[#f87171]/30 transition-all duration-200"
                      style={{ paddingLeft: '14px', paddingRight: '12px' }}
                    >
                      <span className="text-[#b8c4d4] text-sm">{keyword}</span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={saving}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#6b7a90] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#a855f7]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-[#6b7a90]">
                Select a {activeTab === 'planet' ? 'planet' : 'sign'} to edit its keywords
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div
        className="rounded-xl px-8 py-6"
        style={{
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.15)',
        }}
      >
        <div className="flex items-start gap-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#a855f7]/10 text-[#a855f7] flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#a855f7] font-medium">How Keywords Work</h3>
            <p className="text-[#6b7a90] text-sm mt-1">
              These keywords appear in the calculator dropdowns. Users select from these options when building their astrological interpretations.
              Changes take effect immediately for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
