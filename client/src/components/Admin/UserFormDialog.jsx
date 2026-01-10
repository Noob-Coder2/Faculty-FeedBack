// src/components/Admin/UserFormDialog.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'];
const SECTIONS = ['A', 'B', 'C'];

function UserFormDialog({ open, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        email: '',
        password: '',
        role: 'student',
        // Student fields
        branch: '',
        semester: '',
        section: '',
        academicYear: '',
        admissionYear: '',
        // Faculty fields
        department: '',
        designation: '',
        joiningYear: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                userId: initialData.userId || '',
                name: initialData.name || '',
                email: initialData.email || '',
                password: '',
                role: initialData.role || 'student',
                branch: initialData.profile?.branch || '',
                semester: initialData.profile?.semester || '',
                section: initialData.profile?.section || '',
                academicYear: initialData.profile?.academicYear || '',
                admissionYear: initialData.profile?.admissionYear || '',
                department: initialData.profile?.department || '',
                designation: initialData.profile?.designation || '',
                joiningYear: initialData.profile?.joiningYear || ''
            });
        } else {
            setFormData({
                userId: '', name: '', email: '', password: '', role: 'student',
                branch: '', semester: '', section: '', academicYear: '', admissionYear: '',
                department: '', designation: '', joiningYear: ''
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSubmit(formData);
        onClose();
    };

    const isEdit = !!initialData;
    const currentYear = new Date().getFullYear();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Common fields */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="User ID" name="userId" value={formData.userId} onChange={handleChange} required disabled={isEdit} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required={!isEdit} helperText={isEdit ? 'Leave blank to keep current' : ''} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth required disabled={isEdit}>
                            <InputLabel>Role</InputLabel>
                            <Select name="role" value={formData.role} label="Role" onChange={handleChange}>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="faculty">Faculty</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Student-specific fields */}
                    {formData.role === 'student' && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Branch</InputLabel>
                                    <Select name="branch" value={formData.branch} label="Branch" onChange={handleChange}>
                                        {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Semester</InputLabel>
                                    <Select name="semester" value={formData.semester} label="Semester" onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Section</InputLabel>
                                    <Select name="section" value={formData.section} label="Section" onChange={handleChange}>
                                        {SECTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField fullWidth label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} placeholder="2024-2025" required />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField fullWidth label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} required />
                            </Grid>
                        </>
                    )}

                    {/* Faculty-specific fields */}
                    {formData.role === 'faculty' && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Joining Year" name="joiningYear" type="number" value={formData.joiningYear} onChange={handleChange} required />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserFormDialog;
