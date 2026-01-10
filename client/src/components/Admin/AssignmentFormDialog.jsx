// src/components/Admin/AssignmentFormDialog.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Alert
} from '@mui/material';

function AssignmentFormDialog({ open, onClose, onSubmit, initialData, faculty, subjects, classes, feedbackPeriods }) {
    const [formData, setFormData] = useState({
        faculty: '',
        subject: '',
        classId: '',
        feedbackPeriod: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                faculty: initialData.faculty?._id || initialData.faculty || '',
                subject: initialData.subject?._id || initialData.subject || '',
                classId: initialData.class?._id || initialData.classId || '',
                feedbackPeriod: initialData.feedbackPeriod?._id || initialData.feedbackPeriod || ''
            });
        } else {
            setFormData({ faculty: '', subject: '', classId: '', feedbackPeriod: '' });
        }
        setError('');
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!formData.faculty || !formData.subject || !formData.classId || !formData.feedbackPeriod) {
            setError('All fields are required');
            return;
        }
        onSubmit(formData);
        onClose();
    };

    const isEdit = !!initialData;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Teaching Assignment' : 'Create Teaching Assignment'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Faculty</InputLabel>
                            <Select name="faculty" value={formData.faculty} label="Faculty" onChange={handleChange}>
                                {faculty.map(f => <MenuItem key={f._id} value={f._id}>{f.name} ({f.userId})</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Subject</InputLabel>
                            <Select name="subject" value={formData.subject} label="Subject" onChange={handleChange}>
                                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Class</InputLabel>
                            <Select name="classId" value={formData.classId} label="Class" onChange={handleChange}>
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name} ({c.branch} - Sem {c.semester})</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Feedback Period</InputLabel>
                            <Select name="feedbackPeriod" value={formData.feedbackPeriod} label="Feedback Period" onChange={handleChange}>
                                {feedbackPeriods.map(p => <MenuItem key={p._id} value={p._id}>{p.name} ({p.year})</MenuItem>)}
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

export default AssignmentFormDialog;
