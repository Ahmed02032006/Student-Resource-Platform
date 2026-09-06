import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import HeaderComponent from '../components/HeaderComponent';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Calculator,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const formatEmail = (email) => {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;

    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex);

    return `${username.substring(0, 3)}...${domain}`;
  };

  const getInitial = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const tabs = [
    {
      name: "My Dashboard",
      icon: LayoutDashboard,
      label: "My Dashboard",
      path: "/dashboard"
    },
    {
      name: "Course Library",
      icon: BookOpen,
      label: "Course Library",
      path: "/courses"
    },
    {
      name: "AI Companion",
      icon: Sparkles,
      label: "AI Companion",
      path: "/your-gpt"
    },
    {
      name: "GPA Calculator",
      icon: Calculator,
      label: "GPA Calculator",
      path: "/gpa-calculator"
    }
  ];

  if (user?.role === 'admin') {
    tabs.push({
      name: "Admin Panel",
      icon: ShieldAlert,
      label: "Admin Panel",
      path: "/admin/dashboard"
    });
  }

  const toggleSubItems = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleLogout = (e) => {
    e?.preventDefault();
    dispatch(logout());
    toast.success("User logged out successfully");
    navigate('/login');
  };

  const getHeaderTitle = () => {
    if (location.pathname.startsWith('/courses') || location.pathname.startsWith('/course/')) {
      return {
        title: 'Courses Workspace',
        subtitle: 'Browse enrolled courses, materials, and access requests',
      };
    }
    if (location.pathname.startsWith('/your-gpt')) {
      return {
        title: 'Your GPT — AI Assistant',
        subtitle: 'Personalized AI study helper, document summarizer, and tutor',
      };
    }
    if (location.pathname.startsWith('/gpa-calculator')) {
      return {
        title: 'GPA & CGPA Calculator',
        subtitle: 'Calculate course grades, term GPA, and target progress',
      };
    }
    return {
      title: 'Dashboard Overview',
      subtitle: 'Overview of your academic activities and learning materials',
    };
  };

  const headerInfo = getHeaderTitle();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <div className="flex flex-1 min-h-0">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md bg-slate-600 text-white shadow-md"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Sidebar Container */}
        <div className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}`}>

          <aside className="h-full bg-white text-slate-800 flex flex-col border-r border-slate-200">
            {/* Desktop Toggle Button */}
            <button
              onClick={handleSidebarToggle}
              className="absolute -right-3 top-7 z-50 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Top Gradient Bar */}
            <div className="bg-gradient-to-b to-blue-300 from-blue-600 h-4 rounded-bl-full"></div>

            {/* School / App Header */}
            <div className="py-[9px] border-b border-slate-200 w-full bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-center">
                {sidebarOpen ? (
                  <div
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl orbitron text-slate-900 font-bold tracking-wider">ACADEX</p>
                  </div>
                ) : (
                  <div
                    onClick={() => navigate("/dashboard")}
                    className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {tabs.map(({ name, icon: Icon, label, path, subItems }) => (
                <div key={name}>
                  {!subItems ? (
                    <button
                      onClick={() => {
                        navigate(path);
                        setMobileMenuOpen(false);
                      }}
                      className={`group relative cursor-pointer flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} w-full p-2 rounded-sm transition-all duration-200
                        ${isActive(path)
                          ? "text-slate-700 font-medium bg-slate-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-600"
                        }`}
                    >
                      <div className={`relative p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                        <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                      </div>
                      {sidebarOpen && (
                        <span className={`ml-3 text-sm ${isActive(path) ? 'text-slate-700' : 'text-slate-600'}`}>{label}</span>
                      )}
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleSubItems(name)}
                        className={`group relative cursor-pointer flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} w-full p-2 rounded-sm transition-all duration-200
                          ${isActive(path)
                            ? "text-slate-700 font-medium bg-slate-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-600"
                          }`}
                      >
                        <div className="flex items-center">
                          <div className={`relative p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                            <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                          </div>
                          {sidebarOpen && (
                            <span className={`ml-3 text-sm ${isActive(path) ? 'text-slate-700' : 'text-slate-600'}`}>{label}</span>
                          )}
                        </div>
                        {sidebarOpen && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${expandedItems[name] ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                      {expandedItems[name] && sidebarOpen && (
                        <div className="ml-4 mt-1 mb-2 space-y-1">
                          {subItems.map((subItem) => (
                            <button
                              key={subItem.path}
                              onClick={() => {
                                navigate(subItem.path);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left py-2 px-4 text-sm rounded transition-all ${isActive(subItem.path)
                                ? "bg-slate-200 text-slate-800 font-medium"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                              <div className="flex items-center">
                                <ChevronRight className={`w-3 h-3 mr-2 ${isActive(subItem.path) ? 'text-slate-700' : 'text-slate-500'}`} />
                                {subItem.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-slate-200 p-3">
              {sidebarOpen ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="text-white font-semibold text-sm">{getInitial()}</span>
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-800 truncate leading-tight">
                      {user?.name || 'Student / Teacher'}
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate" title={user?.email}>
                      {formatEmail(user?.email || 'user@attmark.edu')}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 shadow-sm transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 shadow-sm transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <HeaderComponent
            heading={headerInfo.title}
            subHeading={headerInfo.subtitle}
            role="superAdmin"
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
