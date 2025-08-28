import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudUpload, Description, Delete,
  Home, People, Assignment, Settings,
  CheckCircle
} from '@mui/icons-material';
import { 
  Button, CircularProgress, Box, Typography, Paper, 
  List, ListItem, ListItemIcon, ListItemText, IconButton,
  Drawer, Toolbar, AppBar, 
  useTheme, Chip, Avatar, LinearProgress, Divider, Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Routes, Route, useNavigate, useLocation, data } from 'react-router-dom';
import CornerLogoImg from '../assets/logo.jpeg';
// fixed corner logo shown on all pages
const FixedCornerLogo = ({ src = CornerLogoImg, size = 56, alt = 'Brand' }) => (
  <Box
    sx={{
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: (theme) => theme.zIndex.tooltip + 1,
      opacity: 0.9,
      pointerEvents: 'none',
      borderRadius: '50%', 
      overflow: 'hidden', 
      backgroundColor: '#fff', 
    }}
  >
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: size,
        height: size,
        display: 'block',
        borderRadius: '50%', 
        objectFit: 'cover', 
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
      }}
      onError={() => console.error('Image failed to load:', src)}
    />
  </Box>
);

// components style
const DashboardContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
});

const Sidebar = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[2],
  '&:hover': { boxShadow: theme.shadows[4] }
}));

const Dropzone = styled('div')(({ theme, isdragactive }) => ({
  border: `2px dashed ${isdragactive === 'true' ? theme.palette.success.main : theme.palette.divider}`,
  backgroundColor: isdragactive === 'true' ? 'rgba(25, 118, 210, 0.05)' : theme.palette.background.paper,
  cursor: 'pointer',
  padding: theme.spacing(6),
  textAlign: 'center',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius
}));

const UploadButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: 600,
  letterSpacing: 0.5,
  '&:hover': { boxShadow: theme.shadows[4] }
}));



const styles1 = {
  box: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 16px 10px",
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    minWidth: 260,
    height: 360,
    overflowY: 'auto',
    alignSelf: 'flex-start',
  },
  legend: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    padding: "0 6px",
  },
  list: {
    display: "grid",
    gap: 8,
    marginTop: 6,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #f3f4f6",
    cursor: "pointer",
  },
  radio: {
    cursor: "pointer",
  },
  text: {
    fontSize: 14,
    color: "#111827",
  },
};


