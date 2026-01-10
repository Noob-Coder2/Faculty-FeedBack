// src/components/Admin/SubjectFormDialog.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'];

function SubjectFormDialog({ open, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        subjectCode: '',
        subjectName: '',
        branch: '',
        semester: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                subjectCode: initialData.subjectCode || '',
                subjectName: initialData.subjectName || '',
                branch: initialData.branch || '',
                semester: initialData.semester || ''
            });
        } else {
            setFormData({ subjectCode: '', subjectName: '', branch: '', semester: '' });
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Subject Code"
                            name="subjectCode"
                            value={formData.subjectCode}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Subject Name"
                            name="subjectName"
                            value={formData.subjectName}
                            onChange={handleChange}
                            required
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
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Semester</InputLabel>
                            <Select name="semester" value={formData.semester} label="Semester" onChange={handleChange}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
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

export default SubjectFormDialog;
