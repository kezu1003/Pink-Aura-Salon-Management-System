import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import CourseCard from "../components/CourseCard";
import CoursesNotFound from "../components/CoursesNotFound";
import api from "../lib/axios";
import toast from "react-hot-toast";

// Icons
import {
  SearchIcon,
  XIcon,
  LoaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Settings,
  Users,
  Calendar,
  PlusCircle,
} from "lucide-react";

function CourseHomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
        setFilteredCourses(res.data);
      } catch (error) {
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Search filter
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter((course) =>
          course.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, courses]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Course Dashboard
        </h1>
        <Link
          to="/courses/create"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Course
        </Link>
      </div>

      {/* Search bar */}
      <div className="p-4 flex items-center gap-2 bg-white shadow-sm">
        <div className="relative w-full">
          <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <LoaderIcon className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <CoursesNotFound />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Footer with pagination placeholder */}
      <div className="flex justify-between items-center p-4 border-t bg-white">
        <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50">
          <ChevronLeftIcon className="w-5 h-5" />
          Previous
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50">
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default CourseHomePage;
