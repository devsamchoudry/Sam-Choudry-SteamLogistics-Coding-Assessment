import React, { useState, useEffect } from 'react';
import { Button, Snackbar, CircularProgress, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import create from 'zustand';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the validation schema using Zod
const schema = z.object({
  fieldName: z.string().min(1, 'Field Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  age: z.preprocess((val) => parseInt(val, 10), z.number().int().positive('Age must be a positive integer').min(18, 'Age must be at least 18')),
});

// Zustand store for managing form state
const useFormStore = create((set) => ({
  changesCount: 0,
  validationErrors: [],
  setChangesCount: (count) => set({ changesCount: count }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
}));

const FormSubmitComponent = ({ onSubmit }) => {
  const { control, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(schema),
  });
  const [status, setStatus] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { changesCount, setChangesCount, validationErrors, setValidationErrors } = useFormStore();

  useEffect(() => {
    setChangesCount(Object.keys(dirtyFields).length);
  }, [dirtyFields, setChangesCount]);

  const handleFormSubmit = async (data) => {
    setStatus('submitting');
    try {
      await onSubmit(data);
      setStatus('success');
      setChangesCount(0);
      setValidationErrors([]);
      setOpenSnackbar(true);
    } catch (error) {
      setStatus('error');
      setValidationErrors(error.validationErrors);
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    reset();
    setChangesCount(0);
    setValidationErrors([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Form Status</Typography>
        {status === 'success' && <CheckCircleIcon color="success" />}
        {status === 'error' && <ErrorIcon color="error" />}
        {status === 'submitting' && <CircularProgress size={24} />}
      </Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {changesCount === 0 && 'No changes'}
        {changesCount > 0 && `Changes count: ${changesCount}`}
      </Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Controller
          name="fieldName"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Field Name"
              variant="outlined"
              fullWidth
              error={!!errors.fieldName}
              helperText={errors.fieldName ? errors.fieldName.message : ''}
              sx={{ mb: 2 }}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              variant="outlined"
              fullWidth
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
              sx={{ mb: 2 }}
            />
          )}
        />
        <Controller
          name="age"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Age"
              type="number"
              variant="outlined"
              fullWidth
              error={!!errors.age}
              helperText={errors.age ? errors.age.message : ''}
              sx={{ mb: 2 }}
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={status === 'submitting' || Object.keys(errors).length > 0}>
            Submit
          </Button>
          <Button type="button" variant="outlined" onClick={handleReset} disabled={status === 'submitting'}>
            Reset
          </Button>
        </Box>
      </form>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={status === 'error' ? 'error' : 'success'}>
          {status === 'error' ? (validationErrors.length ? validationErrors.join(', ') : 'Unknown error') : 'Form submitted successfully!'}
        </Alert>
      </Snackbar>
      {Object.keys(errors).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="error">
            Validation Errors: <Button onClick={handleOpenDialog}>{Object.keys(errors).length}</Button>
          </Typography>
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Validation Errors</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {Object.values(errors).map((error, index) => (
              <Typography key={index} variant="body2" color="error">
                {error.message}
              </Typography>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Usage example
const App = () => {
  const handleSubmit = async (data) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.fieldName === 'error') {
          reject({ validationErrors: ['Field name is invalid'] });
        } else {
          resolve();
        }
      }, 1000);
    });
  };

  return <FormSubmitComponent onSubmit={handleSubmit} />;
};

export default App;
