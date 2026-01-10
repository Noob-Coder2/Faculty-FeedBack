// src/components/Admin/ClassFormDialog.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'];
const SECTIONS = ['A', 'B', 'C'];

function ClassFormDialog({ open, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        semester: '',
        year: new Date().getFullYear(),
        section: '',
        academicYear: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                branch: initialData.branch || '',
                semester: initialData.semester || '',
                year: initialData.year || new Date().getFullYear(),
                section: initialData.section || '',
                academicYear: initialData.academicYear || ''
            });
        } else {
            const currentYear = new Date().getFullYear();
            setFormData({
                name: '',
                branch: '',
                semester: '',
                year: currentYear,
                section: '',
                academicYear: `${currentYear}-${currentYear + 1}`
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        onSubmit(formData);
        onClose();
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Class' : 'Create Class'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Class Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., CSE-3A-2024"
                        />
                    </Grid>
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
                        <TextField
                            fullWidth
                            label="Year"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label="Academic Year"
                            name="academicYear"
                            value={formData.academicYear}
                            onChange={handleChange}
                            placeholder="2024-2025"
                            required
                        />
                    </Grid>
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

export default ClassFormDialog;
