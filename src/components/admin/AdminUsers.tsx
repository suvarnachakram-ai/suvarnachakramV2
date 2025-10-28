import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User, Mail } from 'lucide-react';
import supabase from '../../lib/supabase';
import GlassCard from '../GlassCard';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Since we can't use admin.listUsers without service role, 
      // we'll show a message about user management
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      alert('User created successfully! They will receive a confirmation email.');
      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">User Management</h1>
          <p className="text-gray-300">Create new admin accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add User
        </button>
      </div>

      {/* Info Card */}
      <GlassCard className="p-8 text-center">
        <Shield className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
        <p className="text-gray-300 mb-6">
          Create new admin accounts using the "Add User" button above. 
          New users will receive a confirmation email to activate their account.
        </p>
        <div className="text-sm text-gray-400">
          To view existing users, check your Supabase dashboard under Authentication → Users
        </div>
      </GlassCard>

      {/* User Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Add New Admin User
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      email: '',
                      password: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add User'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}