"use client";

import { useEffect, useState } from "react";
import { getCurrentExam, setCurrentExam, saveUserExamResult, getUserExamResults } from "@/lib/firestore";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ADMIN_UID = "nLcWDF6a00RloHQFHmC2m6SEiCi1";

export default function DailyTaskTracker({ user }) {
  const [exam, setExam] = useState({ name: "", link: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState({ listening: "", reading: "", writing: "", speaking: "" });
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.uid === ADMIN_UID;

  useEffect(() => {
    async function fetchExam() {
      try {
        const examData = await getCurrentExam();
        if (examData) setExam(examData);
        if (!isAdmin) {
          // Load member's previous result for the current exam if any
          if (examData) {
            const userResults = await getUserExamResults(user.uid);
            const currentResult = userResults.find(r => r.examId === examData.id);
            if (currentResult) {
              setResult({
                listening: currentResult.listening || "",
                reading: currentResult.reading || "",
                writing: currentResult.writing || "",
                speaking: currentResult.speaking || ""
              });
            }
          }
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load exam info");
        setLoading(false);
      }
    }
    fetchExam();
  }, [user, isAdmin]);

  // Admin handlers
  const handleExamChange = (e) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Create new exam document with startDate and endDate
      const docRef = await addDoc(collection(db, "exams"), {
        name: exam.name,
        link: exam.link,
        startDate: exam.startDate,
        endDate: exam.endDate,
        isCurrent: true,
      });
      // Unset isCurrent on all other exams
      await setCurrentExam(docRef.id);
      setError(null);
    } catch {
      setError("Failed to save exam info");
    }
    setSaving(false);
  };

  // Member handlers
  const handleResultChange = (e) => {
    setResult({ ...result, [e.target.name]: e.target.value });
  };
  const handleResultSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!exam.id) {
        setError("No current exam found");
        return;
      }
      await saveUserExamResult(exam.id, user.uid, result, user);
      setError(null);
    } catch {
      setError("Failed to save your result");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading exam data...</span>
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

  if (isAdmin) {
    // Admin view: set exam name, link, and date range
  return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Exam
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleExamSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name</label>
        <input
          type="text"
                name="name"
                value={exam.name}
                onChange={handleExamChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. IELTS Mock Test 1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Link</label>
              <input
                type="url"
                name="link"
                value={exam.link}
                onChange={handleExamChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. https://exam-link.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={exam.startDate}
                  onChange={handleExamChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={exam.endDate}
                  onChange={handleExamChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
        />
      </div>
            </div>
          <button
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg" 
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Exam...
                </div>
              ) : (
                'Create Exam'
              )}
          </button>
          </form>
        </div>
      </div>
    );
  }

  // Member view: show exam info and result input
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Current Exam
        </h2>
      </div>
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-blue-800">Exam Name:</span>
              <p className="text-blue-900 font-semibold">{exam.name || <span className="text-gray-500">No exam set</span>}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-800">Exam Link:</span>
              {exam.link ? (
                <a href={exam.link} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline break-all">
                  {exam.link}
                </a>
              ) : (
                <span className="text-gray-500">No link set</span>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-blue-800">Exam Period:</span>
              <p className="text-blue-900">
                {exam.startDate && exam.endDate ? (
                  `${exam.startDate} to ${exam.endDate}`
                ) : (
                  <span className="text-gray-500">No period set</span>
                )}
              </p>
            </div>
          </div>
      </div>

        <form onSubmit={handleResultSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listening</label>
          <input
            type="number"
                    name="listening"
                    value={result.listening}
                    onChange={handleResultChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 8"
            min={0}
                    max={9}
                    step={0.5}
                  />
        </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reading</label>
          <input
            type="number"
                    name="reading"
                    value={result.reading}
                    onChange={handleResultChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 8"
            min={0}
                    max={9}
                    step={0.5}
                  />
                </div>
        </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Writing</label>
          <input
            type="number"
                    name="writing"
                    value={result.writing}
                    onChange={handleResultChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 7"
            min={0}
            max={9}
            step={0.5}
          />
        </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaking</label>
          <input
            type="number"
                    name="speaking"
                    value={result.speaking}
                    onChange={handleResultChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 7"
            min={0}
            max={9}
            step={0.5}
          />
        </div>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg" 
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting Result...
              </div>
            ) : (
              'Submit Result'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
