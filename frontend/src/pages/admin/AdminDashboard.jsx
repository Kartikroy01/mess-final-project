import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import {
  Home,
  Users,
  Building2,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Check,
  Ban,
  Lock,
  Eye,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  FileText
} from 'lucide-react';
import AdminBillReportPage from './AdminBillReportPage';

export default function AdminDashboard() {
  const getBranchFromRollNo = (rollNo) => {
    if (!rollNo || rollNo.length < 5) return "N/A";
    const code = rollNo.substring(2, 5);
    const branches = {
      "103": "Computer Science & Eng. (CSE)",
      "104": "Information Technology (IT)",
      "106": "Electronics & Comm. Eng. (ECE)",
      "109": "Mechanical Eng. (ME)",
      "102": "Chemical Eng. (CH)",
      "105": "Civil Eng. (CE)",
      "107": "Electrical Eng. (EE)",
      "108": "Instrumentation & Control (ICE)",
      "110": "Industrial & Production (IPE)",
      "111": "Biotechnology (BT)",
      "112": "Textile Technology (TT)"
    };
    return branches[code] || "Engineering";
  };

  const getYearFromRollNo = (rollNo) => {
    if (!rollNo || rollNo.length < 2) return "N/A";
    const startYear = 2000 + parseInt(rollNo.substring(0, 2));
    const currentYear = new Date().getFullYear();
    const diff = currentYear - startYear;
    if (diff === 0) return "1st Year";
    if (diff === 1) return "2nd Year";
    if (diff === 2) return "3rd Year";
    if (diff === 3) return "4th Year";
    return `Batch of ${startYear}`;
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 768);
  
  // Auto-resize sidebar visibility handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth state
  const authUserString = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
  const authUser = authUserString ? JSON.parse(authUserString) : null;
  const token = authUser?.token;

  // Data states
  const [stats, setStats] = useState({ loading: true, data: null, error: null });
  const [hostels, setHostels] = useState({ loading: true, data: [], error: null });
  const [selectedHostel, setSelectedHostel] = useState(null); // String hostel name
  const [hostelDetails, setHostelDetails] = useState({ loading: false, data: null, error: null });
  const [students, setStudents] = useState({ loading: true, data: [], error: null });
  const [staff, setStaff] = useState({ loading: true, data: [], error: null }); // Combined Munshis & Clerks

  // Search & Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentHostelFilter, setStudentHostelFilter] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffHostelFilter, setStaffHostelFilter] = useState('');

  // Hostel Detail Sub-tab
  const [hostelSubTab, setHostelSubTab] = useState('students'); // students, munshis, clerks, bills, menu

  // Weekly Menu States
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const [adminWeeklyMenu, setAdminWeeklyMenu] = useState({});
  const [adminMenuImages, setAdminMenuImages] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Staff CRUD Modals
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // Staff object to edit
  
  // Student View Details Modal
  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);
  const [assigningMunshi, setAssigningMunshi] = useState(null);
  const [sourceHostelFilter, setSourceHostelFilter] = useState('');
  const [sourceStudentsList, setSourceStudentsList] = useState([]);
  const [loadingSourceStudents, setLoadingSourceStudents] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState(null);
  const [selectedSourceStudentIds, setSelectedSourceStudentIds] = useState([]);
  const [batchAssigning, setBatchAssigning] = useState(false);
  
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    hostel: '',
    type: 'munshi'
  });

  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    hostel: '',
    type: 'munshi'
  });

  // Verification & Auth check
  useEffect(() => {
    if (!token || authUser?.role !== 'admin') {
      window.location.href = '/login';
    }
  }, [token, authUser]);

  // Fetch students from source hostel for reassigning
  const handleSourceHostelChange = async (sourceHostel) => {
    setSourceHostelFilter(sourceHostel);
    setSelectedSourceStudentIds([]);
    if (!sourceHostel) {
      setSourceStudentsList([]);
      return;
    }
    try {
      setLoadingSourceStudents(true);
      const res = await fetch(`${API_BASE_URL}/admin/students?hostelNo=${sourceHostel}`, { headers });
      const json = await res.json();
      if (json.success) {
        setSourceStudentsList(json.data);
      } else {
        alert(json.message || "Failed to load students");
      }
    } catch (err) {
      console.error("Error loading source students:", err);
      alert("Error: " + err.message);
    } finally {
      setLoadingSourceStudents(false);
    }
  };

  // Headers for API calls
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Fixed list of hostels
  const HOSTELS_LIST = [
    "MBH-A", "MBH-B", "MBH-E", "MBH-F",
    "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7",
    "GH-1", "GH-2",
    "MGH-1", "MGH-2"
  ];

  // Fetch Dashboard Stats & Hostels list
  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      setHostels(prev => ({ ...prev, loading: true }));

      const [statsRes, hostelsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/hostels`, { headers })
      ]);

      const statsJson = await statsRes.json();
      const hostelsJson = await hostelsRes.json();

      if (statsJson.success) {
        setStats({ loading: false, data: statsJson.data, error: null });
      } else {
        setStats({ loading: false, data: null, error: statsJson.message });
      }

      if (hostelsJson.success) {
        setHostels({ loading: false, data: hostelsJson.data, error: null });
      } else {
        setHostels({ loading: false, data: [], error: hostelsJson.message });
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setStats({ loading: false, data: null, error: err.message });
      setHostels({ loading: false, data: [], error: err.message });
    }
  };

  // Fetch Hostel Details
  const fetchHostelDetails = async (hostelNo) => {
    try {
      setHostelDetails({ loading: true, data: null, error: null });
      const res = await fetch(`${API_BASE_URL}/admin/hostels/${hostelNo}`, { headers });
      const json = await res.json();

      if (json.success) {
        setHostelDetails({ loading: false, data: json.data, error: null });
      } else {
        setHostelDetails({ loading: false, data: null, error: json.message });
      }
    } catch (err) {
      console.error(`Error fetching details for ${hostelNo}:`, err);
      setHostelDetails({ loading: false, data: null, error: err.message });
    }
  };

  // Fetch Students List
  const fetchStudents = async (hostelVal = studentHostelFilter) => {
    if (!hostelVal) {
      setStudents({ loading: false, data: [], error: null });
      return;
    }
    try {
      setStudents(prev => ({ ...prev, loading: true }));
      const res = await fetch(`${API_BASE_URL}/admin/students?hostelNo=${hostelVal}`, { headers });
      const json = await res.json();

      if (json.success) {
        setStudents({ loading: false, data: json.data, error: null });
      } else {
        setStudents({ loading: false, data: [], error: json.message });
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents({ loading: false, data: [], error: err.message });
    }
  };

  const handleHostelFilterChange = (e) => {
    const val = e.target.value;
    setStudentHostelFilter(val);
    fetchStudents(val);
  };

  // Fetch Munshis & Clerks
  const fetchStaff = async () => {
    try {
      setStaff(prev => ({ ...prev, loading: true }));
      const [munshisRes, clerksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/munshis`, { headers }),
        fetch(`${API_BASE_URL}/admin/clerks`, { headers })
      ]);

      const munshisJson = await munshisRes.json();
      const clerksJson = await clerksRes.json();

      let combinedStaff = [];
      if (munshisJson.success) {
        combinedStaff = [...combinedStaff, ...munshisJson.data.map(m => ({ ...m, role: 'munshi' }))];
      }
      if (clerksJson.success) {
        combinedStaff = [...combinedStaff, ...clerksJson.data.map(c => ({ ...c, role: 'clerk' }))];
      }

      setStaff({ loading: false, data: combinedStaff, error: null });
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaff({ loading: false, data: [], error: err.message });
    }
  };

  // Initial loads
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Load data based on tab selection
  useEffect(() => {
    if (!token) return;
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'munshis' || activeTab === 'clerks') {
      fetchStaff();
    } else if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab, token]);

  // Fetch weekly menu when hostelSubTab is set to 'menu'
  useEffect(() => {
    if (hostelSubTab === 'menu' && selectedHostel && token) {
      fetchHostelMenu(selectedHostel);
    }
  }, [hostelSubTab, selectedHostel, token]);

  const fetchHostelMenu = async (hostelNo) => {
    setLoadingMenu(true);
    try {
      const defaultMenu = {};
      days.forEach(day => {
        defaultMenu[day] = {};
        mealTypes.forEach(type => {
          defaultMenu[day][type] = [{ name: "", price: 0, image: "", isAvailable: true }];
        });
      });
      setAdminWeeklyMenu(defaultMenu);
      setAdminMenuImages({});

      const res = await fetch(`${API_BASE_URL}/admin/menu/${hostelNo}`, { headers });
      const json = await res.json();
      if (json.success) {
        const newMenu = JSON.parse(JSON.stringify(defaultMenu));
        const resData = json.data;

        Object.keys(resData).forEach(mealType => {
          if (resData[mealType]) {
            resData[mealType].forEach(item => {
              if (item.day && newMenu[item.day]) {
                newMenu[item.day][mealType] = [{
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  isAvailable: item.isAvailable,
                  existingImage: item.image
                }];
              }
            });
          }
        });
        setAdminWeeklyMenu(newMenu);
      } else {
        alert(json.message || "Failed to load hostel menu");
      }
    } catch (err) {
      console.error("Error loading hostel menu:", err);
      alert("Error: " + err.message);
    } finally {
      setLoadingMenu(false);
    }
  };

  const saveHostelMenu = async () => {
    setSavingMenu(true);
    try {
      const formData = new FormData();
      const menuToSave = JSON.parse(JSON.stringify(adminWeeklyMenu));
      
      Object.keys(menuToSave).forEach(day => {
        Object.keys(menuToSave[day]).forEach(mealType => {
          menuToSave[day][mealType].forEach((item, index) => {
            const imageKey = `${day}-${mealType}-${index}`;
            if (adminMenuImages[imageKey]) {
              item.imageKey = imageKey;
              formData.append(imageKey, adminMenuImages[imageKey]);
            }
          });
        });
      });

      formData.append('menuData', JSON.stringify(menuToSave));
      
      const res = await fetch(`${API_BASE_URL}/admin/menu/${selectedHostel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const json = await res.json();
      if (json.success) {
        alert("Weekly menu saved successfully!");
        fetchHostelMenu(selectedHostel);
      } else {
        alert(json.message || "Failed to save weekly menu");
      }
    } catch (err) {
      console.error("Error saving weekly menu:", err);
      alert("Error: " + err.message);
    } finally {
      setSavingMenu(false);
    }
  };

  const handleAdminMenuChange = (day, mealType, field, value) => {
    setAdminWeeklyMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [{
          ...prev[day][mealType][0],
          [field]: value
        }]
      }
    }));
  };

  const handleAdminImageUpload = (day, mealType, file) => {
    if (file) {
      const key = `${day}-${mealType}-0`;
      setAdminMenuImages(prev => ({ ...prev, [key]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAdminMenuChange(day, mealType, 'preview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle hostel click to open details
  const handleHostelClick = (hostelNo) => {
    setSelectedHostel(hostelNo);
    setHostelSubTab('students');
    fetchHostelDetails(hostelNo);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  // ==================== CRUD OPERATIONS ====================

  // 1. Verify Student
  const handleVerifyStudent = async (studentId, currentVerified) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/verify`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isVerified: !currentVerified })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'students') fetchStudents();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 2. Toggle Student Active
  const handleToggleStudentActive = async (studentId, currentActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'students') fetchStudents();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 3. Delete Student
  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student profile permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'students') fetchStudents();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 3.5. View Student Details & History
  const handleViewStudentDetails = async (studentId) => {
    try {
      setLoadingStudentDetails(true);
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/details`, { headers });
      const json = await res.json();
      if (json.success) {
        setSelectedStudentDetails(json.data);
      } else {
        alert(json.message || "Failed to load student details");
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      alert("Error: " + err.message);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  // 3.6. Assign Student to Munshi/Hostel
  const handleAssignStudent = async (studentId, hostelNo) => {
    try {
      setAssigningStudentId(studentId);
      const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/assign`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ hostelNo })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Student successfully reassigned to ${hostelNo}!`);
        // Refresh local views
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'students') fetchStudents();
        fetchDashboardData();
        // Refresh source hostel students list
        if (sourceHostelFilter) {
          const sourceRes = await fetch(`${API_BASE_URL}/admin/students?hostelNo=${sourceHostelFilter}`, { headers });
          const sourceJson = await sourceRes.json();
          if (sourceJson.success) {
            setSourceStudentsList(sourceJson.data);
          }
        }
      } else {
        alert(data.message || 'Assignment failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAssigningStudentId(null);
    }
  };

  // 3.7. Batch Assign Students to Munshi/Hostel
  const handleBatchAssignStudents = async (hostelNo) => {
    if (selectedSourceStudentIds.length === 0) {
      alert("Please select at least one student to assign");
      return;
    }
    
    const confirmAssign = window.confirm(`Are you sure you want to reassign ${selectedSourceStudentIds.length} students to ${hostelNo}?`);
    if (!confirmAssign) return;

    try {
      setBatchAssigning(true);
      const res = await fetch(`${API_BASE_URL}/admin/students/batch-assign`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          studentIds: selectedSourceStudentIds,
          hostelNo
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Successfully reassigned ${selectedSourceStudentIds.length} students to ${hostelNo}!`);
        setSelectedSourceStudentIds([]); // Clear selection
        
        // Refresh local views
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'students') fetchStudents();
        fetchDashboardData();
        
        // Refresh source hostel list
        if (sourceHostelFilter) {
          const sourceRes = await fetch(`${API_BASE_URL}/admin/students?hostelNo=${sourceHostelFilter}`, { headers });
          const sourceJson = await sourceRes.json();
          if (sourceJson.success) {
            setSourceStudentsList(sourceJson.data);
          }
        }
      } else {
        alert(data.message || 'Batch assignment failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBatchAssigning(false);
    }
  };

  // 4. Create Staff (Munshi/Clerk)
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.password || !staffForm.hostel || !staffForm.type) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddStaffModalOpen(false);
        setStaffForm({ name: '', email: '', password: '', hostel: '', type: 'munshi' });
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'munshis' || activeTab === 'clerks') fetchStaff();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 5. Open Edit Modal
  const openEditStaffModal = (member) => {
    setEditingStaff(member);
    setEditStaffForm({
      name: member.name,
      email: member.email,
      password: '', // blank by default (only change if entered)
      hostel: member.hostel,
      type: member.role || member.type
    });
    setIsEditStaffModalOpen(true);
  };

  // 6. Update Staff
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editStaffForm.name || !editStaffForm.email || !editStaffForm.hostel || !editStaffForm.type) {
      alert('Fields cannot be blank');
      return;
    }
    try {
      const updatePayload = {
        name: editStaffForm.name,
        email: editStaffForm.email,
        hostel: editStaffForm.hostel,
        type: editStaffForm.type
      };
      if (editStaffForm.password && editStaffForm.password.length >= 6) {
        updatePayload.password = editStaffForm.password;
      }
      
      const res = await fetch(`${API_BASE_URL}/admin/staff/${editingStaff._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditStaffModalOpen(false);
        setEditingStaff(null);
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'munshis' || activeTab === 'clerks') fetchStaff();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 7. Toggle Staff Active
  const handleToggleStaffActive = async (staffId, currentActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff/${staffId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'munshis' || activeTab === 'clerks') fetchStaff();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // 8. Delete Staff
  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        if (selectedHostel) fetchHostelDetails(selectedHostel);
        if (activeTab === 'munshis' || activeTab === 'clerks') fetchStaff();
        fetchDashboardData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filters logic
  const filteredStudents = students.data.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesHostel = studentHostelFilter === '' || s.hostelNo.toUpperCase() === studentHostelFilter.toUpperCase();
    return matchesSearch && matchesHostel;
  });

  const filteredMunshis = staff.data.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesHostel = staffHostelFilter === '' || s.hostel.toUpperCase() === staffHostelFilter.toUpperCase();
    return matchesSearch && matchesHostel && s.role === 'munshi';
  });

  const filteredClerks = staff.data.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesHostel = staffHostelFilter === '' || s.hostel.toUpperCase() === staffHostelFilter.toUpperCase();
    return matchesSearch && matchesHostel && s.role === 'clerk';
  });

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`bg-[#003B6F] text-white w-64 fixed inset-y-0 left-0 transform ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isSidebarVisible ? 'md:flex' : 'md:hidden'} transition-all duration-300 ease-in-out z-50 flex flex-col justify-between shadow-2xl shrink-0 h-full`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
          {/* Header/Logo */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight block">NITJ MESS</span>
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Admin Portal</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarVisible(false)} className="md:hidden text-slate-300 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Admin Info Profile */}
          <div className="p-4 mx-4 my-4 bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-slate-100 truncate">{authUser?.admin?.name || 'System Admin'}</h4>
              <p className="text-[10px] text-slate-300 truncate">{authUser?.admin?.email || 'admin@nitj.ac.in'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 mt-6">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => { setActiveTab('dashboard'); setSelectedHostel(null); setSelectedStudentDetails(null); if (window.innerWidth < 768) setIsSidebarVisible(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('students'); setSelectedHostel(null); setSelectedStudentDetails(null); if (window.innerWidth < 768) setIsSidebarVisible(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <Users className="w-5 h-5" />
                  All Students
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('munshis'); setSelectedHostel(null); setSelectedStudentDetails(null); if (window.innerWidth < 768) setIsSidebarVisible(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${activeTab === 'munshis' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <Briefcase className="w-5 h-5" />
                  All Munshis
                </button>
              </li>
              <li className="mt-2">
                <button
                  onClick={() => { setActiveTab('clerks'); setSelectedHostel(null); setSelectedStudentDetails(null); if (window.innerWidth < 768) setIsSidebarVisible(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${activeTab === 'clerks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <Users className="w-5 h-5" />
                  All Clerks
                </button>
              </li>
              <li className="mt-2">
                <button
                  onClick={() => { setActiveTab('billreport'); setSelectedHostel(null); setSelectedStudentDetails(null); if (window.innerWidth < 768) setIsSidebarVisible(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${activeTab === 'billreport' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <FileText className="w-5 h-5" />
                  Bill Report
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Logout button at bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-300 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP BAR / UTILITY */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center justify-center bg-slate-50/50"
              title={isSidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedHostel ? `${selectedHostel} Management` : activeTab === 'munshis' ? 'All Munshis' : activeTab === 'clerks' ? 'All Clerks' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            Current Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          
          {/* --- VIEW: HOSTEL DETAIL VIEW (Overrides main tabs) --- */}
          {loadingStudentDetails ? (
            /* Beautiful inline details loading screen */
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center py-32 animate-in fade-in">
              <div className="w-12 h-12 border-4 border-[#003B6F] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 text-sm font-semibold animate-pulse">Retrieving student records...</p>
            </div>
          ) : selectedStudentDetails ? (
            /* Inline Details View */
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Back Navigation Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <button
                  onClick={() => setSelectedStudentDetails(null)}
                  className="flex items-center gap-2 text-sm font-bold text-[#003B6F] hover:text-indigo-705 transition cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                  Student Profile File
                </span>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Student Card Details */}
                  <div className="md:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-150 h-fit space-y-5">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={selectedStudentDetails.student.photo || 'https://placehold.co/120x120/3B82F6/FFF?text=ST'}
                        alt={selectedStudentDetails.student.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md mb-3"
                      />
                      <h4 className="font-extrabold text-slate-800 text-base">{selectedStudentDetails.student.name}</h4>
                      <p className="text-slate-500 text-xs font-semibold">{selectedStudentDetails.student.rollNo}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center mt-3">
                        {selectedStudentDetails.student.isVerified ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Verified</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Pending</span>
                        )}
                        {selectedStudentDetails.student.isActive ? (
                          <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Active</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Inactive</span>
                        )}
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hostel / Room</span>
                        <span className="text-slate-800 font-bold">{selectedStudentDetails.student.hostelNo} · Room {selectedStudentDetails.student.roomNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Branch</span>
                        <span className="text-slate-800 text-right">{getBranchFromRollNo(selectedStudentDetails.student.rollNo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Academic Year</span>
                        <span className="text-slate-800">{getYearFromRollNo(selectedStudentDetails.student.rollNo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email Address</span>
                        <span className="text-slate-800 lowercase select-all">{selectedStudentDetails.student.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone Number</span>
                        <span className="text-slate-800 select-all">{selectedStudentDetails.student.phoneNo || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Joining Date</span>
                        <span className="text-slate-800">{new Date(selectedStudentDetails.student.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Bills & Extras Tables */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Section: Bill History */}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <IndianRupee size={16} className="text-[#003B6F]" />
                        Monthly Bills History
                      </h4>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500">Period</th>
                                <th className="px-4 py-2.5 text-center font-bold text-slate-500">Diets</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500">Meal (₹)</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500">Extras (₹)</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500">Fines (₹)</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500">Total (₹)</th>
                                <th className="px-4 py-2.5 text-center font-bold text-slate-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {selectedStudentDetails.bills.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400 font-medium">No billing history found</td>
                                </tr>
                              ) : (
                                selectedStudentDetails.bills.map((bill, idx) => {
                                  const monthsList = [
                                    "January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                  ];
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-bold text-slate-700">{monthsList[bill.month - 1]} {bill.year}</td>
                                      <td className="px-4 py-3 text-center text-slate-600 font-semibold">{bill.mealCount || 0}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.mealCharges?.toFixed(2) || '0.00'}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.extras?.toFixed(2) || '0.00'}</td>
                                      <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.fines?.toFixed(2) || '0.00'}</td>
                                      <td className="px-4 py-3 text-right text-slate-800 font-extrabold">₹{bill.totalBill?.toFixed(2) || '0.00'}</td>
                                      <td className="px-4 py-3 text-center">
                                        {bill.isPaid ? (
                                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Paid</span>
                                        ) : (
                                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Unpaid</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section: Extra Orders */}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity size={16} className="text-[#003B6F]" />
                        Recent Extra Items History
                      </h4>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500">Date & Time</th>
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500">Meal</th>
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500">Items Ordered</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500">Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {selectedStudentDetails.extraOrders.length === 0 ? (
                                <tr>
                                  <td colSpan="4" className="px-4 py-6 text-center text-slate-400 font-medium">No extra items ordered recently</td>
                                </tr>
                              ) : (
                                selectedStudentDetails.extraOrders.map((order, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-700">{new Date(order.date || order.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{order.mealType}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium truncate max-w-xs">
                                      {order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-800 font-bold">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : assigningMunshi ? (
            /* Inline Assign Students View */
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Navigation Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <button
                  onClick={() => {
                    setAssigningMunshi(null);
                    setSourceHostelFilter('');
                    setSourceStudentsList([]);
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-[#003B6F] hover:text-indigo-700 transition cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                  Reassign Student Profiles
                </span>
              </div>

              {/* Main Assignment Panel */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1 tracking-tight flex items-center gap-2">
                    <UserCheck size={22} className="text-[#003B6F]" />
                    Assign Students to {assigningMunshi.hostel} Mess
                  </h3>
                  <p className="text-slate-505 text-xs font-semibold">
                    Select a source hostel below to browse and reassign students to **{assigningMunshi.name}**'s mess control.
                  </p>
                </div>

                {/* Filter Selector */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col md:flex-row gap-4 items-center">
                  <div className="w-full md:w-80">
                    <label className="block mb-2 text-xs font-black text-slate-600 uppercase tracking-wider">Source Hostel (From)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                      <select
                        value={sourceHostelFilter}
                        onChange={(e) => handleSourceHostelChange(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:border-indigo-400 cursor-pointer bg-white font-semibold text-slate-700"
                      >
                        <option value="">Select source hostel...</option>
                        {HOSTELS_LIST.filter(h => h.toUpperCase() !== assigningMunshi.hostel.toUpperCase()).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 text-xs text-slate-500 font-semibold md:pt-6">
                    Showing students currently registered in other hostels. Reassigning them will move them to **{assigningMunshi.hostel}** mess.
                  </div>
                </div>

                {/* Batch Action Bar */}
                {selectedSourceStudentIds.length > 0 && (
                  <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
                      <span className="text-sm text-indigo-900 font-bold">
                        {selectedSourceStudentIds.length} {selectedSourceStudentIds.length === 1 ? 'student' : 'students'} selected for reassignment
                      </span>
                    </div>
                    <button
                      onClick={() => handleBatchAssignStudents(assigningMunshi.hostel)}
                      disabled={batchAssigning}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-extrabold transition shadow-lg shadow-indigo-600/15 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {batchAssigning ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Assigning Students...
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Confirm & Assign to {assigningMunshi.hostel}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Students List Grid */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  {!sourceHostelFilter ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50">
                      <div className="w-16 h-16 bg-[#003B6F]/5 rounded-2xl flex items-center justify-center text-[#003B6F] mb-4 border border-[#003B6F]/10">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-base mb-1">Select Source Hostel</h3>
                      <p className="text-slate-500 text-xs max-w-xs font-semibold leading-normal">
                        Please select a hostel from the filter dropdown above to view students available for transfer.
                      </p>
                    </div>
                  ) : loadingSourceStudents ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white">
                      <div className="w-10 h-10 border-4 border-[#003B6F] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-550 text-sm font-semibold animate-pulse">Loading source student records...</p>
                    </div>
                  ) : sourceStudentsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-50/50">
                      <XCircle className="w-12 h-12 text-slate-350 mb-2" />
                      <span className="text-sm text-slate-650 font-bold">No students registered in {sourceHostelFilter}</span>
                      <span className="text-xs text-slate-450 mt-1">There are no active or inactive student records found in this hostel.</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left w-12">
                              <input
                                type="checkbox"
                                checked={sourceStudentsList.length > 0 && selectedSourceStudentIds.length === sourceStudentsList.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSourceStudentIds(sourceStudentsList.map(s => s._id));
                                  } else {
                                    setSelectedSourceStudentIds([]);
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-6 py-4 text-left font-bold text-slate-600">Student</th>
                            <th className="px-6 py-4 text-left font-bold text-slate-600">Roll No</th>
                            <th className="px-6 py-4 text-left font-bold text-slate-600">Room No</th>
                            <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {sourceStudentsList.map((st) => (
                            <tr key={st._id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedSourceStudentIds.includes(st._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSourceStudentIds(prev => [...prev, st._id]);
                                    } else {
                                      setSelectedSourceStudentIds(prev => prev.filter(id => id !== st._id));
                                    }
                                  }}
                                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={st.photo || 'https://placehold.co/100x100/3B82F6/FFF?text=ST'}
                                    alt={st.name}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-inner"
                                  />
                                  <div>
                                    <div className="font-semibold text-slate-800">{st.name}</div>
                                    <div className="text-xs text-slate-500">{st.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-700 font-medium">{st.rollNo}</td>
                              <td className="px-6 py-4 text-slate-700 font-medium">{st.roomNo}</td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleAssignStudent(st._id, assigningMunshi.hostel)}
                                  disabled={assigningStudentId === st._id}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                  {assigningStudentId === st._id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <>
                                      <UserCheck size={14} />
                                      Assign to {assigningMunshi.hostel}
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedHostel ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Back Nav */}
              <button
                onClick={() => setSelectedHostel(null)}
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
              >
                <ArrowLeft size={16} />
                Back to Hostels
              </button>

              {/* Loading Details State */}
              {hostelDetails.loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Error Details State */}
              {hostelDetails.error && (
                <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl flex items-center gap-2">
                  <ShieldAlert className="shrink-0" />
                  <span>Error: {hostelDetails.error}</span>
                </div>
              )}

              {/* Details Content */}
              {hostelDetails.data && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Total Students</span>
                        <span className="text-2xl font-black text-slate-800">{hostelDetails.data.studentCount}</span>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Verified Students</span>
                        <span className="text-2xl font-black text-slate-800">{hostelDetails.data.verifiedStudentCount}</span>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Pending Verification</span>
                        <span className="text-2xl font-black text-slate-800">{hostelDetails.data.pendingStudentCount}</span>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <IndianRupee className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Current Month Bills</span>
                        <span className="text-2xl font-black text-slate-800">₹{hostelDetails.data.currentMonthBills}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs Selection */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-2 w-fit">
                      <button
                        onClick={() => setHostelSubTab('students')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hostelSubTab === 'students' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        Students List ({hostelDetails.data.students.length})
                      </button>
                      <button
                        onClick={() => setHostelSubTab('munshis')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hostelSubTab === 'munshis' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        Munshis ({hostelDetails.data.munshis.length})
                      </button>
                      <button
                        onClick={() => setHostelSubTab('clerks')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hostelSubTab === 'clerks' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        Clerks ({hostelDetails.data.clerks.length})
                      </button>
                      <button
                        onClick={() => setHostelSubTab('menu')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hostelSubTab === 'menu' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        Weekly Menu
                      </button>
                      <button
                        onClick={() => setHostelSubTab('bills')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hostelSubTab === 'bills' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        Bill Reports ({hostelDetails.data.billHistory.length})
                      </button>
                    </div>

                    {hostelSubTab === 'menu' && (
                      <button
                        onClick={saveHostelMenu}
                        disabled={loadingMenu || savingMenu}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50"
                      >
                        <Check size={16} />
                        {savingMenu ? "Saving..." : "Save Menu"}
                      </button>
                    )}

                    {hostelSubTab === 'munshis' && (
                      <button
                        onClick={() => {
                          setStaffForm({ name: '', email: '', password: '', hostel: selectedHostel, type: 'munshi' });
                          setIsAddStaffModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <Plus size={16} />
                        Add Munshi to {selectedHostel}
                      </button>
                    )}

                    {hostelSubTab === 'clerks' && (
                      <button
                        onClick={() => {
                          setStaffForm({ name: '', email: '', password: '', hostel: selectedHostel, type: 'clerk' });
                          setIsAddStaffModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <Plus size={16} />
                        Add Clerk to {selectedHostel}
                      </button>
                    )}
                  </div>

                  {/* Sub-tab Table Content */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    
                    {/* STUDENTS SUB-TAB */}
                    {hostelSubTab === 'students' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Student Info</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Roll No</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Room No</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Verification</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {hostelDetails.data.students.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">No students registered in this hostel</td>
                              </tr>
                            ) : (
                              hostelDetails.data.students.map((student) => (
                                <tr key={student._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{student.name}</div>
                                    <div className="text-xs text-slate-500">{student.email}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{student.rollNo}</td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{student.roomNo}</td>
                                  <td className="px-6 py-4">
                                    {student.isVerified ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-55 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                        <CheckCircle2 size={12} /> Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100">
                                        <Clock size={12} /> Pending Approval
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {student.isActive ? (
                                      <span className="inline-flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="inline-flex items-center bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => handleViewStudentDetails(student._id)}
                                        title="View Student Details & Bills"
                                        className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition cursor-pointer"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleVerifyStudent(student._id, student.isVerified)}
                                        title={student.isVerified ? "Unverify Student" : "Verify Student"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${student.isVerified ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                                      >
                                        <UserCheck size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStudentActive(student._id, student.isActive)}
                                        title={student.isActive ? "Deactivate Student" : "Activate Student"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${student.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-105' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-105'}`}
                                      >
                                        {student.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        title="Delete Student Profile"
                                        className="p-1.5 bg-red-50 text-red-650 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* MUNSHIS SUB-TAB */}
                    {hostelSubTab === 'munshis' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Staff Info</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Email</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Role</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Account Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {hostelDetails.data.munshis.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">No Munshis assigned to this hostel</td>
                              </tr>
                            ) : (
                              hostelDetails.data.munshis.map((m) => (
                                <tr key={m._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{m.name}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{m.email}</td>
                                  <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Munshi</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {m.isActive ? (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setAssigningMunshi({ name: m.name, hostel: m.hostel || selectedHostel });
                                          setAssignSearchQuery('');
                                          setAssignSearchResults([]);
                                          setIsAssignModalOpen(true);
                                        }}
                                        title="Assign Students to this Munshi"
                                        className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition cursor-pointer"
                                      >
                                        Assign
                                      </button>
                                      <button
                                        onClick={() => openEditStaffModal({ ...m, role: 'munshi' })}
                                        title="Edit Munshi"
                                        className="p-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStaffActive(m._id, m.isActive)}
                                        title={m.isActive ? "Deactivate Munshi" : "Activate Munshi"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${m.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                                      >
                                        {m.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStaff(m._id)}
                                        title="Delete Munshi"
                                        className="p-1.5 bg-red-50 text-red-655 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* CLERKS SUB-TAB */}
                    {hostelSubTab === 'clerks' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Staff Info</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Email</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Role</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Account Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {hostelDetails.data.clerks.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">No Clerks assigned to this hostel</td>
                              </tr>
                            ) : (
                              hostelDetails.data.clerks.map((c) => (
                                <tr key={c._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{c.name}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{c.email}</td>
                                  <td className="px-6 py-4">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Clerk</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {c.isActive ? (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => openEditStaffModal({ ...c, role: 'clerk' })}
                                        title="Edit Clerk"
                                        className="p-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStaffActive(c._id, c.isActive)}
                                        title={c.isActive ? "Deactivate Clerk" : "Activate Clerk"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${c.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                                      >
                                        {c.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStaff(c._id)}
                                        title="Delete Clerk"
                                        className="p-1.5 bg-red-50 text-red-655 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* WEEKLY MENU SUB-TAB */}
                    {hostelSubTab === 'menu' && (
                      <div className="p-6">
                        {loadingMenu ? (
                          <div className="text-center py-20 bg-white">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-slate-500 font-semibold animate-pulse">Loading weekly menu...</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full min-w-[1000px] border-collapse">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="p-4 text-left font-bold text-slate-600 border-b border-r border-slate-200 w-32 sticky left-0 bg-slate-50 z-10">Days</th>
                                  {mealTypes.map(type => (
                                    <th key={type} className="p-4 text-center font-bold text-slate-600 border-b border-slate-200 capitalize">
                                      {type}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {days.map(day => (
                                  <tr key={day} className="bg-white hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700 border-r border-slate-200 sticky left-0 bg-white z-10">
                                      {day}
                                    </td>
                                    {mealTypes.map(mealType => {
                                      const item = adminWeeklyMenu[day] && adminWeeklyMenu[day][mealType] ? adminWeeklyMenu[day][mealType][0] : { name: "", price: 0, image: "" };
                                      return (
                                        <td key={`${day}-${mealType}`} className="p-3 border-l border-slate-100 min-w-[200px] align-top">
                                          <div className="space-y-2">
                                            <textarea 
                                              className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-350" 
                                              rows="3"
                                              placeholder={`Enter ${mealType} menu...`}
                                              value={item.name || ""}
                                              onChange={(e) => handleAdminMenuChange(day, mealType, 'name', e.target.value)}
                                            ></textarea>
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 relative">
                                                <input 
                                                  type="text" 
                                                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-400 outline-none font-medium"
                                                  placeholder="Price"
                                                  value={item.price || 0}
                                                  onChange={(e) => handleAdminMenuChange(day, mealType, 'price', e.target.value)}
                                                />
                                                <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                                              </div>
                                              <label className="cursor-pointer p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors relative group">
                                                <input 
                                                  type="file" 
                                                  className="hidden" 
                                                  accept="image/*"
                                                  onChange={(e) => handleAdminImageUpload(day, mealType, e.target.files[0])}
                                                />
                                                <ImageIcon size={18} />
                                                {(item.image || item.preview) ? (
                                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                                                ) : null}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                  Upload Image
                                                </div>
                                              </label>
                                            </div>
                                            
                                            {/* Image Preview */}
                                            {(item.preview || item.image) && (
                                              <div className="mt-1 relative h-16 w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group">
                                                <img 
                                                  src={item.preview || (item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`)} 
                                                  alt="Menu preview" 
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => e.target.style.display = 'none'}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* BILLS SUB-TAB */}
                    {hostelSubTab === 'bills' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Period</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Type</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Meal Rate</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Total Amount</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Student Count</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Generated At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {hostelDetails.data.billHistory.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">No bill record files generated yet</td>
                              </tr>
                            ) : (
                              hostelDetails.data.billHistory.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4 text-slate-800 font-semibold">
                                    {record.month || `${new Date(record.fromDate).toLocaleDateString()} - ${new Date(record.toDate).toLocaleDateString()}`}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${record.month ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                      {record.month ? 'Monthly' : 'Custom'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-slate-700 font-bold">₹{record.mealRate}</td>
                                  <td className="px-6 py-4 text-slate-700 font-bold">₹{record.totalAmount?.toLocaleString() || '0'}</td>
                                  <td className="px-6 py-4 text-slate-700 font-bold">{record.studentCount}</td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{new Date(record.generatedAt || record.createdAt).toLocaleString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* --- TAB: DASHBOARD --- */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* General Loading & Error */}
                  {stats.loading && (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {stats.error && (
                    <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl">
                      Error loading statistics: {stats.error}
                    </div>
                  )}

                  {/* General Stats Cards */}
                  {stats.data && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Users className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Total Students</span>
                          <span className="text-3xl font-black text-slate-800">{stats.data.totalStudents}</span>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Total Hostels</span>
                          <span className="text-3xl font-black text-slate-800">{stats.data.totalHostels}</span>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Total Munshis</span>
                          <span className="text-3xl font-black text-slate-800">{stats.data.totalMunshis}</span>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Total Clerks</span>
                          <span className="text-3xl font-black text-slate-800">{stats.data.totalClerks}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hostels Section */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Building2 size={18} className="text-indigo-600" />
                      Select Hostel to View Data
                    </h3>
                    
                    {hostels.loading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {hostels.data.map((hostel) => (
                          <button
                            key={hostel.hostelNo}
                            onClick={() => handleHostelClick(hostel.hostelNo)}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left hover:shadow-md hover:border-indigo-200 transition duration-300 group flex flex-col justify-between h-44 cursor-pointer outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                  {hostel.hostelNo}
                                </span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
                                  Hostel
                                </span>
                              </div>
                              <div className="text-2xl font-black text-slate-850 mt-3">
                                {hostel.studentCount} <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Students</span>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <div>
                                {hostel.pendingStudentCount > 0 ? (
                                  <span className="text-amber-600 font-bold block">{hostel.pendingStudentCount} pending</span>
                                ) : (
                                  <span className="text-emerald-600 font-bold block">All verified</span>
                                )}
                              </div>
                              <div className="text-right text-[10px] text-indigo-500 font-bold uppercase tracking-wider group-hover:translate-x-1 transition text-indigo-600 font-semibold">
                                View Details &rarr;
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: ALL STUDENTS --- */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Filters bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by student name or roll..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                      />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                          value={studentHostelFilter}
                          onChange={handleHostelFilterChange}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:border-indigo-400 cursor-pointer bg-white"
                        >
                          <option value="">Select Hostel...</option>
                          {HOSTELS_LIST.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {!studentHostelFilter ? (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#003B6F] mb-4 shadow-sm border border-indigo-100/50">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-lg mb-1">Select a Hostel to Load Records</h3>
                        <p className="text-slate-500 text-xs max-w-xs font-semibold leading-normal">
                          For best performance, please select a specific hostel from the filter dropdown above to view its student list.
                        </p>
                      </div>
                    ) : students.loading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Student</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Roll No</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Hostel</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Room No</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Verified</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredStudents.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-medium">No students match filter criteria</td>
                              </tr>
                            ) : (
                              filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={student.photo || 'https://placehold.co/100x100/3B82F6/FFF?text=ST'}
                                        alt={student.name}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-inner"
                                      />
                                      <div>
                                        <div className="font-semibold text-slate-800">{student.name}</div>
                                        <div className="text-xs text-slate-500">{student.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{student.rollNo}</td>
                                  <td className="px-6 py-4 text-slate-700 font-bold">{student.hostelNo}</td>
                                  <td className="px-6 py-4 text-slate-700 font-medium">{student.roomNo}</td>
                                  <td className="px-6 py-4">
                                    {student.isVerified ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                        <CheckCircle2 size={12} /> Yes
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100">
                                        <Clock size={12} /> Pending
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {student.isActive ? (
                                      <span className="inline-flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="inline-flex items-center bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => handleViewStudentDetails(student._id)}
                                        title="View Student Details & Bills"
                                        className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition cursor-pointer"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleVerifyStudent(student._id, student.isVerified)}
                                        title={student.isVerified ? "Unverify Student" : "Verify Student"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${student.isVerified ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                                      >
                                        <UserCheck size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStudentActive(student._id, student.isActive)}
                                        title={student.isActive ? "Deactivate Student" : "Activate Student"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${student.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                                      >
                                        {student.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        title="Delete Student Profile"
                                        className="p-1.5 bg-red-50 text-red-655 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: ALL MUNSHIS --- */}
              {activeTab === 'munshis' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Filters & Actions bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Search by Munshi name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                      <select
                        value={staffHostelFilter}
                        onChange={(e) => setStaffHostelFilter(e.target.value)}
                        className="pl-4 pr-8 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white"
                      >
                        <option value="">All Hostels</option>
                        {HOSTELS_LIST.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setStaffForm({ name: '', email: '', password: '', hostel: HOSTELS_LIST[0], type: 'munshi' });
                          setIsAddStaffModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <Plus size={16} />
                        Add Munshi
                      </button>
                    </div>
                  </div>

                  {/* Munshis Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {staff.loading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Name</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Email</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Hostel</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Role</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Date Registered</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredMunshis.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-medium">No Munshis found</td>
                              </tr>
                            ) : (
                              filteredMunshis.map((person) => (
                                <tr key={person._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4 font-semibold text-slate-855">{person.name}</td>
                                  <td className="px-6 py-4 text-slate-600 font-medium">{person.email}</td>
                                  <td className="px-6 py-4 text-slate-800 font-bold">{person.hostel}</td>
                                  <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Munshi</span>
                                  </td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{new Date(person.createdAt).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                    {person.isActive ? (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setAssigningMunshi({ name: person.name, hostel: person.hostel });
                                          setAssignSearchQuery('');
                                          setAssignSearchResults([]);
                                          setIsAssignModalOpen(true);
                                        }}
                                        title="Assign Students to this Munshi"
                                        className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition cursor-pointer"
                                      >
                                        Assign
                                      </button>
                                      <button
                                        onClick={() => openEditStaffModal(person)}
                                        title="Edit Munshi"
                                        className="p-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStaffActive(person._id, person.isActive)}
                                        title={person.isActive ? "Deactivate Munshi" : "Activate Munshi"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${person.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                                      >
                                        {person.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStaff(person._id)}
                                        title="Delete Munshi"
                                        className="p-1.5 bg-red-50 text-red-655 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB: ALL CLERKS --- */}
              {activeTab === 'clerks' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Filters & Actions bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Search by Clerk name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                      <select
                        value={staffHostelFilter}
                        onChange={(e) => setStaffHostelFilter(e.target.value)}
                        className="pl-4 pr-8 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white"
                      >
                        <option value="">All Hostels</option>
                        {HOSTELS_LIST.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setStaffForm({ name: '', email: '', password: '', hostel: HOSTELS_LIST[0], type: 'clerk' });
                          setIsAddStaffModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <Plus size={16} />
                        Add Clerk
                      </button>
                    </div>
                  </div>

                  {/* Clerks Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {staff.loading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Name</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Email</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Hostel</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Role</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Date Registered</th>
                              <th className="px-6 py-4 text-left font-bold text-slate-600">Status</th>
                              <th className="px-6 py-4 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredClerks.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400 font-medium">No Clerks found</td>
                              </tr>
                            ) : (
                              filteredClerks.map((person) => (
                                <tr key={person._id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-6 py-4 font-semibold text-slate-850">{person.name}</td>
                                  <td className="px-6 py-4 text-slate-600 font-medium">{person.email}</td>
                                  <td className="px-6 py-4 text-slate-800 font-bold">{person.hostel}</td>
                                  <td className="px-6 py-4 font-bold">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Clerk</span>
                                  </td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{new Date(person.createdAt).toLocaleDateString()}</td>
                                  <td className="px-6 py-4">
                                    {person.isActive ? (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <button
                                        onClick={() => openEditStaffModal(person)}
                                        title="Edit Clerk"
                                        className="p-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStaffActive(person._id, person.isActive)}
                                        title={person.isActive ? "Deactivate Clerk" : "Activate Clerk"}
                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${person.isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                                      >
                                        {person.isActive ? <Ban size={14} /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStaff(person._id)}
                                        title="Delete Clerk"
                                        className="p-1.5 bg-red-50 text-red-655 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'billreport' && <AdminBillReportPage />}
            </>
          )}

        </main>
      </div>

      {/* ==================== CREATE STAFF MODAL ==================== */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-150 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddStaffModalOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Add New {staffForm.type === 'munshi' ? 'Munshi' : 'Clerk'} Account
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter Name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter Email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Hostel Assignment</label>
                  <select
                    value={staffForm.hostel}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, hostel: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white"
                  >
                    <option value="" disabled>Select Hostel</option>
                    {HOSTELS_LIST.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Role Type</label>
                  <select
                    value={staffForm.type}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none cursor-not-allowed text-slate-500"
                  >
                    {staffForm.type === 'munshi' ? (
                      <option value="munshi">Munshi</option>
                    ) : (
                      <option value="clerk">Clerk</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT STAFF MODAL ==================== */}
      {isEditStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-150 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setIsEditStaffModalOpen(false); setEditingStaff(null); }}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Edit2 size={20} className="text-indigo-600" />
              Edit {editStaffForm.type === 'munshi' ? 'Munshi' : 'Clerk'} Details
            </h3>

            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editStaffForm.name}
                  onChange={(e) => setEditStaffForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter Name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={editStaffForm.email}
                  onChange={(e) => setEditStaffForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter Email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Password (Optional)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    minLength="6"
                    value={editStaffForm.password}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Hostel Assignment</label>
                  <select
                    value={editStaffForm.hostel}
                    onChange={(e) => setEditStaffForm(prev => ({ ...prev, hostel: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white"
                  >
                    {HOSTELS_LIST.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Role Type</label>
                  <select
                    value={editStaffForm.type}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none cursor-not-allowed text-slate-500"
                  >
                    {editStaffForm.type === 'munshi' ? (
                      <option value="munshi">Munshi</option>
                    ) : (
                      <option value="clerk">Clerk</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditStaffModalOpen(false); setEditingStaff(null); }}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW STUDENT DETAILS MODAL ==================== */}
      {isStudentDetailsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-150 shadow-2xl p-6 md:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => { setIsStudentDetailsModalOpen(false); setSelectedStudentDetails(null); }}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
              <Users size={22} className="text-[#003B6F]" />
              Student Profile & Billing Records
            </h3>

            {loadingStudentDetails ? (
              <div className="flex flex-col justify-center items-center py-24 flex-1">
                <div className="w-10 h-10 border-4 border-[#003B6F] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm font-semibold animate-pulse">Retrieving student records...</p>
              </div>
            ) : selectedStudentDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {/* Left: Student Card Details */}
                <div className="md:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-150 h-fit space-y-5">
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={selectedStudentDetails.student.photo || 'https://placehold.co/120x120/3B82F6/FFF?text=ST'}
                      alt={selectedStudentDetails.student.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md mb-3"
                    />
                    <h4 className="font-extrabold text-slate-800 text-base">{selectedStudentDetails.student.name}</h4>
                    <p className="text-slate-500 text-xs font-semibold">{selectedStudentDetails.student.rollNo}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {selectedStudentDetails.student.isVerified ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Verified</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Pending</span>
                      )}
                      {selectedStudentDetails.student.isActive ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Active</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Inactive</span>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hostel / Room</span>
                      <span className="text-slate-800 font-bold">{selectedStudentDetails.student.hostelNo} · Room {selectedStudentDetails.student.roomNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch</span>
                      <span className="text-slate-800 text-right">{getBranchFromRollNo(selectedStudentDetails.student.rollNo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Academic Year</span>
                      <span className="text-slate-800">{getYearFromRollNo(selectedStudentDetails.student.rollNo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Address</span>
                      <span className="text-slate-800 lowercase select-all">{selectedStudentDetails.student.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Number</span>
                      <span className="text-slate-800 select-all">{selectedStudentDetails.student.phoneNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joining Date</span>
                      <span className="text-slate-800">{new Date(selectedStudentDetails.student.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Bills & Extras Tables */}
                <div className="md:col-span-2 space-y-6">
                  {/* Section: Bill History */}
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <IndianRupee size={16} className="text-[#003B6F]" />
                      Monthly Bills History
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-bold text-slate-500">Period</th>
                              <th className="px-4 py-2.5 text-center font-bold text-slate-500">Diets</th>
                              <th className="px-4 py-2.5 text-right font-bold text-slate-500">Meal (₹)</th>
                              <th className="px-4 py-2.5 text-right font-bold text-slate-500">Extras (₹)</th>
                              <th className="px-4 py-2.5 text-right font-bold text-slate-500">Fines (₹)</th>
                              <th className="px-4 py-2.5 text-right font-bold text-slate-500">Total (₹)</th>
                              <th className="px-4 py-2.5 text-center font-bold text-slate-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {selectedStudentDetails.bills.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="px-4 py-6 text-center text-slate-400 font-medium">No billing history found</td>
                              </tr>
                            ) : (
                              selectedStudentDetails.bills.map((bill, idx) => {
                                const monthsList = [
                                  "January", "February", "March", "April", "May", "June",
                                  "July", "August", "September", "October", "November", "December"
                                ];
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-bold text-slate-700">{monthsList[bill.month - 1]} {bill.year}</td>
                                    <td className="px-4 py-3 text-center text-slate-600 font-semibold">{bill.mealCount || 0}</td>
                                    <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.mealCharges?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.extras?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3 text-right text-slate-600 font-medium">₹{bill.fines?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3 text-right text-slate-800 font-extrabold">₹{bill.totalBill?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3 text-center">
                                      {bill.isPaid ? (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Paid</span>
                                      ) : (
                                        <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Unpaid</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Section: Extra Orders */}
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-[#003B6F]" />
                      Recent Extra Items History
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-bold text-slate-500">Date & Time</th>
                              <th className="px-4 py-2.5 text-left font-bold text-slate-500">Meal</th>
                              <th className="px-4 py-2.5 text-left font-bold text-slate-500">Items Ordered</th>
                              <th className="px-4 py-2.5 text-right font-bold text-slate-500">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {selectedStudentDetails.extraOrders.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-slate-400 font-medium">No extra items ordered recently</td>
                              </tr>
                            ) : (
                              selectedStudentDetails.extraOrders.map((order, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-700">{new Date(order.date || order.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                      <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{order.mealType}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium truncate max-w-xs">
                                      {order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-800 font-bold">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center py-24 flex-1">
                <p className="text-slate-400 text-sm font-semibold">Unable to load student data.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}