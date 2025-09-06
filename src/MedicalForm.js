import React, { useState } from 'react';
import './MedicalForm.css';

function MedicalForm({ goBack }) {
  const [form, setForm] = useState({
    title: '',
    problem: '',
    diagnosis: '',
    description: '',
    files: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('problem', form.problem);
    formData.append('diagnosis', form.diagnosis);
    formData.append('description', form.description);
    form.files.forEach(file => formData.append('files', file));

    try {
      const res = await fetch('http://localhost:5000/api/save-medical', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      alert("✅ Medical data saved to blockchain!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving data.");
    }
  };

  return (
    <div className="medical-form-container">
      <div className="form-card">
        <h2>🩺 Add Medical Record</h2>
        <form onSubmit={handleSubmit} className="medical-form">
          <input name="title" placeholder="Title" onChange={handleChange} required />
          <input name="problem" placeholder="Problem" onChange={handleChange} required />
          <input name="diagnosis" placeholder="Diagnosis" onChange={handleChange} required />
          <textarea name="description" placeholder="Description" onChange={handleChange} required />

          <label className="file-upload">
            Attach Files:
            <input type="file" multiple accept=".pdf,image/*" onChange={handleFileChange} />
          </label>

          <button type="submit" className="submit-btn">🚀 Submit</button>
        </form>
        <button onClick={goBack} className="back-btn">⬅ Back</button>
      </div>
    </div>
  );
}

export default MedicalForm;