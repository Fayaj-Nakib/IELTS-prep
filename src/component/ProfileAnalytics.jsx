// ✅ ProfileAnalytics.jsx
"use client";

import { useEffect, useState } from "react";
import { getUserExamResults, roundIELTSBand } from "@/lib/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const SKILLS = ["listening", "reading", "writing", "speaking"];
const WEAKNESS_THRESHOLD = 6;

export default function ProfileAnalytics({ user }) {
  const [examHistory, setExamHistory] = useState([]);
  const [averages, setAverages] = useState({});
  const [improvements, setImprovements] = useState([]);
  const [consistency, setConsistency] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchExamHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const results = await getUserExamResults(user.uid);
        setExamHistory(results);
        
        // Calculate analytics from exam results
        if (results.length > 0) {
          const skillAverages = {};
          const areasForImprovement = [];
          
        SKILLS.forEach(skill => {
            const values = results
              .map(r => r[skill])
              .filter(v => v !== undefined && v !== null && v !== "");
            
          if (values.length) {
            const avg = values.reduce((a, b) => a + Number(b), 0) / values.length;
            skillAverages[skill] = avg;
              
              // Check if this skill needs improvement
              if (avg < WEAKNESS_THRESHOLD) {
                areasForImprovement.push({
                  skill: skill,
                  avg: avg
                });
              }
            } else {
              skillAverages[skill] = null;
            }
          });
          
        setAverages(skillAverages);
          setImprovements(areasForImprovement);
          setConsistency(results.length);
        }
      } catch (err) {
        console.error("Error fetching exam history:", err);
        setError("Failed to load exam history");
      } finally {
        setLoading(false);
      }
    };

    fetchExamHistory();
  }, [user]);

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading exam history...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    </div>
  );

  if (!examHistory.length) return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Exam History
        </h2>
      </div>
      <div className="p-6">
        <p className="text-gray-500 text-center py-8">No exam history available yet. Complete your first exam to see your progress!</p>
      </div>
    </div>
  );

  // Prepare data for chart
  const chartData = examHistory.map((exam, index) => ({
    exam: exam.exam?.name || `Exam ${index + 1}`,
    listening: exam.listening,
    reading: exam.reading,
    writing: exam.writing,
    speaking: exam.speaking,
  }));

  // Calculate total band with proper IELTS rounding
  const calculateTotalBand = (exam) => {
    const scores = [exam.listening, exam.reading, exam.writing, exam.speaking]
      .filter(v => v !== undefined && v !== null && v !== "")
      .map(score => parseFloat(score))
      .filter(score => !isNaN(score));
    
    if (scores.length === 0) return null;
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return roundIELTSBand(average);
  };

  // Weakness detection
  const weakSkills = SKILLS.filter(skill => averages[skill] !== null && averages[skill] < WEAKNESS_THRESHOLD);

  return (
    <div className="space-y-8">
      {/* Exam History Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Your Exam History
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Listening</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Reading</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Writing</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Speaking</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examHistory.map((exam, idx) => {
                  const totalBand = calculateTotalBand(exam);
                  return (
                    <tr key={exam.examId} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{exam.exam?.name || `Exam ${idx + 1}`}</div>
                          <div className="text-sm text-gray-500">{exam.exam?.startDate} to {exam.exam?.endDate}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{exam.listening ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{exam.reading ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{exam.writing ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{exam.speaking ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800">
                          {totalBand !== null ? totalBand : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Analytics</h2>
        </div>
        <div className="p-6 space-y-8">
          {/* Row 1: Total Band Chart + Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Total Band Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Band Score Progress</h3>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-md font-medium text-purple-600 mb-3">Total Band</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData.map(exam => ({
                    ...exam,
                    totalBand: calculateTotalBand(exam)
                  }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exam" />
            <YAxis domain={[0, 9]} tickCount={10} />
            <Tooltip />
              <Line
                type="monotone"
                      dataKey="totalBand"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                connectNulls
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
            </div>

            {/* Column 2: Performance Summary + Areas for Improvement */}
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="bg-white p-6 rounded-xl border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  {Object.entries(averages).map(([skill, avg]) => (
                    <div key={skill} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()} Average:</span>
                      <span className="font-bold text-gray-800">{avg}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">Consistency (Std Dev):</span>
                    <span className="font-bold text-gray-800">{consistency}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">Total Exams:</span>
                    <span className="font-bold text-gray-800">{chartData.length}</span>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white p-6 rounded-xl border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                {improvements.length === 0 ? (
                  <p className="text-gray-600">Great job! No specific areas for improvement identified based on current scores.</p>
                ) : (
                  <ul className="space-y-2">
                    {improvements.map((item, index) => (
                      <li key={index} className="flex items-center text-red-600 font-medium">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                        {item.skill.replace(/([A-Z])/g, ' $1').trim()} (Avg: {item.avg.toFixed(2)})
              </li>
            ))}
          </ul>
        )}
      </div>
            </div>
          </div>

          {/* Row 2: Listening + Reading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Listening Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-md font-medium text-blue-600 mb-3">Listening</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis domain={[0, 9]} tickCount={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="listening"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Column 2: Reading Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-md font-medium text-green-600 mb-3">Reading</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis domain={[0, 9]} tickCount={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reading"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Writing + Speaking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Writing Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-md font-medium text-orange-600 mb-3">Writing</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis domain={[0, 9]} tickCount={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="writing"
                    stroke="#f59e42"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#f59e42" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Column 2: Speaking Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-md font-medium text-red-600 mb-3">Speaking</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis domain={[0, 9]} tickCount={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="speaking"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#ef4444" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}