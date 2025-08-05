"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAllExams, getExamResults, roundIELTSBand } from "@/lib/firestore";
import { useMemo } from "react";

const tabs = ["total", "listening", "reading", "writing", "speaking"];

export default function Leaderboard() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examResults, setExamResults] = useState([]);
  const [overallResults, setOverallResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const examsList = await getAllExams();
        setExams(examsList);
        if (examsList.length > 0) {
          const currentExam = examsList.find(e => e.isCurrent) || examsList[0];
          setSelectedExamId(currentExam.id);
          // Per-exam leaderboard
          try {
            const perExam = await getExamResults(currentExam.id);
            setExamResults(perExam);
          } catch (examErr) {
            console.error("Error loading per-exam results:", examErr);
            setExamResults([]);
          }
          // Overall leaderboard
          const allResults = [];
          for (const exam of examsList) {
            try {
              const results = await getExamResults(exam.id);
              for (const r of results) {
                let user = allResults.find(u => u.userId === r.userId);
                if (!user) {
                  user = { userId: r.userId, name: r.name, photo: r.photo, scores: [], count: 0 };
                  allResults.push(user);
                }
                // Average all available scores
                ["listening", "reading", "writing", "speaking"].forEach(skill => {
                  if (r[skill] !== undefined && r[skill] !== null && r[skill] !== "") {
                    if (!user[skill]) user[skill] = 0;
                    user[skill] += Number(r[skill]);
                  }
                });
                user.count++;
              }
            } catch (examErr) {
              console.error(`Error loading results for exam ${exam.id}:`, examErr);
              // Continue with other exams
            }
          }
          // Calculate averages
          allResults.forEach(u => {
            ["listening", "reading", "writing", "speaking"].forEach(skill => {
              if (u[skill]) u[skill] = roundIELTSBand(u[skill] / u.count);
            });
            const total = (["listening", "reading", "writing", "speaking"].reduce((a, b) => a + (u[b] || 0), 0)) / 4;
            u.total = roundIELTSBand(total);
          });
          setOverallResults(allResults.sort((a, b) => b.total - a.total));
        } else {
          setOverallResults([]);
          setExamResults([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard");
      }
        setLoading(false);
    }
    fetchData();
  }, []);

  // When exam selection changes, update per-exam leaderboard
  useEffect(() => {
    async function fetchExamResults() {
      if (!selectedExamId) return;
      setLoading(true);
      try {
        const perExam = await getExamResults(selectedExamId);
        setExamResults(perExam);
        setError(null);
      } catch (err) {
        console.error("Error loading exam results:", err);
        setError("Failed to load exam leaderboard");
        setExamResults([]);
      }
      setLoading(false);
    }
    fetchExamResults();
  }, [selectedExamId]);

  if (loading) return (
    <div className="mt-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading leaderboards...</span>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="mt-6">
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
    </div>
  );

  return (
    <div className="mt-8 space-y-8">
      {/* Overall Leaderboard */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overall Leaderboard
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Listening</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Reading</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Writing</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Speaking</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overallResults.map((user, idx) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                          idx === 1 ? 'bg-gray-100 text-gray-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photo && (
                          <img src={user.photo} alt="avatar" className="w-8 h-8 rounded-full mr-3 border-2 border-gray-200" onError={e => { e.target.style.display = 'none'; }} />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name || "Anonymous"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">{user.listening?.toFixed(2) ?? '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">{user.reading?.toFixed(2) ?? '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">{user.writing?.toFixed(2) ?? '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">{user.speaking?.toFixed(2) ?? '-'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                          {user.total ?? '-'}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Per-Exam Leaderboard */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Per-Exam Leaderboard
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam:</label>
            <select 
              value={selectedExamId} 
              onChange={e => setSelectedExamId(e.target.value)} 
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.startDate} to {exam.endDate})
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Listening</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Reading</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Writing</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Speaking</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examResults.map((user, idx) => {
                  const scores = [user.listening, user.reading, user.writing, user.speaking]
                    .filter(v => v !== undefined && v !== null && v !== "")
                    .map(score => parseFloat(score))
                    .filter(score => !isNaN(score));
                  const totalBand = scores.length === 4 ? roundIELTSBand(scores.reduce((a, b) => a + b, 0) / 4) : null;
                  return (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {idx + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
              {user.photo && (
                            <img src={user.photo} alt="avatar" className="w-8 h-8 rounded-full mr-3 border-2 border-gray-200" onError={e => { e.target.style.display = 'none'; }} />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || "Anonymous"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{user.listening ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{user.reading ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{user.writing ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-medium">{user.speaking ?? '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
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
    </div>
  );
}
