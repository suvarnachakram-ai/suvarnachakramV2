import React, { useState } from 'react';
import { Mail, Phone, User, Calendar, Trash2, Eye, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ContactMessage } from '../../types';
import GlassCard from '../GlassCard';

export default function AdminContacts() {
  const { contacts, deleteContact } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewContact = (contact: ContactMessage) => {
    setSelectedContact(contact);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Contact Messages</h1>
          <p className="text-gray-300">View and manage customer inquiries and support requests</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {contacts.length} messages
        </div>
      </div>

      {/* Search */}
      <GlassCard className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
      </GlassCard>

      {/* Contacts List */}
      <GlassCard className="overflow-hidden">
        {filteredContacts.length > 0 ? (
          <div className="divide-y divide-white/10">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span className="font-semibold text-white">{contact.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6 mb-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">{contact.message}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="text-yellow-400 hover:text-yellow-300 p-2"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-lg">No contact messages found</div>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No messages have been received yet'}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Contact Details</h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <div className="text-white">{selectedContact.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="text-white">{selectedContact.email}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <div className="text-white">{selectedContact.phone}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <div className="text-white">{new Date(selectedContact.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <div className="glass-card p-4 text-white whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}