// job offfer ranking
const JobOfferRanking = () => {
  const [rank, setRank] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/ranking');
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRank(data);
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Failed to load ranking');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Typography variant="h4" gutterBottom>
        Job Offer Ranking
      </Typography>

      {loading && (
        <Typography variant="body1">Loading candidates…</Typography>
      )}
      {error && (
        <Typography variant="body1" color="error">{error}</Typography>
      )}

      {!loading && !error && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {rank.map((group) => (
            <Paper key={group.job_title} sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{group.job_title}</Typography>
                <Chip size="small" label={`${group.candidates.length} candidate${group.candidates.length !== 1 ? 's' : ''}`} />
              </Box>
              {!!group.required_skills?.length && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {group.required_skills.map((skill, i) => (
                    <Chip key={i} size="small" label={skill} variant="outlined" />
                  ))}
                </Box>
              )}
              <Divider sx={{ mb: 2 }} />
              {group.candidates.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No candidates yet.</Typography>
              ) : (
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {group.candidates.map((cv, idx) => (
                    <Paper key={cv.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{(cv.name || '?').trim().charAt(0).toUpperCase()}</Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              #{idx + 1} {cv.name || 'Unnamed Candidate'}
                            </Typography>
                            <Tooltip title={`${cv.score}% skill match`}>
                              <Chip label={`${cv.score}%`} color={cv.score >= 70 ? 'success' : cv.score >= 40 ? 'warning' : 'default'} />
                            </Tooltip>
                          </Box>
                          <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, Number(cv.score) || 0))} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
                          <Typography variant="caption" color="text.secondary">{cv.email || 'No email'}</Typography>
                          {!!cv.matched?.length && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {cv.matched.map((skill, i) => (
                                <Chip key={i} size="small" label={skill} variant="outlined" />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};



import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, Clock, Send, Wrench, Info, ChevronRight } from "lucide-react";



import { Link } from "react-router-dom";

const jobs = [
  { id: 1, title: "Frontend Developer", description: "We are looking for a React.js developer...", skills: ["React.js", "JavaScript", "HTML", "CSS", "REST APIs", "TypeScript", "Redux"] },
  { id: 2, title: "Backend Developer", description: "Seeking a Node.js backend engineer...", skills: ["Node.js", "Express", "MySQL", "Docker", "MongoDB", "GraphQL", "AWS"] },
  { id: 3, title: "Data Scientist", description: "Analyze data and build machine learning models...", skills: ["Python", "TensorFlow", "Pandas", "SQL", "Scikit-learn", "Jupyter", "BigQuery"] },
  { id: 4, title: "Full Stack Developer", description: "Build end-to-end web applications...", skills: ["React.js", "Node.js", "MongoDB", "Express", "JavaScript", "Git", "CI/CD"] },
  { id: 5, title: "DevOps Engineer", description: "Automate infrastructure and deployment pipelines...", skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform", "Ansible", "Linux"] },
  { id: 6, title: "UI/UX Designer", description: "Create intuitive user interfaces...", skills: ["Figma", "Adobe XD", "Sketch", "HTML/CSS", "User Research", "Prototyping", "Wireframing"] },
];

const JobPositions = () => {
  const theme = useTheme();
  const [selectedJob, setSelectedJob] = useState(jobs[0]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #ffffff 100%)',
      pt: '64px',
      pb: 4
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 4 } }}>
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}>
            Find Your Next Role
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto',
            fontWeight: 400
          }}>
            Browse through our openings and discover the opportunity that aligns with your passion and skills.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          
          
          <Box sx={{ width: { xs: '100%', lg: '35%' } }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 3,
              position: 'sticky',
              top: 80,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Assignment color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Open Positions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {jobs.map((job) => (
                  <Button
                    key={job.id}
                    variant={selectedJob?.id === job.id ? "contained" : "outlined"}
                    onClick={() => setSelectedJob(job)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      py: 2,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {job.title}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Job Details */}
          <Box sx={{ width: { xs: '100%', lg: '65%' } }}>
            {selectedJob && (
              <Paper sx={{ 
                p: 4, 
                borderRadius: 3, 
                boxShadow: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      {selectedJob.title}
                    </Typography>
                    <Chip 
                      label="Full Time" 
                      color="primary" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label="Remote" 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                  
                  <Link to="/" state={{ jobTitle: selectedJob.title }} style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: 3,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      Apply Now
                    </Button>
                  </Link>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Typography variant="body1" sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.7,
                  fontSize: '1.1rem'
                }}>
                  {selectedJob.description}
                </Typography>

                {/* Skills Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Wrench color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Required Skills
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {selectedJob.skills.map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Apply Info */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Info color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      How to Apply
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Upload your CV through our portal above, or send your resume to{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      sudachi@skillsync.com
                    </Box>{' '}
                    with the job title in the subject line. Our hiring team will reach out if your profile matches.
                  </Typography>
                </Paper>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};









// main components
const CVUpload = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState(location.state?.jobTitle || (jobs?.[0]?.title ?? ''));

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert(`${rejectedFiles.length} file(s) were rejected. Only PDF/DOCX under 10MB allowed.`);
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type.split('/')[1] || 'file',
        lastModified: new Date(file.lastModified).toLocaleDateString(),
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 50,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (id) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setAnalysisResults([]);

    try {
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i].file);
        
        formData.append('job_title', selectedJobTitle || '');

        const response = await axios.post(
          'http://localhost:5000/api/analyze',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );

        results.push({
          fileName: files[i].name,
          data: response.data
        });
      }

      setAnalysisResults(results);
      setUploadComplete(true);
      return data;

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Navigation items
  const navItems = [
    { text: 'Job Offer Ranking', icon: <Home />, path: '/JobOfferRanking' },
    { text: 'CV Upload', icon: <Assignment />, path: '/' },
    { text: 'Job Positions', icon: <Assignment />, path: '/positions' }
  ];

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'File Name', width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Description color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Box>
      )
    },
    { field: 'size', headerName: 'Size', width: 120 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'lastModified', headerName: 'Modified', width: 150 },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (params) => (
        <IconButton 
          onClick={() => removeFile(params.row.id)}
          disabled={isUploading}
          color="error"
          size="small"
        >
          <Delete fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar variant="permanent" anchor="left">
        <Toolbar sx={{ height: 64 }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, pl: 1, fontWeight: 600 }}>
            SkillSync
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(203, 74, 74, 0.16)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.24)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Sidebar>

      {/* Main */}
      <MainContent>
        <AppBar position="fixed" sx={{ width: `calc(100% - 240px)`, ml: '240px', bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
              {navItems.find(item => item.path === location.pathname)?.text || 'CV Upload Portal'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {/*select job title */}
                  <fieldset style={styles1.box}>
                    <legend style={styles1.legend}>Select a job title</legend>
                    <div style={styles1.list}>
                      {jobs.map((job) => (
                        <label key={job.id} style={styles1.item}>
                          <input
                            type="radio"
                            name="job-title"
                            value={job.title}
                            checked={selectedJobTitle === job.title}
                            onChange={() => setSelectedJobTitle(job.title)}
                            style={styles1.radio}
                          />
                          <span style={styles1.text}>{job.title}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Upload Area */}
                  <UploadArea>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Upload CVs
                    </Typography>
                    <Dropzone {...getRootProps()} isdragactive={isDragActive.toString()}>
                      <input {...getInputProps()} />
                      <CloudUpload sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6">{isDragActive ? 'Drop CVs Here' : 'Drag & Drop Files'}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Supported formats: PDF, DOCX (Max 10MB each)
                      </Typography>
                      <Button variant="outlined">Browse Files</Button>
                    </Dropzone>

                    <UploadButton
                      variant="contained"
                      onClick={handleUpload}
                      disabled={isUploading || files.length === 0 || uploadComplete}
                      startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : uploadComplete ? <CheckCircle /> : null}
                      fullWidth
                      color={uploadComplete ? 'success' : 'primary'}
                    >
                      {uploadComplete ? 'Upload Complete!' : 
                      isUploading ? `Uploading (${uploadProgress}%)` : 'Process CVs'}
                    </UploadButton>
                  </UploadArea>

                  {/* File List */}
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Selected Files ({files.length})
                    </Typography>
                    {files.length > 0 ? (
                      <DataGrid
                        autoHeight
                        rows={files}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        disableSelectionOnClick
                        components={{ Toolbar: GridToolbar }}
                      />
                    ) : (
                      <Typography>No files selected.</Typography>
                    )}
                  </Paper>
                </Box>
              </Box>

              {/* Results */}
              {error && (
                <Paper sx={{ p: 2, backgroundColor: 'error.light' }}>
                  <Typography color="error">{error}</Typography>
                </Paper>
              )}

              {analysisResults.length > 0 && (
                <Box>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Analysis Results
                    </Typography>
                    {analysisResults.map((result, index) => (
                      <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="h6">{result.fileName}</Typography>
                        <DisplayAnalysis data={result.data} />
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </Box>
          } />
          
          <Route path="/JobOfferRanking" element={<JobOfferRanking />} />
          <Route path="/positions" element={<JobPositions />} />
        </Routes>
        {/* Fixed logo across all pages (put image at public/corner-logo.png) */}
        <FixedCornerLogo />
      </MainContent>
    </DashboardContainer>
  );
};


const DisplayAnalysis = ({ data }) => (
  <Box sx={{ mt: 2 }}>
    {/* Basic Info */}
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1"><strong>{data.name || 'Name not specified'}</strong></Typography>
      <Typography color="text.secondary">{data.email || 'Email not specified'}</Typography>
      <Typography color="text.secondary">{data.phone || 'Phone not specified'}</Typography>
    </Box>
  </Box>
);

export default CVUpload;






