// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Chip,
// } from "@mui/material";

// const jobs = [
//   {
//     id: 1,
//     title: "Frontend Developer",
//     description: "We are looking for a React.js developer to build modern UIs.",
//     skills: ["React.js", "JavaScript", "HTML", "CSS", "REST APIs"],
//   },
//   {
//     id: 2,
//     title: "Backend Developer",
//     description: "Seeking a Node.js backend engineer to design scalable APIs.",
//     skills: ["Node.js", "Express", "MySQL", "Docker"],
//   },
//   {
//     id: 3,
//     title: "Data Scientist",
//     description: "Analyze data and build machine learning models.",
//     skills: ["Python", "TensorFlow", "Pandas", "SQL"],
//   },
// ];

const JobPositions = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    // <Box sx={{ display: "flex", gap: 3, mt: "64px", p: 3 }}>
    //   {/* Left side - Job List */}
    //   <Paper sx={{ width: "35%", p: 2 }}>
    //     <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
    //       Job Positions
    //     </Typography>
    //     <List>
    //       {jobs.map((job) => (
    //         <React.Fragment key={job.id}>
    //           <ListItem button onClick={() => setSelectedJob(job)}>
    //             <ListItemText
    //               primary={job.title}
    //               secondary={job.skills.slice(0, 3).join(", ") + "..."}
    //             />
    //           </ListItem>
    //           <Divider />
    //         </React.Fragment>
    //       ))}
    //     </List>
    //   </Paper>

    //   {/* Right side - Job Details */}
    //   <Paper sx={{ flexGrow: 1, p: 3 }}>
    //     {selectedJob ? (
    //       <>
    //         <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
    //           {selectedJob.title}
    //         </Typography>
    //         <Typography variant="body1" sx={{ mb: 2 }}>
    //           {selectedJob.description}
    //         </Typography>
    //         <Typography variant="h6" sx={{ mb: 1 }}>
    //           Required Skills
    //         </Typography>
    //         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
    //           {selectedJob.skills.map((skill, i) => (
    //             <Chip key={i} label={skill} color="primary" variant="outlined" />
    //           ))}
    //         </Box>
    //       </>
    //     ) : (
    //       <Typography>Select a job from the list to see details</Typography>
    //     )}
    //   </Paper>
    // </Box>
    <p>
      achraf bayoudh?
    </p>
  );
};

export default JobPositions;
