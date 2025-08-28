// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Loader2 } from "lucide-react";

// const CandidateRanking = () => {
//   const [jobs, setJobs] = useState([]);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch jobs
//   useEffect(() => {
//     axios.get("http://localhost:5000/api/jobs")
//       .then(res => setJobs(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   // Fetch ranked candidates when job changes
//   useEffect(() => {
//     if (!selectedJob) return;
//     setLoading(true);
//     axios.get(`http://localhost:5000/api/rank/${selectedJob}`)
//       .then(res => setCandidates(res.data))
//       .catch(err => console.error(err))
//       .finally(() => setLoading(false));
//   }, [selectedJob]);

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center">Candidate Ranking System</h1>

//       {/* Job Selector */}
//       <div className="mb-6 flex justify-center">
//         <Select onValueChange={setSelectedJob}>
//           <SelectTrigger className="w-72">
//             <SelectValue placeholder="Select a job offer" />
//           </SelectTrigger>
//           <SelectContent>
//             {jobs.map(job => (
//               <SelectItem key={job.id} value={job.id.toString()}>
//                 {job.title}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Candidates List */}
//       <Card className="shadow-lg rounded-2xl">
//         <CardContent className="p-6">
//           {loading ? (
//             <div className="flex justify-center items-center h-32">
//               <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
//               <span className="ml-2 text-gray-600">Loading candidates...</span>
//             </div>
//           ) : candidates.length === 0 ? (
//             <p className="text-center text-gray-500">No candidates found for this job.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 text-left">
//                     <th className="p-3 border-b">Rank</th>
//                     <th className="p-3 border-b">Name</th>
//                     <th className="p-3 border-b">Skills</th>
//                     <th className="p-3 border-b text-center">Match %</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {candidates.map((c, index) => (
//                     <tr key={c.id} className="hover:bg-gray-50 transition">
//                       <td className="p-3 border-b">{index + 1}</td>
//                       <td className="p-3 border-b font-medium">{c.name}</td>
//                       <td className="p-3 border-b">{c.skills.join(", ")}</td>
//                       <td className="p-3 border-b text-center font-semibold text-blue-600">
//                         {c.score}%
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CandidateRanking;
