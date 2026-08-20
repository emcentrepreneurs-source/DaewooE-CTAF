import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  Building2,
  Briefcase,
  Key,
  LogIn,
  Search
} from 'lucide-react';
import { UserAccount } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onSwitchUser: (username: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}) => {
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for Add User
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'coordinator' | 'logistics' | 'user'>('coordinator');
  const [newDepartment, setNewDepartment] = useState('Logistics & Travel');
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('add');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        setError('Failed to fetch users from database');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error communicating with database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedUid = newUsername.trim();
    const trimmedEmail = newEmail.trim();
    const trimmedDisplayName = newDisplayName.trim() || trimmedUid;

    if (!trimmedUid) {
      setError('Please provide a Username / User ID');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid Email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: trimmedUid,
          email: trimmedEmail,
          displayName: trimmedDisplayName,
          role: newRole,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMessage(`User "${trimmedDisplayName}" successfully added to PostgreSQL!`);
        setNewUsername('');
        setNewDisplayName('');
        setNewEmail('');
        setNewRole('coordinator');
        fetchUsers();
        setActiveTab('list');
      } else {
        setError(json.error || 'Failed to add user');
      }
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.message || 'Error creating user in database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (idOrUid: number | string, username: string) => {
    if (username.toLowerCase() === 'admine&c') {
      alert('The root AdminE&C account is protected and cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to remove user "${username}" from the database?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${idOrUid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMessage(`User "${username}" removed.`);
        fetchUsers();
      } else {
        setError('Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-800/80">
            <Shield className="w-3 h-3 text-red-400" />
            Administrator
          </span>
        );
      case 'coordinator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
            <UserCheck className="w-3 h-3 text-indigo-400" />
            Travel Coordinator
          </span>
        );
      case 'logistics':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <Briefcase className="w-3 h-3 text-amber-400" />
            Logistics Lead
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <User className="w-3 h-3 text-zinc-400" />
            Standard User
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">User Management & Access Control</h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PostgreSQL / Cloud SQL
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add, manage, and switch active authorized users for the Mozambique LNG CCS JV TAF Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Status */}
        <div className="px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add New User
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Active Users ({usersList.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Current Session:</span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {currentUser}
            </span>
          </div>
        </div>

        {/* Notices */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-zinc-300">
          {activeTab === 'add' ? (
            <form onSubmit={handleAddUser} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-zinc-100 text-sm">New User Information</h3>
                </div>

                {/* Username / ID */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Username / User ID *</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Used for login identification</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="e.g. EricMatola or LogisticsLead"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Name / Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={e => setNewDisplayName(e.target.value)}
                      placeholder="e.g. Eric Matola"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Email Address *</span>
                    <span className="text-[10px] text-zinc-500 font-normal">For notification & profile sync</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="e.g. eric.matola@ccsjv.com"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Assigned Role & Permissions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                        newRole === 'coordinator'
                          ? 'bg-indigo-950/60 border-indigo-600 text-indigo-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="coordinator"
                        checked={newRole === 'coordinator'}
                        onChange={() => setNewRole('coordinator')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-zinc-200">Travel Coordinator</p>
                        <p className="text-[10px] text-zinc-400">Upload manifests & batch process TAF forms</p>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                        newRole === 'admin'
                          ? 'bg-red-950/60 border-red-600 text-red-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="admin"
                        checked={newRole === 'admin'}
                        onChange={() => setNewRole('admin')}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-semibold text-zinc-200">Administrator</p>
                        <p className="text-[10px] text-zinc-400">Full system & database management</p>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                        newRole === 'logistics'
                          ? 'bg-amber-950/60 border-amber-600 text-amber-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="logistics"
                        checked={newRole === 'logistics'}
                        onChange={() => setNewRole('logistics')}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <p className="font-semibold text-zinc-200">Logistics Lead</p>
                        <p className="text-[10px] text-zinc-400">Afungi Camp & charter flights management</p>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                        newRole === 'user'
                          ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="user"
                        checked={newRole === 'user'}
                        onChange={() => setNewRole('user')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-zinc-200">Standard User</p>
                        <p className="text-[10px] text-zinc-400">View individual travel documents</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Department / Project Unit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={e => setNewDepartment(e.target.value)}
                      placeholder="e.g. Engineering & Construction, HSE, Site Logistics"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving user to database...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Save & Add User to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Search & Stats Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, username, email..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={fetchUsers}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reload users from PostgreSQL"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Users List Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/60 shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-[11px] font-semibold">
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-500">
                          {isLoading ? 'Loading users from database...' : 'No users found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => {
                        const isCurrent = user.uid.toLowerCase() === currentUser.toLowerCase();
                        return (
                          <tr
                            key={user.id || user.uid}
                            className={`hover:bg-zinc-900/50 transition-colors ${
                              isCurrent ? 'bg-indigo-950/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-[11px] text-white shadow-sm">
                                  {(user.displayName || user.uid).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                    <span>{user.displayName || user.uid}</span>
                                    {isCurrent && (
                                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-normal">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono">@{user.uid}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                            <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{user.email}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isCurrent && (
                                  <button
                                    onClick={() => {
                                      onSwitchUser(user.uid);
                                      setSuccessMessage(`Switched active session to ${user.displayName || user.uid}`);
                                    }}
                                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                    title="Switch active user session"
                                  >
                                    <LogIn className="w-3 h-3" />
                                    Switch
                                  </button>
                                )}
                                {user.uid.toLowerCase() !== 'admine&c' && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id || user.uid, user.displayName || user.uid)}
                                    className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role-Based Access Control (RBAC) • Mozambique LNG</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
