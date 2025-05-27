import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/superadmin.css";

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formCreate, setFormCreate] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formUpdate, setFormUpdate] = useState({
    id: "",
    username: "",
    email: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/superadmin/get-admins",
        getAuthHeaders()
      );
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      alert("Failed to fetch admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateChange = (e) => {
    setFormCreate({ ...formCreate, [e.target.name]: e.target.value });
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/auth/superadmin/create-admin",
        formCreate,
        getAuthHeaders()
      );
      alert("Admin created!");
      setFormCreate({ username: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create admin");
    }
  };

  const handleUpdateChange = (e) => {
    setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
  };

  const updateAdmin = async (e) => {
    e.preventDefault();
    if (!formUpdate.id) return alert("Please select an admin to update");
    try {
      await axios.put(
        `http://localhost:5000/api/auth/superadmin/update-admin/${formUpdate.id}`,
        {
          username: formUpdate.username,
          email: formUpdate.email,
        },
        getAuthHeaders()
      );
      alert("Admin updated!");
      setFormUpdate({ id: "", username: "", email: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update admin");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/auth/superadmin/delete-admin/${id}`,
        getAuthHeaders()
      );
      alert("Admin deleted!");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const searchAdmins = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return fetchAdmins();
    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/superadmin/search-admin/${encodeURIComponent(
          searchTerm
        )}`,
        getAuthHeaders()
      );
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setAdmins([]);
        alert("No admins found matching your search");
      } else {
        alert(err.response?.data?.message || "Search failed");
      }
    }
  };

  const selectAdminToUpdate = (admin) => {
    setFormUpdate({
      id: admin._id || "",
      username: admin.username || "",
      email: admin.email || "",
    });
  };

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-container">
        <h1 className="superadmin-title">Superadmin Admin Management</h1>

        <section className="superadmin-section">
          <h2>Create Admin</h2>
          <form onSubmit={createAdmin} className="superadmin-form">
            <input
              name="username"
              placeholder="Username"
              value={formCreate.username}
              onChange={handleCreateChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formCreate.email}
              onChange={handleCreateChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formCreate.password}
              onChange={handleCreateChange}
              required
            />
            <button type="submit">Create</button>
          </form>
        </section>

        <section className="superadmin-section">
          <h2>Search Admins</h2>
          <form onSubmit={searchAdmins} className="superadmin-form">
            <input
              placeholder="Search by email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                fetchAdmins();
              }}
            >
              Reset
            </button>
          </form>
        </section>

        <section className="superadmin-section">
          <h2>Admins List</h2>
          {admins.length === 0 ? (
            <p>No admins found.</p>
          ) : (
            <div className="superadmin-table-container">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.username || "(no username)"}</td>
                      <td>{admin.email || "(no email)"}</td>
                      <td>
                        <button onClick={() => selectAdminToUpdate(admin)}>
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin._id)}
                          className="superadmin-delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="superadmin-section">
          <h2>Update Admin</h2>
          <form onSubmit={updateAdmin} className="superadmin-form">
            <input
              name="username"
              placeholder="Username"
              value={formUpdate.username}
              onChange={handleUpdateChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formUpdate.email}
              onChange={handleUpdateChange}
              required
            />
            <button type="submit">Update</button>
          </form>
          {formUpdate.id && (
            <p className="superadmin-editing">
              Currently editing: {formUpdate.username} ({formUpdate.email})
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
