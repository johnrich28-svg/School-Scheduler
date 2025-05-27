import React, { useEffect, useState } from "react";
import axios from "axios";

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
    password: "",
  });

  // Fetch admins list
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/get-admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      alert("Failed to fetch admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Create admin handler
  const handleCreateChange = (e) => {
    setFormCreate({ ...formCreate, [e.target.name]: e.target.value });
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/create-admin",
        formCreate
      );
      alert("Admin created!");
      setFormCreate({ username: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to create admin");
    }
  };

  // Update admin handlers
  const handleUpdateChange = (e) => {
    setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
  };

  const updateAdmin = async (e) => {
    e.preventDefault();
    if (!formUpdate.id) {
      alert("Please select an admin to update");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/users/update-admin/${formUpdate.id}`,
        {
          username: formUpdate.username,
          email: formUpdate.email,
          password: formUpdate.password,
        }
      );
      alert("Admin updated!");
      setFormUpdate({ id: "", username: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to update admin");
    }
  };

  // Delete admin
  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/delete-admin/${id}`);
      alert("Admin deleted!");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to delete admin");
    }
  };

  // Search admins
  const searchAdmins = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/search-admin",
        { query: searchTerm }
      );
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  // When clicking an admin from the list, load it into update form
  const selectAdminToUpdate = (admin) => {
    setFormUpdate({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      password: "",
    });
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>Superadmin Admin Management</h1>

      {/* CREATE ADMIN */}
      <section style={{ marginBottom: 40 }}>
        <h2>Create Admin</h2>
        <form onSubmit={createAdmin}>
          <input
            name="username"
            placeholder="Username"
            value={formCreate.username}
            onChange={handleCreateChange}
            required
            style={{ marginRight: 10 }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formCreate.email}
            onChange={handleCreateChange}
            required
            style={{ marginRight: 10 }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formCreate.password}
            onChange={handleCreateChange}
            required
            style={{ marginRight: 10 }}
          />
          <button type="submit">Create</button>
        </form>
      </section>

      {/* SEARCH ADMINS */}
      <section style={{ marginBottom: 40 }}>
        <h2>Search Admins</h2>
        <form onSubmit={searchAdmins}>
          <input
            placeholder="Search by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginRight: 10, width: 300 }}
          />
          <button type="submit">Search</button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              fetchAdmins();
            }}
            style={{ marginLeft: 10 }}
          >
            Reset
          </button>
        </form>
      </section>

      {/* ADMINS LIST */}
      <section style={{ marginBottom: 40 }}>
        <h2>Admins List</h2>
        {admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
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
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button onClick={() => selectAdminToUpdate(admin)}>
                      Edit
                    </button>{" "}
                    <button
                      onClick={() => deleteAdmin(admin._id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* UPDATE ADMIN */}
      <section>
        <h2>Update Admin</h2>
        <form onSubmit={updateAdmin}>
          <input
            name="username"
            placeholder="Username"
            value={formUpdate.username}
            onChange={handleUpdateChange}
            required
            style={{ marginRight: 10 }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formUpdate.email}
            onChange={handleUpdateChange}
            required
            style={{ marginRight: 10 }}
          />
          <input
            name="password"
            type="password"
            placeholder="New Password (leave blank to keep)"
            value={formUpdate.password}
            onChange={handleUpdateChange}
            style={{ marginRight: 10 }}
          />
          <button type="submit">Update</button>
        </form>
      </section>
    </div>
  );
};

export default SuperAdminDashboard;
