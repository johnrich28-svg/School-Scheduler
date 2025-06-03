import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/admin.css";

const API_BASE_URL = "http://localhost:5000";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

const Admin = () => {
  // State for different sections
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("1st");
  const [selectedSection, setSelectedSection] = useState("");

  // Form states with validation
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "professor",
  });
  const [userErrors, setUserErrors] = useState({});

  const [newYear, setNewYear] = useState({ name: "" });
  const [yearErrors, setYearErrors] = useState({});

  const [newSection, setNewSection] = useState({
    name: "",
    courseId: "",
    yearId: "",
    capacity: 40,
  });
  const [sectionErrors, setSectionErrors] = useState({});

  const [newSubject, setNewSubject] = useState({
    subjectCode: "",
    subjectName: "",
    courseId: "",
    yearLevelId: "",
    semester: "1st",
    units: 3,
    day: "",
  });
  const [subjectErrors, setSubjectErrors] = useState({});

  const [newRoom, setNewRoom] = useState({ room: "" });
  const [roomErrors, setRoomErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Add state for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Add new state for manual scheduling
  const [newSchedule, setNewSchedule] = useState({
    sectionId: "",
    subjectId: "",
    day: "",
    startTime: "",
    endTime: "",
    semester: "1st",
    academicYear: new Date().getFullYear().toString()
  });
  const [scheduleErrors, setScheduleErrors] = useState({});

  // Add new state for editing schedule
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // Reset form states
  const resetFormStates = () => {
    setNewUser({ username: "", email: "", password: "", role: "professor" });
    setNewYear({ name: "" });
    setNewSection({ name: "", courseId: "", yearId: "", capacity: 40 });
    setNewSubject({
      subjectCode: "",
      subjectName: "",
      courseId: "",
      yearLevelId: "",
      semester: "1st",
      units: 3,
      day: "",
    });
    setIsEditing(false);
    setEditId(null);
    setNewSchedule({
      sectionId: "",
      subjectId: "",
      day: "",
      startTime: "",
      endTime: "",
      semester: "1st",
      academicYear: new Date().getFullYear().toString()
    });
  };

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch courses for dropdowns
        const coursesRes = await axios.get(
          `${API_BASE_URL}/api/public/courses/get-courses`,
          { headers }
        );
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

        switch (activeTab) {
          case "users":
            const usersRes = await axios.get(
              `${API_BASE_URL}/api/auth/admin/get-users`,
              { headers }
            );
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            break;
          case "years":
            const yearsRes = await axios.get(
              `${API_BASE_URL}/api/admin/years/get-year`,
              { headers }
            );
            setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
            break;
          case "sections":
            try {
              const sectionsRes = await axios.get(
                `${API_BASE_URL}/api/auth/admin/get-sections`,
                { headers }
              );
              console.log("Sections response:", sectionsRes.data);
              if (Array.isArray(sectionsRes.data)) {
                setSections(sectionsRes.data);
              } else {
                console.error("Sections data is not an array:", sectionsRes.data);
                setError("Invalid sections data format received");
              }
            } catch (sectionError) {
              console.error("Error fetching sections:", sectionError);
              if (sectionError.response) {
                setError(`Failed to fetch sections: ${sectionError.response.data.message || "Please try again."}`);
              } else {
                setError("Failed to fetch sections. Please try again.");
              }
            }
            break;
          case "subjects":
            const subjectsRes = await axios.get(
              `${API_BASE_URL}/api/admin/subjects/get-subject`,
              { headers }
            );
            setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            break;
          case "scheduler":
            const schedulesRes = await axios.get(
              `${API_BASE_URL}/api/auth/admin/get-schedules`,
              { headers }
            );
            setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
          setError(
            `Failed to fetch data: ${
              error.response.data.message || "Please try again."
            }`
          );
        } else {
          setError("An error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Validation functions
  const validateUser = () => {
    const errors = {};
    if (!newUser.username) errors.username = "Username is required";
    if (!newUser.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newUser.email))
      errors.email = "Email is invalid";
    if (!newUser.password) errors.password = "Password is required";
    else if (newUser.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateYear = () => {
    const errors = {};
    if (!newYear.name) errors.name = "Year level is required";
    else if (!["1st", "2nd", "3rd", "4th"].includes(newYear.name)) {
      errors.name = "Year level must be 1st, 2nd, 3rd, or 4th";
    }
    setYearErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSection = () => {
    const errors = {};
    if (!newSection.name) errors.name = "Section name is required";
    if (!newSection.courseId) errors.courseId = "Course is required";
    if (!newSection.yearId) errors.yearId = "Year level is required";
    if (newSection.capacity < 1 || newSection.capacity > 40) {
      errors.capacity = "Capacity must be between 1 and 40";
    }
    setSectionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSubject = () => {
    const errors = {};
    if (!newSubject.subjectCode)
      errors.subjectCode = "Subject code is required";
    if (!newSubject.subjectName)
      errors.subjectName = "Subject name is required";
    if (!newSubject.courseId) errors.courseId = "Course is required";
    if (!newSubject.yearLevelId) errors.yearLevelId = "Year level is required";
    if (!newSubject.semester) errors.semester = "Semester is required";
    if (!newSubject.units || newSubject.units < 1)
      errors.units = "Units must be at least 1";
    if (!newSubject.day) errors.day = "Day is required";
    setSubjectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRoom = () => {
    const errors = {};
    if (!newRoom.room) errors.room = "Room name is required";
    setRoomErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update the validateSchedule function
  const validateSchedule = () => {
    const errors = {};
    if (!newSchedule.sectionId) errors.sectionId = "Section is required";
    if (!newSchedule.subjectId) errors.subjectId = "Subject is required";
    if (!newSchedule.day) errors.day = "Day is required";
    if (!newSchedule.startTime) errors.startTime = "Start time is required";
    if (!newSchedule.endTime) errors.endTime = "End time is required";
    if (!newSchedule.semester) errors.semester = "Semester is required";
    
    // Validate time format and logic
    if (newSchedule.startTime && newSchedule.endTime) {
      const start = new Date(`2000-01-01T${newSchedule.startTime}`);
      const end = new Date(`2000-01-01T${newSchedule.endTime}`);
      if (start >= end) {
        errors.endTime = "End time must be after start time";
      }
    }
    
    setScheduleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let searchEndpoint = "";
      switch (activeTab) {
        case "users":
          searchEndpoint = `${API_BASE_URL}/api/auth/admin/search-user/${searchQuery}`;
          break;
        case "years":
          searchEndpoint = `${API_BASE_URL}/api/admin/years/search-year/${searchQuery}`;
          break;
        case "sections":
          searchEndpoint = `${API_BASE_URL}/api/admin/sections/search-section/${searchQuery}`;
          break;
        case "subjects":
          searchEndpoint = `${API_BASE_URL}/api/admin/subjects/search-subject/${searchQuery}`;
          break;
        default:
          return;
      }

      const response = await axios.get(searchEndpoint, { headers });
      switch (activeTab) {
        case "users":
          setUsers(response.data);
          break;
        case "years":
          setYears(response.data);
          break;
        case "sections":
          setSections(response.data);
          break;
        case "subjects":
          setSubjects(response.data);
          break;
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add delete functionality
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let deleteEndpoint = "";
      switch (activeTab) {
        case "users":
          deleteEndpoint = `${API_BASE_URL}/api/auth/admin/update-user/${id}`;
          break;
        case "years":
          deleteEndpoint = `${API_BASE_URL}/api/admin/years/delete-year/${id}`;
          break;
        case "sections":
          deleteEndpoint = `${API_BASE_URL}/api/auth/admin/delete-section/${id}`;
          break;
        case "subjects":
          deleteEndpoint = `${API_BASE_URL}/api/admin/subjects/delete-subject/${id}`;
          break;
        default:
          return;
      }

      await axios.delete(deleteEndpoint, { headers });
      setSuccess("Item deleted successfully");

      // Refresh the list
      const fetchData = async () => {
        try {
          switch (activeTab) {
            case "users":
              const usersRes = await axios.get(
                `${API_BASE_URL}/api/auth/admin/get-users`,
                { headers }
              );
              setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
              break;
            case "years":
              const yearsRes = await axios.get(
                `${API_BASE_URL}/api/admin/years/get-year`,
                { headers }
              );
              setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
              break;
            case "sections":
              const sectionsRes = await axios.get(
                `${API_BASE_URL}/api/auth/admin/get-sections`,
                { headers }
              );
              setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
              break;
            case "subjects":
              const subjectsRes = await axios.get(
                `${API_BASE_URL}/api/admin/subjects/get-subject`,
                { headers }
              );
              setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
              break;
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
          setError("Failed to refresh data. Please try again.");
        }
      };
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode
  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    switch (activeTab) {
      case "users":
        setNewUser({
          username: item.username,
          email: item.email,
          role: item.role,
        });
        break;
      case "years":
        setNewYear({ name: item.name });
        break;
      case "sections":
        setNewSection({
          name: item.name,
          courseId: item.courseId,
          yearId: item.yearId,
          capacity: item.capacity,
        });
        break;
      case "subjects":
        setNewSubject({
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          courseId: item.courseId,
          yearLevelId: item.yearLevelId,
          semester: item.semester,
          units: item.units,
          day: item.day,
        });
        break;
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    resetFormStates();
  };

  // Update form submission handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUser()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/auth/admin/update-user/${editId}`,
          newUser,
          { headers }
        );
        setSuccess("User updated successfully");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/admin/create-user`,
          newUser,
          { headers }
        );
        setSuccess("User created successfully");
      }

      resetFormStates();

      // Refresh users list
      const usersRes = await axios.get(
        `${API_BASE_URL}/api/auth/admin/get-users`,
        { headers }
      );
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error("Error saving user:", error);
      if (error.response) {
        setError(
          `Failed to save user: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        setError("Failed to save user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleYearSubmit = async (e) => {
    e.preventDefault();
    if (!validateYear()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/admin/years/update-year/${editId}`,
          newYear,
          { headers }
        );
        setSuccess("Year level updated successfully");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/years/create-year`,
          newYear,
          { headers }
        );
        setSuccess("Year level created successfully");
      }

      resetFormStates();

      // Refresh years list
      const yearsRes = await axios.get(
        `${API_BASE_URL}/api/admin/years/get-year`,
        { headers }
      );
      setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
    } catch (error) {
      console.error("Error saving year:", error);
      if (error.response) {
        setError(
          `Failed to save year: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        setError("Failed to save year. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/auth/admin/update-section/${editId}`,
          newSection,
          { headers }
        );
        setSuccess("Section updated successfully");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/admin/create-section`,
          newSection,
          { headers }
        );
        setSuccess("Section created successfully");
      }

      resetFormStates();

      // Refresh sections list
      const sectionsRes = await axios.get(
        `${API_BASE_URL}/api/auth/admin/get-sections`,
        { headers }
      );
      setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
    } catch (error) {
      console.error("Error saving section:", error);
      if (error.response) {
        setError(
          `Failed to save section: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        setError("Failed to save section. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!validateSubject()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/admin/subjects/update-subject/${editId}`,
          newSubject,
          { headers }
        );
        setSuccess("Subject updated successfully");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/subjects/create-subject`,
          newSubject,
          { headers }
        );
        setSuccess("Subject created successfully");
      }

      resetFormStates();

      // Refresh subjects list
      const subjectsRes = await axios.get(
        `${API_BASE_URL}/api/admin/subjects/get-subject`,
        { headers }
      );
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
    } catch (error) {
      console.error("Error saving subject:", error);
      if (error.response) {
        setError(
          `Failed to save subject: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        setError("Failed to save subject. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the handleScheduleSubmit function
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSchedule()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Check for conflicts only within the same semester
      const hasConflict = schedules.some(schedule => {
        // Skip if different semester
        if (schedule.semester !== newSchedule.semester) return false;
        
        // Skip if different section
        const scheduleSectionId = typeof schedule.sectionId === 'object' ? schedule.sectionId._id : schedule.sectionId;
        if (scheduleSectionId !== newSchedule.sectionId) return false;
        
        // Skip if different day
        if (schedule.day !== newSchedule.day) return false;
        
        // Check time overlap
        const existingStart = new Date(`2000-01-01T${schedule.startTime}`);
        const existingEnd = new Date(`2000-01-01T${schedule.endTime}`);
        const newStart = new Date(`2000-01-01T${newSchedule.startTime}`);
        const newEnd = new Date(`2000-01-01T${newSchedule.endTime}`);
        
        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (hasConflict) {
        setError("This time slot conflicts with an existing schedule in the same semester");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/admin/schedule`,
        newSchedule,
        { headers }
      );

      if (response.data.success) {
        setSuccess("Schedule created successfully");
        // Refresh schedules
        const schedulesRes = await axios.get(
          `${API_BASE_URL}/api/auth/admin/get-schedules`,
          { headers }
        );
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        // Reset form
        setNewSchedule({
          sectionId: "",
          subjectId: "",
          day: "",
          startTime: "",
          endTime: "",
          semester: "1st",
          academicYear: new Date().getFullYear().toString()
        });
      } else {
        setError(response.data.message || "Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      setError(error.response?.data?.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDeleteSchedule function
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.delete(
        `${API_BASE_URL}/api/auth/admin/schedule/${id}`,
        { headers }
      );

      if (response.data.success) {
        setSuccess("Schedule deleted successfully");
        // Refresh schedules
        const schedulesRes = await axios.get(
          `${API_BASE_URL}/api/auth/admin/get-schedules`,
          { headers }
        );
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      } else {
        setError(response.data.message || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError(error.response?.data?.message || "Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  // Add this function after handleDeleteSchedule
  const handleDeleteAllSchedules = async () => {
    if (!window.confirm("Are you sure you want to delete ALL schedules? This action cannot be undone.")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.delete(
        `${API_BASE_URL}/api/auth/admin/delete-schedules`,
        { headers }
      );

      if (response.data.success) {
        setSuccess("All schedules deleted successfully");
        // Refresh schedules
        const schedulesRes = await axios.get(
          `${API_BASE_URL}/api/auth/admin/get-schedules`,
          { headers }
        );
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      } else {
        setError(response.data.message || "Failed to delete all schedules");
      }
    } catch (error) {
      console.error("Error deleting all schedules:", error);
      setError(error.response?.data?.message || "Failed to delete all schedules");
    } finally {
      setLoading(false);
    }
  };

  // Update the getUniqueSchedules function to properly handle semester filtering
  const getUniqueSchedules = (schedules, semester) => {
    const seenSubjects = new Set();
    return schedules
      .filter(schedule => schedule.semester === semester)
      .filter(schedule => {
        const key = `${schedule.subjectId._id}-${schedule.sectionId._id}-${schedule.semester}`;
        if (seenSubjects.has(key)) {
          return false;
        }
        seenSubjects.add(key);
        return true;
      });
  };

  // Update the getFilteredSubjects function
  const getFilteredSubjects = (sectionId, semester) => {
    if (!sectionId) return subjects;
    
    const section = sections.find(s => s._id === sectionId);
    if (!section) return [];

    return subjects.filter(subject => {
      // Check if the IDs match (handling both populated and unpopulated cases)
      const courseMatch = 
        (typeof subject.courseId === 'object' ? subject.courseId._id : subject.courseId) === 
        (typeof section.courseId === 'object' ? section.courseId._id : section.courseId);
      
      const yearMatch = 
        (typeof subject.yearLevelId === 'object' ? subject.yearLevelId._id : subject.yearLevelId) === 
        (typeof section.yearId === 'object' ? section.yearId._id : section.yearId);
      
      const semesterMatch = subject.semester === semester;

      return courseMatch && yearMatch && semesterMatch;
    });
  };

  // Update the getScheduleTable function to handle time slots better
  const getScheduleTable = (sectionId, semester) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    // Filter schedules for the selected section and semester
    const sectionSchedules = schedules.filter(
      schedule => 
        schedule.sectionId._id === sectionId && 
        schedule.semester === semester
    );

    // Create the table structure
    const table = days.map(day => {
      const daySchedules = sectionSchedules.filter(schedule => schedule.day === day);
      return {
        day,
        schedules: timeSlots.map(time => {
          const schedule = daySchedules.find(s => 
            s.startTime <= time && s.endTime > time
          );
          return schedule || null;
        })
      };
    });

    return table;
  };

  // Add function to handle schedule edit
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditingSchedule(true);
    setNewSchedule({
      sectionId: schedule.sectionId._id,
      subjectId: schedule.subjectId._id,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      semester: schedule.semester,
      academicYear: schedule.academicYear
    });
  };

  // Add function to handle schedule update
  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    if (!validateSchedule()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/admin/schedule/${editingSchedule._id}`,
        newSchedule,
        { headers }
      );

      if (response.data.success) {
        setSuccess("Schedule updated successfully");
        // Refresh schedules
        const schedulesRes = await axios.get(
          `${API_BASE_URL}/api/auth/admin/get-schedules`,
          { headers }
        );
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        // Reset form and editing state
        setNewSchedule({
          sectionId: "",
          subjectId: "",
          day: "",
          startTime: "",
          endTime: "",
          semester: "1st",
          academicYear: new Date().getFullYear().toString()
        });
        setEditingSchedule(null);
        setIsEditingSchedule(false);
      } else {
        setError(response.data.message || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      setError(error.response?.data?.message || "Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  // Add function to cancel schedule edit
  const handleCancelScheduleEdit = () => {
    setEditingSchedule(null);
    setIsEditingSchedule(false);
    setNewSchedule({
      sectionId: "",
      subjectId: "",
      day: "",
      startTime: "",
      endTime: "",
      semester: "1st",
      academicYear: new Date().getFullYear().toString()
    });
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`tab-button ${activeTab === "years" ? "active" : ""}`}
            onClick={() => setActiveTab("years")}
          >
            Years
          </button>
          <button
            className={`tab-button ${activeTab === "sections" ? "active" : ""}`}
            onClick={() => setActiveTab("sections")}
          >
            Sections
          </button>
          <button
            className={`tab-button ${activeTab === "subjects" ? "active" : ""}`}
            onClick={() => setActiveTab("subjects")}
          >
            Subjects
          </button>
          <button
            className={`tab-button ${activeTab === "scheduler" ? "active" : ""}`}
            onClick={() => setActiveTab("scheduler")}
          >
            Scheduler
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="admin-content-area">
          {loading && <div className="loading-spinner">Loading...</div>}

          {/* Users Section */}
          {activeTab === "users" && (
            <div className="section-container">
              <h2 className="section-header">User Management</h2>
              <form onSubmit={handleUserSubmit} className="admin-form">
                <div className="form-grid form-grid-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className={`form-input ${
                        userErrors.username ? "error" : ""
                      }`}
                    />
                    {userErrors.username && (
                      <span className="error-text">{userErrors.username}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className={`form-input ${
                        userErrors.email ? "error" : ""
                      }`}
                    />
                    {userErrors.email && (
                      <span className="error-text">{userErrors.email}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className={`form-input ${
                        userErrors.password ? "error" : ""
                      }`}
                    />
                    {userErrors.password && (
                      <span className="error-text">{userErrors.password}</span>
                    )}
                  </div>
                </div>
                <div className="form-grid">
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="professor">Professor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {isEditing ? "Update User" : "Add User"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="data-grid">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <div key={user._id} className="data-card">
                      <h3 className="data-title">{user.username}</h3>
                      <p className="data-subtitle">{user.email}</p>
                      <p className="data-subtitle">Role: {user.role}</p>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No users found</p>
                )}
              </div>
            </div>
          )}

          {/* Years Section */}
          {activeTab === "years" && (
            <div>
              <h2 className="section-header">Year Level Management</h2>
              <form onSubmit={handleYearSubmit} className="admin-form">
                <div className="form-grid">
                  <div>
                    <select
                      value={newYear.name}
                      onChange={(e) => setNewYear({ name: e.target.value })}
                      className={`form-select ${
                        yearErrors.name ? "error" : ""
                      }`}
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                    {yearErrors.name && (
                      <span className="error-text">{yearErrors.name}</span>
                    )}
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {isEditing ? "Update Year Level" : "Add Year Level"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="data-grid">
                {years && years.length > 0 ? (
                  years.map((year) => (
                    <div key={year._id} className="data-card">
                      <h3 className="data-title">{year.name}</h3>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(year)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(year._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No years found</p>
                )}
              </div>
            </div>
          )}

          {/* Sections Section */}
          {activeTab === "sections" && (
            <div>
              <h2 className="section-header">Section Management</h2>
              <form onSubmit={handleSectionSubmit} className="admin-form">
                <div className="form-grid form-grid-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Section Name (e.g., BSIT-1A)"
                      value={newSection.name}
                      onChange={(e) =>
                        setNewSection({ ...newSection, name: e.target.value })
                      }
                      className={`form-input ${
                        sectionErrors.name ? "error" : ""
                      }`}
                    />
                    {sectionErrors.name && (
                      <span className="error-text">{sectionErrors.name}</span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSection.courseId}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          courseId: e.target.value,
                        })
                      }
                      className={`form-select ${
                        sectionErrors.courseId ? "error" : ""
                      }`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.course}
                        </option>
                      ))}
                    </select>
                    {sectionErrors.courseId && (
                      <span className="error-text">
                        {sectionErrors.courseId}
                      </span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSection.yearId}
                      onChange={(e) =>
                        setNewSection({ ...newSection, yearId: e.target.value })
                      }
                      className={`form-select ${
                        sectionErrors.yearId ? "error" : ""
                      }`}
                    >
                      <option value="">Select Year Level</option>
                      {years.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                    {sectionErrors.yearId && (
                      <span className="error-text">{sectionErrors.yearId}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Capacity (max 40)"
                      value={newSection.capacity}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="40"
                      className={`form-input ${
                        sectionErrors.capacity ? "error" : ""
                      }`}
                    />
                    {sectionErrors.capacity && (
                      <span className="error-text">
                        {sectionErrors.capacity}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {isEditing ? "Update Section" : "Add Section"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="data-grid">
                {sections && sections.length > 0 ? (
                  sections.map((section) => (
                    <div key={section._id} className="data-card">
                      <h3 className="data-title">{section.name}</h3>
                      <p className="data-subtitle">
                        Course: {section.courseId ? section.courseId.course : 'Not assigned'}
                      </p>
                      <p className="data-subtitle">
                        Year Level: {section.yearId ? section.yearId.name : 'Not assigned'}
                      </p>
                      <p className="data-subtitle">
                        Capacity: {section.capacity}
                      </p>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(section)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(section._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No sections found</p>
                )}
              </div>
            </div>
          )}

          {/* Subjects Section */}
          {activeTab === "subjects" && (
            <div>
              <h2 className="section-header">Subject Management</h2>
              <form onSubmit={handleSubjectSubmit} className="admin-form">
                <div className="form-grid form-grid-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Subject Code (e.g., IT101)"
                      value={newSubject.subjectCode}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subjectCode: e.target.value,
                        })
                      }
                      className={`form-input ${
                        subjectErrors.subjectCode ? "error" : ""
                      }`}
                    />
                    {subjectErrors.subjectCode && (
                      <span className="error-text">
                        {subjectErrors.subjectCode}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Subject Name (e.g., Introduction to Programming)"
                      value={newSubject.subjectName}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subjectName: e.target.value,
                        })
                      }
                      className={`form-input ${
                        subjectErrors.subjectName ? "error" : ""
                      }`}
                    />
                    {subjectErrors.subjectName && (
                      <span className="error-text">
                        {subjectErrors.subjectName}
                      </span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSubject.courseId}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          courseId: e.target.value,
                        })
                      }
                      className={`form-select ${
                        subjectErrors.courseId ? "error" : ""
                      }`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.course}
                        </option>
                      ))}
                    </select>
                    {subjectErrors.courseId && (
                      <span className="error-text">
                        {subjectErrors.courseId}
                      </span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSubject.yearLevelId}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          yearLevelId: e.target.value,
                        })
                      }
                      className={`form-select ${
                        subjectErrors.yearLevelId ? "error" : ""
                      }`}
                    >
                      <option value="">Select Year Level</option>
                      {years.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                    {subjectErrors.yearLevelId && (
                      <span className="error-text">
                        {subjectErrors.yearLevelId}
                      </span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSubject.semester}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          semester: e.target.value,
                        })
                      }
                      className={`form-select ${
                        subjectErrors.semester ? "error" : ""
                      }`}
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                    {subjectErrors.semester && (
                      <span className="error-text">{subjectErrors.semester}</span>
                    )}
                  </div>
                  <div>
                    <select
                      value={newSubject.day}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, day: e.target.value })
                      }
                      className={`form-select ${
                        subjectErrors.day ? "error" : ""
                      }`}
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                    {subjectErrors.day && (
                      <span className="error-text">{subjectErrors.day}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Units (e.g., 3)"
                      value={newSubject.units}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          units: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className={`form-input ${
                        subjectErrors.units ? "error" : ""
                      }`}
                    />
                    {subjectErrors.units && (
                      <span className="error-text">{subjectErrors.units}</span>
                    )}
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {isEditing ? "Update Subject" : "Add Subject"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="data-grid">
                {subjects && subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div key={subject._id} className="data-card">
                      <div className="data-card-header">
                        <h3 className="data-title">{subject.subjectName}</h3>
                        <span className="data-code">{subject.subjectCode}</span>
                      </div>
                      <div className="data-card-content">
                        <div className="data-info-group">
                          <p className="data-label">Course:</p>
                          <p className="data-value">{subject.courseId?.course || 'Not assigned'}</p>
                        </div>
                        <div className="data-info-group">
                          <p className="data-label">Year Level:</p>
                          <p className="data-value">{subject.yearLevelId?.name || 'Not assigned'}</p>
                        </div>
                        <div className="data-info-group">
                          <p className="data-label">Semester:</p>
                          <p className="data-value">{subject.semester}</p>
                        </div>
                        <div className="data-info-group">
                          <p className="data-label">Units:</p>
                          <p className="data-value">{subject.units}</p>
                        </div>
                        <div className="data-info-group">
                          <p className="data-label">Day:</p>
                          <p className="data-value">{subject.day}</p>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No subjects found</p>
                )}
              </div>
            </div>
          )}

          {/* Scheduler Section */}
          {activeTab === "scheduler" && (
            <div className="scheduler-container">
              <div className="scheduler-header">
                <h2 className="section-header">Schedule Management</h2>
                <button
                  className="btn-delete-all"
                  onClick={handleDeleteAllSchedules}
                  disabled={loading || schedules.length === 0}
                >
                  Delete All Schedules
                </button>
              </div>

              <div className="scheduler-controls">
                <div className="section-selector">
                  <label>Select Section:</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setNewSchedule(prev => ({ ...prev, sectionId: e.target.value }));
                    }}
                    className="form-select"
                  >
                    <option value="">Select Section to View Schedule</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="schedule-form">
                <h3>Create New Schedule</h3>
                <form onSubmit={handleScheduleSubmit}>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Section:</label>
                      <select
                        value={newSchedule.sectionId}
                        onChange={(e) =>
                          setNewSchedule({ ...newSchedule, sectionId: e.target.value })
                        }
                        required
                        className={scheduleErrors.sectionId ? "error" : ""}
                      >
                        <option value="">Select Section</option>
                        {sections.map((section) => (
                          <option key={section._id} value={section._id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                      {scheduleErrors.sectionId && (
                        <span className="error">{scheduleErrors.sectionId}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Subject:</label>
                      <select
                        value={newSchedule.subjectId}
                        onChange={(e) =>
                          setNewSchedule({ ...newSchedule, subjectId: e.target.value })
                        }
                        required
                        className={scheduleErrors.subjectId ? "error" : ""}
                      >
                        <option value="">Select Subject</option>
                        {getFilteredSubjects(newSchedule.sectionId, newSchedule.semester).map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.subjectCode} - {subject.subjectName}
                          </option>
                        ))}
                      </select>
                      {scheduleErrors.subjectId && (
                        <span className="error">{scheduleErrors.subjectId}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Day:</label>
                      <select
                        value={newSchedule.day}
                        onChange={(e) =>
                          setNewSchedule({ ...newSchedule, day: e.target.value })
                        }
                        required
                        className={scheduleErrors.day ? "error" : ""}
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                      {scheduleErrors.day && (
                        <span className="error">{scheduleErrors.day}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Time Range:</label>
                      <div className="time-range-inputs">
                        <input
                          type="time"
                          value={newSchedule.startTime}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, startTime: e.target.value })
                          }
                          required
                          className={scheduleErrors.startTime ? "error" : ""}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={newSchedule.endTime}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, endTime: e.target.value })
                          }
                          required
                          className={scheduleErrors.endTime ? "error" : ""}
                        />
                      </div>
                      {(scheduleErrors.startTime || scheduleErrors.endTime) && (
                        <span className="error">{scheduleErrors.startTime || scheduleErrors.endTime}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Semester:</label>
                      <select
                        value={newSchedule.semester}
                        onChange={(e) =>
                          setNewSchedule({ ...newSchedule, semester: e.target.value })
                        }
                        required
                        className={scheduleErrors.semester ? "error" : ""}
                      >
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                      </select>
                      {scheduleErrors.semester && (
                        <span className="error">{scheduleErrors.semester}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Academic Year:</label>
                      <input
                        type="text"
                        value={newSchedule.academicYear}
                        onChange={(e) =>
                          setNewSchedule({ ...newSchedule, academicYear: e.target.value })
                        }
                        required
                        placeholder="e.g., 2023-2024"
                        className={scheduleErrors.academicYear ? "error" : ""}
                      />
                      {scheduleErrors.academicYear && (
                        <span className="error">{scheduleErrors.academicYear}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Creating..." : "Create Schedule"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="schedule-list">
                <h3>Current Schedules</h3>
                
                {selectedSection ? (
                  <div className="semester-tabs">
                    <button
                      className={`semester-tab ${selectedSemester === "1st" ? "active" : ""}`}
                      onClick={() => setSelectedSemester("1st")}
                    >
                      1st Semester
                    </button>
                    <button
                      className={`semester-tab ${selectedSemester === "2nd" ? "active" : ""}`}
                      onClick={() => setSelectedSemester("2nd")}
                    >
                      2nd Semester
                    </button>
                  </div>
                ) : (
                  <div className="schedule-empty-state">
                    <div className="empty-icon">📅</div>
                    <p>Please select a section to view its schedule</p>
                  </div>
                )}

                {selectedSection && (
                  <div className="schedule-table-container">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th className="time-column">Time</th>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <th key={day} className="day-column">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                          <tr key={time}>
                            <td className="time-slot">{time}</td>
                            {getScheduleTable(selectedSection, selectedSemester).map(day => (
                              <td key={`${day.day}-${time}`} className="schedule-cell">
                                {day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)] ? (
                                  <div className="schedule-item">
                                    <div className="schedule-actions">
                                      <button
                                        className="btn-edit-schedule"
                                        onClick={() => handleEditSchedule(day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)])}
                                      >
                                        ✎
                                      </button>
                                      <button
                                        className="btn-delete-schedule"
                                        onClick={() => handleDeleteSchedule(day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)]._id)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <div className="schedule-subject">
                                      {day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)].subjectId.subjectCode}
                                    </div>
                                    <div className="schedule-subject-name">
                                      {day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)].subjectId.subjectName}
                                    </div>
                                    <div className="schedule-time-range">
                                      {day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)].startTime} - 
                                      {day.schedules[['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].indexOf(time)].endTime}
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add the Modal component */}
              <Modal isOpen={isEditingSchedule} onClose={handleCancelScheduleEdit}>
                <div className="modal-form">
                  <h3>Edit Schedule</h3>
                  <form onSubmit={handleUpdateSchedule}>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Section:</label>
                        <select
                          value={newSchedule.sectionId}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, sectionId: e.target.value })
                          }
                          required
                          className={scheduleErrors.sectionId ? "error" : ""}
                        >
                          <option value="">Select Section</option>
                          {sections.map((section) => (
                            <option key={section._id} value={section._id}>
                              {section.name}
                            </option>
                          ))}
                        </select>
                        {scheduleErrors.sectionId && (
                          <span className="error">{scheduleErrors.sectionId}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Subject:</label>
                        <select
                          value={newSchedule.subjectId}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, subjectId: e.target.value })
                          }
                          required
                          className={scheduleErrors.subjectId ? "error" : ""}
                        >
                          <option value="">Select Subject</option>
                          {getFilteredSubjects(newSchedule.sectionId, newSchedule.semester).map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.subjectCode} - {subject.subjectName}
                            </option>
                          ))}
                        </select>
                        {scheduleErrors.subjectId && (
                          <span className="error">{scheduleErrors.subjectId}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Day:</label>
                        <select
                          value={newSchedule.day}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, day: e.target.value })
                          }
                          required
                          className={scheduleErrors.day ? "error" : ""}
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                        </select>
                        {scheduleErrors.day && (
                          <span className="error">{scheduleErrors.day}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Time Range:</label>
                        <div className="time-range-inputs">
                          <input
                            type="time"
                            value={newSchedule.startTime}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, startTime: e.target.value })
                            }
                            required
                            className={scheduleErrors.startTime ? "error" : ""}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={newSchedule.endTime}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, endTime: e.target.value })
                            }
                            required
                            className={scheduleErrors.endTime ? "error" : ""}
                          />
                        </div>
                        {(scheduleErrors.startTime || scheduleErrors.endTime) && (
                          <span className="error">{scheduleErrors.startTime || scheduleErrors.endTime}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Semester:</label>
                        <select
                          value={newSchedule.semester}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, semester: e.target.value })
                          }
                          required
                          className={scheduleErrors.semester ? "error" : ""}
                        >
                          <option value="1st">1st Semester</option>
                          <option value="2nd">2nd Semester</option>
                        </select>
                        {scheduleErrors.semester && (
                          <span className="error">{scheduleErrors.semester}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Academic Year:</label>
                        <input
                          type="text"
                          value={newSchedule.academicYear}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, academicYear: e.target.value })
                          }
                          required
                          placeholder="e.g., 2023-2024"
                          className={scheduleErrors.academicYear ? "error" : ""}
                        />
                        {scheduleErrors.academicYear && (
                          <span className="error">{scheduleErrors.academicYear}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Updating..." : "Update Schedule"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelScheduleEdit}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
