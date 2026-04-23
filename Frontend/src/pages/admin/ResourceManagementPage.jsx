import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

export default function ResourceManagementPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const resources = [
    {
      title:    'Parking Slots',
      desc:     'View, add, edit, and manage the status of all campus parking slots across all zones and types.',
      count:    '624 slots across 26 zones',
      color:    'border-blue-500',
      iconBg:   'bg-blue-100',
      iconText: 'text-blue-600',
      icon:     '🅿️',
      href:     '/admin/parking-slots',
      actions: [
        { label: 'View All Slots',   href: '/admin/parking-slots' },
        { label: 'Add New Slot',     href: '/admin/parking-slots?action=add' },
      ],
    },
    {
      title:    'Helmet Inventory',
      desc:     'Manage the physical helmet catalogue — add new helmets, update condition, and track availability.',
      count:    'Physical helmet assets',
      color:    'border-purple-500',
      iconBg:   'bg-purple-100',
      iconText: 'text-purple-600',
      icon:     '⛑️',
      href:     '/admin/helmets',
      actions: [
        { label: 'View All Helmets', href: '/admin/helmets' },
        { label: 'Add New Helmet',   href: '/admin/helmets?action=add' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Resource Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facilities & Assets Catalogue</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the complete catalogue of bookable campus resources — parking slots and helmets.
          </p>
        </div>

        {/* Resource cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map(res => (
            <div key={res.title} className={`bg-white rounded-2xl shadow-sm border-l-4 ${res.color} overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${res.iconBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {res.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{res.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{res.count}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{res.desc}</p>
                <div className="flex gap-2">
                  {res.actions.map(a => (
                    <button
                      key={a.label}
                      onClick={() => navigate(a.href)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                        a.href.includes('action=add')
                          ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-800'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">API Endpoints Available</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { module: 'Parking Slots',   methods: ['GET', 'GET /{id}', 'POST', 'PUT /{id}', 'PATCH /{id}/status', 'DELETE /{id}'] },
              { module: 'Helmets',         methods: ['GET', 'GET /{id}', 'POST', 'PUT /{id}', 'PATCH /{id}/status', 'DELETE /{id}'] },
            ].map(({ module, methods }) => (
              <div key={module}>
                <p className="text-xs font-bold text-gray-700 mb-2">/api/v1/{module === 'Parking Slots' ? 'parking-slots' : 'helmets'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {methods.map(m => (
                    <span key={m} className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
