import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function StudentProfile({ applications, setStudentApps }) {
  const latestApp = applications[0];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_num: latestApp.phone_num || '',
    email: latestApp.email || '',
    current_semester: latestApp.current_semester || '',
    current_gpa: latestApp.current_gpa || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updateData = {
      phone_num: formData.phone_num,
      email: formData.email,
      current_semester: formData.current_semester,
      current_gpa: formData.current_gpa ? parseFloat(formData.current_gpa) : null
    };

    // Update ALL application rows for this student to keep them in sync
    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('enrollment_id', latestApp.enrollment_id);

    if (error) {
      toast.error('Failed to update profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      
      // Update local state
      const updatedApps = applications.map(app => ({ ...app, ...updateData }));
      setStudentApps(updatedApps);
      setIsEditing(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-xl animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-lg text-primary mb-2">My Profile</h2>
          <p className="font-body-md text-on-surface-variant">View and manage your student information.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-primary to-tertiary relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-surface-container-lowest rounded-full border-4 border-surface-container-lowest flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-primary">person</span>
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="mb-8 border-b border-outline-variant pb-8">
            <h3 className="font-headline-md font-bold text-on-surface">{latestApp.full_name}</h3>
            <p className="font-body-md text-on-surface-variant mb-4">{latestApp.enrollment_id} • {latestApp.current_program} in {latestApp.current_major?.replace('_', ' ')}</p>
            
            <div className="flex gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-label-sm uppercase tracking-wider text-on-surface-variant border border-outline-variant">
                <span className="material-symbols-outlined text-[14px]">school</span>
                {latestApp.current_semester}
              </span>
              {latestApp.current_gpa && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-label-sm uppercase tracking-wider text-on-surface-variant border border-outline-variant">
                  <span className="material-symbols-outlined text-[14px]">grade</span>
                  GPA: {latestApp.current_gpa}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-body-md"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 py-2 text-body-md text-on-surface font-medium">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">email</span>
                    {latestApp.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_num"
                    value={formData.phone_num}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-body-md"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 py-2 text-body-md text-on-surface font-medium">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">call</span>
                    {latestApp.phone_num}
                  </div>
                )}
              </div>

              {/* Semester */}
              {isEditing && (
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2">Current Semester</label>
                  <select 
                    name="current_semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-body-md"
                    required
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              )}

              {/* GPA */}
              {isEditing && (
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2">Current GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="current_gpa"
                    value={formData.current_gpa}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-body-md"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-8 flex gap-3 justify-end border-t border-outline-variant pt-6">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form
                    setFormData({
                      phone_num: latestApp.phone_num || '',
                      email: latestApp.email || '',
                      current_semester: latestApp.current_semester || '',
                      current_gpa: latestApp.current_gpa || ''
                    });
                  }}
                  className="px-6 py-2 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors border border-outline-variant"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
