import React from 'react';
import {NavLink} from 'react-router-dom';
import {FileText, LayoutDashboard, Settings, Users,} from 'lucide-react';

const Sidebar: React.FC = () => {
    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'Invoices',
            href: '/invoices',
            icon: FileText
        },
        {
            name: 'Clients',
            href: '/clients',
            icon: Users
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings
        }
    ];

    return (
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <div className="p-6">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({isActive}) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3"/>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;