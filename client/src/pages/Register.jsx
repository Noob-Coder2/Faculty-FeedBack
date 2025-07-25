// src/pages/Register.jsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'faculty'], { message: 'Role must be student or faculty' }),
  branch: z
    .string()
    .optional()
    .refine(
      (val) => (val ? ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'].includes(val) : true),
      { message: 'Invalid branch' }
    ),
  semester: z.number().min(1, 'Semester must be at least 1').max(8, 'Semester must not exceed 8').optional(),
  section: z
    .string()
    .optional()
    .refine((val) => (val ? ['A', 'B', 'C'].includes(val) : true), { message: 'Invalid section' }),
  admissionYear: z
    .number()
    .min(2000, 'Admission year must be at least 2000')
    .max(new Date().getFullYear(), `Admission year cannot be in the future`)
    .optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningYear: z
    .number()
    .min(1900, 'Joining year must be at least 1900')
    .max(new Date().getFullYear(), `Joining year cannot be in the future`)
    .optional(),
});

function Register() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: '',
      name: '',
      email: '',
      password: '',
      role: '',
      branch: '',
      semester: '',
      section: '',
      admissionYear: '',
      department: '',
      designation: '',
      joiningYear: '',
    },
  });
  const role = watch('role');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Add validation before submission
  const onSubmit = async (data) => {
    try {
      if (!data.role) {
        throw new Error('Role selection is required');
      }

      if (data.role === 'student' && !data.branch) {
        throw new Error('Branch is required for students');
      }

      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === '' ? undefined : value])
      );
      const response = await register(cleanedData);
      await dispatch(loginUser({ userId: data.userId, password: data.password })).unwrap();
      navigate(`/${data.role}-dashboard`);
    } catch (err) {
      console.error('Registration error:', err.message);
      // Optionally show a toast notification here
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="User ID"
              fullWidth
              margin="normal"
              error={!!errors.userId}
              helperText={errors.userId?.message}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Role"
              fullWidth
              margin="normal"
              error={!!errors.role}
              helperText={errors.role?.message}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </TextField>
          )}
        />
        {role === 'student' && (
          <>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Branch"
                  fullWidth
                  margin="normal"
                  error={!!errors.branch}
                  helperText={errors.branch?.message}
                >
                  {['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'].map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="semester"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Semester"
                  fullWidth
                  margin="normal"
                  error={!!errors.semester}
                  helperText={errors.semester?.message}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                />
              )}
            />
            <Controller
              name="section"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Section"
                  fullWidth
                  margin="normal"
                  error={!!errors.section}
                  helperText={errors.section?.message}
                >
                  {['A', 'B', 'C'].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="admissionYear"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Admission Year"
                  fullWidth
                  margin="normal"
                  error={!!errors.admissionYear}
                  helperText={errors.admissionYear?.message}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                />
              )}
            />
          </>
        )}
        {role === 'faculty' && (
          <>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  fullWidth
                  margin="normal"
                  error={!!errors.department}
                  helperText={errors.department?.message}
                />
              )}
            />
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Designation"
                  fullWidth
                  margin="normal"
                  error={!!errors.designation}
                  helperText={errors.designation?.message}
                />
              )}
            />
            <Controller
              name="joiningYear"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Joining Year"
                  fullWidth
                  margin="normal"
                  error={!!errors.joiningYear}
                  helperText={errors.joiningYear?.message}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                />
              )}
            />
          </>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Box>
  );
}

export default Register;