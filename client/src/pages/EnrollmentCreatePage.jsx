import { useState, useEffect, useContext } from 'react';
import { ArrowLeft, BookOpen, User, Mail, Hash, Sparkles, Save, X, UserCheck, Search, Users, BookMarked } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate, useLocation } from "react-router";
import api from "../lib/axios";
import { AppContext } from "../context/AppContext"; 

const EnrollmentCreatePage = () => {
  const [courseID, setCourseID] = useState("");
  const [userID, setUserID] = useState("");
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContext);

  // Get pre-filled data from navigation state (if coming from course page)
  const prefilledData = location.state || {};

  // Auto-fill user data from context
  useEffect(() => {
    if (userData) {
      if (userData.name) setName(userData.name);
      if (userData.email) setEmail(userData.email);
      if (userData._id) setUserID(userData._id);
    }
  }, [userData]);

  // Auto-fill from navigation state
  useEffect(() => {
    if (prefilledData.courseId) setCourseID(prefilledData.courseId);
    if (prefilledData.courseName) setCourseName(prefilledData.courseName);
    if (prefilledData.userId) setUserID(prefilledData.userId);
    if (prefilledData.userName) setName(prefilledData.userName);
    if (prefilledData.userEmail) setEmail(prefilledData.userEmail);
  }, [prefilledData]);

  // Fetch courses for auto-completion
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch users for auto-completion (admin only)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Only fetch users if admin role
    if (userData?.role === 'admin') {
      fetchUsers();
    }
  }, [userData]);

  // Auto-fill course name when course ID is selected
  useEffect(() => {
    if (courseID) {
      const selectedCourse = courses.find(course => course._id === courseID);
      if (selectedCourse) {
        setCourseName(selectedCourse.courseName);
      }
    }
  }, [courseID, courses]);

  // Auto-fill user details when user ID is selected
  useEffect(() => {
    if (userID && users.length > 0) {
      const selectedUser = users.find(user => user._id === userID);
      if (selectedUser) {
        setName(selectedUser.name || selectedUser.username);
        setEmail(selectedUser.email);
      }
    }
  }, [userID, users]);

  const handleCourseSelect = (course) => {
    setCourseID(course._id);
    setCourseName(course.courseName);
    setShowCourseDropdown(false);
  };

  const handleUserSelect = (user) => {
    setUserID(user._id);
    setName(user.name || user.username);
    setEmail(user.email);
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseID.trim() || !userID.trim() || !name.trim() || !courseName.trim() || !email.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    // Test toast to ensure toast system is working
    toast.success("Testing toast system...");
    
    try {
      const response = await api.post("/enrollments", {
        courseID,
        userID,
        name,
        courseName,
        email
      });
      
      console.log("Enrollment response:", response);
      console.log("Response data:", response.data);
      console.log("Response success:", response.data.success);
      
      // Check if response indicates success (multiple ways to check)
      if (response.data.success || response.status === 201 || response.status === 200) {
        console.log("Showing success toast");
        toast.success("Enrolled Successfully!");
        // Add a small delay to ensure toast is visible before navigation
        setTimeout(() => {
          navigate("/courses/user");
        }, 1000);
      } else {
        console.log("Showing error toast");
        toast.error(response.data.message || "Failed to create enrollment");
      }

    } catch (error) {
      console.log("Error creating enrollment", error);
      
      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 409 || error.code === 11000) {
        toast.error("You are already enrolled in this course!");
      } else if (error.response?.status === 429) {
        toast.error("Slow down! You're creating enrollments too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else {
        toast.error("Failed to create enrollment");
      }
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      id: 'courseID',
      label: 'Course ID',
      placeholder: 'Select or enter course ID',
      icon: <BookMarked className="w-5 h-5" />,
      value: courseID,
      onChange: setCourseID,
      type: 'input',
      hasDropdown: true,
      dropdownItems: courses,
      onItemSelect: handleCourseSelect,
      showDropdown: showCourseDropdown,
      setShowDropdown: setShowCourseDropdown,
      displayKey: 'courseName',
      valueKey: '_id'
    },
    {
      id: 'userID',
      label: 'User ID',
      placeholder: 'Select or enter user ID',
      icon: <Users className="w-5 h-5" />,
      value: userID,
      onChange: setUserID,
      type: 'input',
      hasDropdown: userData?.role === 'admin', // Only show user dropdown for admins
      dropdownItems: users,
      onItemSelect: handleUserSelect,
      showDropdown: showUserDropdown,
      setShowDropdown: setShowUserDropdown,
      displayKey: 'name',
      valueKey: '_id'
    },
    {
      id: 'name',
      label: 'User Name',
      placeholder: 'Student\'s full name',
      icon: <User className="w-5 h-5" />,
      value: name,
      onChange: setName,
      type: 'input',
      autoFilled: true
    },
    {
      id: 'courseName',
      label: 'Course Name',
      placeholder: 'Course name will auto-fill',
      icon: <BookOpen className="w-5 h-5" />,
      value: courseName,
      onChange: setCourseName,
      type: 'input',
      autoFilled: true
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Student\'s email address',
      icon: <Mail className="w-5 h-5" />,
      value: email,
      onChange: setEmail,
      type: 'email',
      autoFilled: true
    }
  ];

  const completedFields = formFields.filter(field => field.value.trim()).length;
  const progressPercentage = (completedFields / formFields.length) * 100;

  // Render dropdown for a field
  const renderDropdown = (field) => {
    if (!field.showDropdown || !field.dropdownItems?.length) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#FBAA99] rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
        {field.dropdownItems.map((item) => (
          <button
            key={item[field.valueKey]}
            type="button"
            onClick={() => field.onItemSelect(item)}
            className="w-full px-4 py-3 text-left hover:bg-[#FEF4F1] transition-colors duration-200 border-b border-[#FEF4F1] last:border-b-0"
          >
            <div className="font-medium text-[#4D423A]">
              {item[field.displayKey]}
            </div>
            <div className="text-sm text-[#4D423A]/60 font-mono">
              {item[field.valueKey]}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] via-white to-[#FEF4F1] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <Link 
              to="/courses/user" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to courses</span>
            </Link>

            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
                <Sparkles className="w-6 h-6 text-[#FBAA99]" />
                <span className="text-[#4D423A] font-bold">Create New Enrollment</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                  Enroll Student
                </span>
              </h1>
              <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
                Register a student for their learning journey
              </p>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-[#FEF4F1] overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#FBAA99] to-[#4D423A] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Enrollment Details</h2>
                <p className="text-white/90">Fill in the information below to enroll a student</p>
                
                {/* Auto-fill Status */}
                <div className="flex items-center space-x-2 mt-4 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-flex">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {userData ? `Logged in as: ${userData.name}` : 'Not logged in'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="form-group relative">
                      <label className="block text-[#4D423A] font-semibold mb-3 text-lg">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                            {field.icon}
                          </div>
                          <span>{field.label}</span>
                          {field.autoFilled && (
                            <span className="text-xs bg-[#FBAA99] text-white px-2 py-1 rounded-full">
                              Auto-filled
                            </span>
                          )}
                        </div>
                      </label>
                      
                      <div className="relative group">
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className={`w-full px-6 py-4 border-2 ${
                            field.autoFilled ? 'border-[#4D423A]/30 bg-[#FEF4F1]/50' : 'border-[#FEF4F1]'
                          } focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none`}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onFocus={() => field.hasDropdown && field.setShowDropdown(true)}
                          readOnly={field.autoFilled}
                        />
                        
                        {/* Dropdown toggle for searchable fields */}
                        {field.hasDropdown && (
                          <button
                            type="button"
                            onClick={() => field.setShowDropdown(!field.showDropdown)}
                            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-[#4D423A]/60 hover:text-[#FBAA99] transition-colors"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* Field validation indicator */}
                        {field.value.trim() && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dropdown for searchable fields */}
                      {field.hasDropdown && renderDropdown(field)}
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#4D423A]">Form Completion</span>
                    <span className="text-sm font-medium text-[#FBAA99]">
                      {completedFields}/{formFields.length} fields completed ({Math.round(progressPercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FEF4F1] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#FBAA99] to-[#4D423A] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-[#FEF4F1]">
                  <Link
                    to="/courses/user"
                    className="px-8 py-4 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Link>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || completedFields !== formFields.length}
                    className={`px-8 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-48 ${
                      loading || completedFields !== formFields.length ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Enrollment...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Create Enrollment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-8">
            <h3 className="text-2xl font-bold text-[#4D423A] mb-6 flex items-center">
              <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99] mr-3">
                <UserCheck className="w-6 h-6" />
              </div>
              Auto-fill Features
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Automatically Filled:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>User Name & Email:</strong> From your login</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>Course Name:</strong> When you select Course ID</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>User Details:</strong> When admin selects User ID</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Smart Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>Course Dropdown:</strong> Search and select from available courses</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>User Dropdown:</strong> Admin can select from registered users</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80"><strong>Progress Tracking:</strong> Real-time form completion status</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      <div 
        className={`fixed inset-0 z-40 ${showCourseDropdown || showUserDropdown ? 'block' : 'hidden'}`}
        onClick={() => {
          setShowCourseDropdown(false);
          setShowUserDropdown(false);
        }}
      />
    </div>
  );
};

export default EnrollmentCreatePage;