import { useState } from 'react';
import { ArrowLeft, BookOpen, User, Mail, Hash, Sparkles, Save, X, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";

const EnrollmentCreatePage = () => {
  const [courseID, setCourseID] = useState("");
  const [userID, setUserID] = useState("");
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    try {
      await api.post("/enrollments", {
        courseID,
        userID,
        name,
        courseName,
        email
      });
      toast.success("Enrollment created successfully!");
      navigate("/enrollments");

    } catch (error) {
      console.log("Error creating enrollment", error);
      if (error.response?.status === 429) {
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
      placeholder: 'Enter the course ID',
      icon: <Hash className="w-5 h-5" />,
      value: courseID,
      onChange: setCourseID,
      type: 'input'
    },
    {
      id: 'userID',
      label: 'User ID',
      placeholder: 'Enter the user ID',
      icon: <Hash className="w-5 h-5" />,
      value: userID,
      onChange: setUserID,
      type: 'input'
    },
    {
      id: 'name',
      label: 'User Name',
      placeholder: 'Enter the student\'s full name',
      icon: <User className="w-5 h-5" />,
      value: name,
      onChange: setName,
      type: 'input'
    },
    {
      id: 'courseName',
      label: 'Course Name',
      placeholder: 'Enter the course name',
      icon: <BookOpen className="w-5 h-5" />,
      value: courseName,
      onChange: setCourseName,
      type: 'input'
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Enter the student\'s email',
      icon: <Mail className="w-5 h-5" />,
      value: email,
      onChange: setEmail,
      type: 'email'
    }
  ];

  const completedFields = formFields.filter(field => field.value.trim()).length;
  const progressPercentage = (completedFields / formFields.length) * 100;

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
              to="/enrollments" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Enrollments</span>
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
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-8 w-16 h-16 border-2 border-white/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/20 rounded-full"></div>
            </div>

            {/* Form Body */}
            <div className="p-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="form-group">
                      <label className="block text-[#4D423A] font-semibold mb-3 text-lg">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                            {field.icon}
                          </div>
                          <span>{field.label}</span>
                        </div>
                      </label>
                      
                      <div className="relative group">
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/30 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        
                        {/* Field validation indicator */}
                        {field.value.trim() && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#4D423A]">Form Completion</span>
                    <span className="text-sm font-medium text-[#FBAA99]">
                      {completedFields}/{formFields.length} fields completed
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
                    to="/enrollments"
                    className="px-8 py-4 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Link>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-8 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-48 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
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
              Enrollment Guidelines
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Important Notes:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Ensure the course ID matches an existing course</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Verify the student's email address is correct</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Each email can only be enrolled once per course</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Before Enrolling:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Confirm course availability and schedule</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Verify student has met prerequisites</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Double-check all information for accuracy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentCreatePage;