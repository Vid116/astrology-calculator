'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_admin: boolean;
  is_superuser: boolean;
}

interface Suggestion {
  id: string;
  user_email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAdmin, router]);

  // Fetch all users with their roles
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        // Fetch users from auth.users via API route (we'll need to create this)
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isAdmin) return;

      try {
        const response = await fetch('/api/admin/suggestions');
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (isAdmin) {
      fetchSuggestions();
    }
  }, [isAdmin]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return { bg: 'bg-[#67e8f9]/20', text: 'text-[#67e8f9]', border: 'border-[#67e8f9]/30' };
      case 'bug': return { bg: 'bg-[#f87171]/20', text: 'text-[#f87171]', border: 'border-[#f87171]/30' };
      case 'improvement': return { bg: 'bg-[#ffd800]/20', text: 'text-[#ffd800]', border: 'border-[#ffd800]/30' };
      default: return { bg: 'bg-[#a1a1aa]/20', text: 'text-[#a1a1aa]', border: 'border-[#a1a1aa]/30' };
    }
  };

  const toggleSuperuser = async (userId: string, currentValue: boolean) => {
    setSavingUserId(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          is_superuser: !currentValue,
        }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, is_superuser: !currentValue } : u
        ));
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setSavingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="pb-16" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
      {/* Header */}
      <div
        className="relative rounded-2xl p-8 md:p-10"
        style={{
          marginTop: '25px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(255, 216, 0, 0.3)',
          boxShadow: '0 0 40px rgba(255, 216, 0, 0.1)',
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 216, 0, 0.2) 0%, rgba(255, 184, 0, 0.1) 100%)',
              border: '1px solid rgba(255, 216, 0, 0.3)',
            }}
          >
            <svg className="w-7 h-7 text-[#ffd800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Admin Panel
            </h1>
            <p className="text-[#6b7a90] text-sm mt-2">Manage users and superuser access</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          marginTop: '7px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="p-8 border-b border-[#67e8f9]/10" style={{ paddingLeft: '7px' }}>
          <h2 className="text-lg font-semibold text-[#67e8f9]" style={{ marginLeft: '5px' }}>User Management</h2>
          <p className="text-[#6b7a90] text-sm mt-2" style={{ marginLeft: '5px' }}>Toggle superuser status for users</p>
        </div>

        {loadingUsers ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#67e8f9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-[#6b7a90]">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-[#67e8f9]/10">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-6 md:p-8 flex items-center justify-between hover:bg-[#67e8f9]/5 transition-colors"
              >
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                      ${u.is_admin
                        ? 'bg-[#ffd800]/20 text-[#ffd800] ring-2 ring-[#ffd800]/50'
                        : u.is_superuser
                          ? 'bg-[#a855f7]/20 text-[#a855f7] ring-2 ring-[#a855f7]/50'
                          : 'bg-[#67e8f9]/10 text-[#67e8f9]'
                      }
                    `}
                  >
                    {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">
                        {u.full_name || u.email.split('@')[0]}
                      </span>
                      {u.is_admin && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#ffd800]/20 text-[#ffd800] border border-[#ffd800]/30">
                          Admin
                        </span>
                      )}
                      {u.is_superuser && !u.is_admin && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">
                          Superuser
                        </span>
                      )}
                    </div>
                    <p className="text-[#6b7a90] text-sm mt-1">{u.email}</p>
                  </div>
                </div>

                {/* Superuser Toggle */}
                {!u.is_admin && (
                  <button
                    onClick={() => toggleSuperuser(u.id, u.is_superuser)}
                    disabled={savingUserId === u.id}
                    className={`
                      relative w-14 h-7 rounded-full transition-all duration-300
                      ${u.is_superuser
                        ? 'bg-[#a855f7]'
                        : 'bg-[#374151]'
                      }
                      ${savingUserId === u.id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-90'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
                        ${u.is_superuser ? 'left-8' : 'left-1'}
                      `}
                    />
                  </button>
                )}

                {u.is_admin && u.id !== user?.id && (
                  <span className="text-[#6b7a90] text-sm italic">Admin (cannot modify)</span>
                )}

                {u.is_admin && u.id === user?.id && (
                  <span className="text-[#ffd800] text-sm italic">You (Admin)</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          marginTop: '7px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="p-8 border-b border-[#67e8f9]/10" style={{ paddingLeft: '7px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#67e8f9]" style={{ marginLeft: '5px' }}>User Suggestions</h2>
              <p className="text-[#6b7a90] text-sm mt-2" style={{ marginLeft: '5px' }}>Feedback and feature requests from users</p>
            </div>
            {suggestions.length > 0 && (
              <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-[#67e8f9]/10 text-[#67e8f9] border border-[#67e8f9]/20">
                {suggestions.length} total
              </span>
            )}
          </div>
        </div>

        {loadingSuggestions ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#67e8f9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-[#67e8f9]/5 mb-6">
              <svg className="w-10 h-10 text-[#67e8f9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-[#6b7a90] text-base">No suggestions yet</p>
            <p className="text-[#4a5568] text-sm mt-2">User feedback will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#67e8f9]/10" style={{ padding: '10px 7px' }}>
            {suggestions.map((suggestion) => {
              const colors = getCategoryColor(suggestion.category);
              const isExpanded = expandedSuggestion === suggestion.id;

              return (
                <div
                  key={suggestion.id}
                  className="hover:bg-[#67e8f9]/5 transition-colors cursor-pointer"
                  style={{ padding: '20px 15px', marginTop: '5px', marginBottom: '5px' }}
                  onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${colors.bg} ${colors.text} border ${colors.border} capitalize`}>
                          {suggestion.category}
                        </span>
                        <span className="text-[#4a5568] text-xs">
                          {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="text-white font-medium text-base truncate" style={{ marginLeft: '5px' }}>{suggestion.subject}</h3>
                      <p className="text-[#6b7a90] text-sm mt-3" style={{ marginLeft: '5px' }}>{suggestion.user_email}</p>

                      {/* Expanded Message */}
                      {isExpanded && (
                        <div
                          className="rounded-xl"
                          style={{
                            marginTop: '15px',
                            padding: '18px 20px',
                            background: 'rgba(103, 232, 249, 0.03)',
                            border: '1px solid rgba(103, 232, 249, 0.1)',
                          }}
                        >
                          <p className="text-[#a1a1aa] text-sm whitespace-pre-wrap leading-relaxed">{suggestion.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <svg
                      className={`w-5 h-5 text-[#6b7a90] transition-transform duration-200 flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div
        className="rounded-xl"
        style={{
          marginTop: '7px',
          padding: '20px 7px',
          background: 'rgba(103, 232, 249, 0.05)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
        }}
      >
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#67e8f9]/10 text-[#67e8f9] flex-shrink-0" style={{ marginLeft: '5px' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#67e8f9] font-medium text-base">About Roles</h3>
            <ul className="text-[#6b7a90] text-sm mt-3 space-y-2">
              <li><span className="text-[#ffd800]">Admin</span> - Full access to admin panel and user management</li>
              <li><span className="text-[#a855f7]">Superuser</span> - Enhanced permissions (to be configured)</li>
              <li><span className="text-[#67e8f9]">User</span> - Standard user access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
