import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, User, MapPin, Calendar, FileText, Sparkles, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";

const CourseCreatePage = () => {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationConflict, setLocationConflict] = useState(null);

  const navigate = useNavigate();

  // Check for location conflicts in real-time
  const checkLocationConflict = async (locationValue) => {
    if (!locationValue.trim()) {
      setLocationConflict(null);
      return;
    }

    try {
      const existingCoursesResponse = await api.get("/courses");
      const existingCourses = existingCoursesResponse.data;
      
      const conflictingCourse = existingCourses.find(course => 
        course.location && course.location.toLowerCase().trim() === locationValue.toLowerCase().trim()
      );
      
      if (conflictingCourse) {
        setLocationConflict(conflictingCourse);
      } else {
        setLocationConflict(null);
      }
    } catch (error) {
      console.log("Error checking location conflicts:", error);
      setLocationConflict(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseName.trim() || !description.trim() || !duration.trim() || !instructorName.trim() || !location.trim() || !schedule.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      // First, check if there are existing courses at the same location
      const existingCoursesResponse = await api.get("/courses");
      const existingCourses = existingCoursesResponse.data;
      
      // Check for courses at the same location
      const conflictingCourses = existingCourses.filter(course => 
        course.location && course.location.toLowerCase().trim() === location.toLowerCase().trim()
      );
      
      if (conflictingCourses.length > 0) {
        toast.error(`Cannot create course at "${location}". There is already a course at this location: "${conflictingCourses[0].courseName}"`);
        setLoading(false);
        return;
      }

      // If no conflicts, proceed with course creation
      await api.post("/courses", {
        courseName,
        description,
        duration,
        instructorName,
        location,
        schedule
      });
      toast.success("Course created successfully!");
      navigate("/courses");

    } catch (error) {
      console.log("Error creating course", error);
      if (error.response?.status === 429) {
        toast.error("Slow down! You're creating courses too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else if (error.response?.status === 409) {
        toast.error("A course already exists at this location");
      } else {
        toast.error("Failed to create course");
      }
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      id: 'courseName',
      label: 'Course Name',
      placeholder: 'Enter a compelling course name',
      icon: <BookOpen className="w-5 h-5" />,
      value: courseName,
      onChange: setCourseName,
      type: 'input'
    },
    {
      id: 'description',
      label: 'Course Description',
      placeholder: 'Describe what students will learn in this course',
      icon: <FileText className="w-5 h-5" />,
      value: description,
      onChange: setDescription,
      type: 'textarea'
    },
    {
      id: 'duration',
      label: 'Course Duration',
      placeholder: 'e.g., 8 weeks, 3 months, 40 hours',
      icon: <Clock className="w-5 h-5" />,
      value: duration,
      onChange: setDuration,
      type: 'input'
    },
    {
      id: 'instructorName',
      label: 'Instructor Name',
      placeholder: 'Enter the instructor\'s full name',
      icon: <User className="w-5 h-5" />,
      value: instructorName,
      onChange: setInstructorName,
      type: 'input'
    },
    {
      id: 'location',
      label: 'Course Location',
      placeholder: 'Enter classroom, studio, or online',
      icon: <MapPin className="w-5 h-5" />,
      value: location,
      onChange: (value) => {
        setLocation(value);
        checkLocationConflict(value);
      },
      type: 'input'
    },
    {
      id: 'schedule',
      label: 'Course Schedule',
      placeholder: 'e.g., Mon-Wed-Fri 9AM-12PM',
      icon: <Calendar className="w-5 h-5" />,
      value: schedule,
      onChange: setSchedule,
      type: 'input'
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
              to="/courses" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Courses</span>
            </Link>

            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
                <Sparkles className="w-6 h-6 text-[#FBAA99]" />
                <span className="text-[#4D423A] font-bold">Create New Course</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                  Design Your Course
                </span>
              </h1>
              <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
                Create an engaging learning experience that transforms students' beauty careers
              </p>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-[#FEF4F1] overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#FBAA99] to-[#4D423A] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Course Details</h2>
                <p className="text-white/90">Fill in the information below to create your new course</p>
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
                    <div key={field.id} className={`form-group ${field.type === 'textarea' ? 'lg:col-span-2' : ''}`}>
                      <label className="block text-[#4D423A] font-semibold mb-3 text-lg">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                            {field.icon}
                          </div>
                          <span>{field.label}</span>
                        </div>
                      </label>
                      
                      <div className="relative group">
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder}
                            className="w-full px-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/30 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 resize-none min-h-32 focus:outline-none"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            rows={4}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-full px-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/30 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
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
                      
                      {/* Location conflict warning */}
                      {field.id === 'location' && locationConflict && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                            <span className="text-red-700 text-sm font-medium">
                              Location conflict: "{locationConflict.courseName}" is already using this location
                            </span>
                          </div>
                        </div>
                      )}
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
                    to="/courses"
                    className="px-8 py-4 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Link>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || locationConflict}
                    className={`px-8 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-48 ${
                      loading || locationConflict ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Course...</span>
                      </>
                    ) : locationConflict ? (
                      <>
                        <X className="w-5 h-5" />
                        <span>Location Conflict</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Create Course</span>
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
                <Sparkles className="w-6 h-6" />
              </div>
              Course Creation Tips
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Best Practices:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Use clear, descriptive course names that highlight benefits</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Include specific skills students will master</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FBAA99] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Mention certification or career outcomes</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-[#4D423A] text-lg">Description Ideas:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">What techniques will be covered?</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">What tools and products will be used?</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#4D423A] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#4D423A]/80">Who is the target audience?</span>
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

export default CourseCreatePage;