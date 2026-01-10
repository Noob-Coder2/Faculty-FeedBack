// src/components/Admin/FeedbackPeriodFormDialog.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem, Grid, Switch, FormControlLabel
} from '@mui/material';

function FeedbackPeriodFormDialog({ open, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        semester: '',
        year: new Date().getFullYear(),
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                semester: initialData.semester || '',
                year: initialData.year || new Date().getFullYear(),
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
                isActive: initialData.isActive ?? true
            });
        } else {
            setFormData({
                name: '',
                semester: '',
                year: new Date().getFullYear(),
                startDate: '',
                endDate: '',
                isActive: true
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = () => {
        onSubmit(formData);
        onClose();
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Feedback Period' : 'Create Feedback Period'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Period Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Mid-Semester 2024"
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Semester</InputLabel>
                            <Select name="semester" value={formData.semester} label="Semester" onChange={handleChange}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={<Switch checked={formData.isActive} onChange={handleChange} name="isActive" />}
                            label="Active"
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

export default FeedbackPeriodFormDialog;
