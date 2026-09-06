import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, 
  Trash2, 
  Info,
  X,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

const GRADE_POINTS = {
  'A': 4.00,
  'A-': 3.66,
  'B+': 3.33,
  'B': 3.00,
  'B-': 2.66,
  'C+': 2.33,
  'C': 2.00,
  'C-': 1.66,
  'D+': 1.33,
  'D': 1.00,
  'F': 0.00,
};

const getGradeFromMarks = (mark) => {
  mark = Math.round(mark);
  if (mark >= 85) return ['A', 4.00];
  if (mark >= 80) return ['A-', 3.66];
  if (mark >= 75) return ['B+', 3.33];
  if (mark >= 71) return ['B', 3.00];
  if (mark >= 68) return ['B-', 2.66];
  if (mark >= 64) return ['C+', 2.33];
  if (mark >= 61) return ['C', 2.00];
  if (mark >= 58) return ['C-', 1.66];
  if (mark >= 54) return ['D+', 1.33];
  if (mark >= 50) return ['D', 1.00];
  return ['F', 0.00];
};

const getGradeColor = (grade) => {
  if (grade.startsWith('A')) return 'text-emerald-600 font-semibold';
  if (grade.startsWith('B')) return 'text-blue-600 font-semibold';
  if (grade.startsWith('C')) return 'text-amber-600 font-semibold';
  if (grade.startsWith('D')) return 'text-orange-600 font-semibold';
  return 'text-red-600 font-semibold';
};

const getGradeBadgeColor = (grade) => {
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (grade.startsWith('D')) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

const getSemesterNumber = (semesterString) => {
  if (!semesterString) return '1';
  const match = semesterString.match(/(\d+)/);
  return match ? match[1] : '1';
};

const STORAGE_KEY = 'gpa_calculator_data';

export default function GpaCalculatorPage() {
  const { user } = useSelector((state) => state.auth);
  const userSemester = getSemesterNumber(user?.semester);
  
  const loadInitialState = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          subjects: parsed.subjects?.length > 0 ? parsed.subjects : [{ id: '1', name: '', credits: 3, marks: '' }],
          semester: parsed.semester || userSemester,
          prevGpa: parsed.prevGpa || '',
        };
      }
    } catch (err) {
      console.warn('Failed to load GPA data from localStorage', err);
    }
    return {
      subjects: [{ id: '1', name: '', credits: 3, marks: '' }],
      semester: userSemester,
      prevGpa: '',
    };
  };

  const initialState = loadInitialState();
  
  const [subjects, setSubjects] = useState(initialState.subjects);
  const [semester, setSemester] = useState(initialState.semester);
  const [prevGpa, setPrevGpa] = useState(initialState.prevGpa);
  const [gpa, setGpa] = useState('0.00');
  const [cgpa, setCgpa] = useState('0.00');
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalGradePoints, setTotalGradePoints] = useState(0);
  const [overallGrade, setOverallGrade] = useState('-');
  const [showModal, setShowModal] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      subjects,
      semester,
      prevGpa,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.warn('Failed to save GPA data to localStorage', err);
    }
  }, [subjects, semester, prevGpa]);

  const calculateGPA = () => {
    let totalCreditsSum = 0;
    let totalPoints = 0;
    
    subjects.forEach(subject => {
      const credits = parseFloat(subject.credits) || 0;
      const marks = parseFloat(subject.marks);
      
      if (!isNaN(marks) && marks >= 0) {
        const [grade, gp] = getGradeFromMarks(marks);
        totalCreditsSum += credits;
        totalPoints += credits * gp;
      }
    });
    
    const calculatedGpa = totalCreditsSum > 0 ? totalPoints / totalCreditsSum : 0;
    setGpa(calculatedGpa.toFixed(2));
    setTotalCredits(totalCreditsSum);
    setTotalGradePoints(totalPoints);
    
    // Determine overall grade based on GPA
    let grade = '-';
    if (calculatedGpa >= 3.66) grade = 'A';
    else if (calculatedGpa >= 3.33) grade = 'B+';
    else if (calculatedGpa >= 3.00) grade = 'B';
    else if (calculatedGpa >= 2.66) grade = 'B-';
    else if (calculatedGpa >= 2.33) grade = 'C+';
    else if (calculatedGpa >= 2.00) grade = 'C';
    else if (calculatedGpa >= 1.66) grade = 'C-';
    else if (calculatedGpa >= 1.33) grade = 'D+';
    else if (calculatedGpa >= 1.00) grade = 'D';
    else if (calculatedGpa > 0) grade = 'F';
    setOverallGrade(grade);
    
    const semNum = parseInt(semester, 10);
    if (semNum === 1) {
      setCgpa(calculatedGpa.toFixed(2));
    } else {
      const prev = parseFloat(prevGpa);
      if (!isNaN(prev) && prev >= 0 && prev <= 4) {
        const prevSemCount = semNum - 1;
        const calculatedCgpa = (prev * prevSemCount + calculatedGpa) / semNum;
        setCgpa(Math.min(4.00, Math.max(0, calculatedCgpa)).toFixed(2));
      } else {
        setCgpa(calculatedGpa.toFixed(2));
      }
    }
  };

  useEffect(() => {
    calculateGPA();
  }, [subjects, semester, prevGpa]);

  const addRow = () => {
    const newSubject = {
      id: Date.now().toString(),
      name: '',
      credits: 3,
      marks: ''
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeRow = (id) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects(
      subjects.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const resetAll = () => {
    const resetSubjects = [
      { id: Date.now().toString(), name: '', credits: 3, marks: '' }
    ];
    setSubjects(resetSubjects);
    setPrevGpa('');
    setSemester(userSemester);
    setGpa('0.00');
    setCgpa('0.00');
    setTotalCredits(0);
    setTotalGradePoints(0);
    setOverallGrade('-');
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear GPA data from localStorage', err);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Semester & Previous GPA */}
      <div className="attmark-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
          >
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Previous Semester GPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="e.g. 3.2"
            value={prevGpa}
            onChange={(e) => setPrevGpa(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={calculateGPA}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Update CGPA
          </button>
        </div>
      </div>

      {/* Subject Table */}
      <div className="attmark-card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-heading text-base font-bold text-slate-900">
              Current Semester Course Grades
            </h2>
            <p className="text-xs text-slate-500">
              Enter course titles, credit hours, and marks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Reset All"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={addRow}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5 w-40">Credit Hours</th>
                <th className="p-3.5 text-center">Marks</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5 text-center">Grade Points</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject) => {
                const marks = parseFloat(subject.marks);
                const [grade, gp] = !isNaN(marks) && marks >= 0 ? getGradeFromMarks(marks) : ['-', 0];
                const gradePoints = grade !== '-' ? (gp * subject.credits).toFixed(2) : '0.00';
                
                return (
                  <tr key={subject.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Subject name"
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-3 w-40">
                      <select
                        value={subject.credits}
                        onChange={(e) => updateSubject(subject.id, 'credits', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                      >
                        <option value={1}>1 Credit</option>
                        <option value={2}>2 Credits</option>
                        <option value={3}>3 Credits</option>
                        <option value={4}>4 Credits</option>
                        <option value={5}>5 Credits</option>
                        <option value={6}>6 Credits</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          value={subject.marks}
                          onChange={(e) => updateSubject(subject.id, 'marks', e.target.value)}
                          className="w-24 px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none text-center"
                        />
                      </div>
                    </td>
                    <td className={`p-3 text-center text-sm ${grade !== '-' ? getGradeColor(grade) : 'text-slate-400'}`}>
                      {grade}
                    </td>
                    <td className="p-3 text-center text-sm font-semibold text-slate-800">
                      {gradePoints}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => removeRow(subject.id)}
                        disabled={subjects.length <= 1}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results - Updated with Grade Badge */}
      <div className="attmark-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 tile-green rounded-xl text-center">
            <div className="text-xs font-semibold text-emerald-700 mb-1">📊 Semester GPA</div>
            <div className="text-4xl font-extrabold text-emerald-800">{gpa}</div>
          </div>
          <div className="p-4 tile-blue rounded-xl text-center">
            <div className="text-xs font-semibold text-blue-700 mb-1">📈 Cumulative CGPA</div>
            <div className="text-4xl font-extrabold text-blue-800">{cgpa}</div>
          </div>
          <div className="p-4 tile-purple rounded-xl text-center">
            <div className="text-xs font-semibold text-purple-700 mb-1">Overall Grade</div>
            <div className={`text-4xl font-extrabold ${overallGrade !== '-' ? getGradeColor(overallGrade) : 'text-slate-300'}`}>
              {overallGrade}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info Icon */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center z-40"
        title="Grading Policy"
      >
        <Info className="w-6 h-6" />
      </button>

      {/* Grading Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-bold text-slate-900 mb-5 text-center">📋 Grading Policy</h2>
            
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Marks</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">85+</td>
                  <td className="p-3 text-center font-semibold text-emerald-600">A</td>
                  <td className="p-3 text-center">4.00</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">80-84</td>
                  <td className="p-3 text-center font-semibold text-emerald-600">A-</td>
                  <td className="p-3 text-center">3.66</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">75-79</td>
                  <td className="p-3 text-center font-semibold text-blue-600">B+</td>
                  <td className="p-3 text-center">3.33</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">71-74</td>
                  <td className="p-3 text-center font-semibold text-blue-600">B</td>
                  <td className="p-3 text-center">3.00</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">68-70</td>
                  <td className="p-3 text-center font-semibold text-blue-600">B-</td>
                  <td className="p-3 text-center">2.66</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">64-67</td>
                  <td className="p-3 text-center font-semibold text-amber-600">C+</td>
                  <td className="p-3 text-center">2.33</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">61-63</td>
                  <td className="p-3 text-center font-semibold text-amber-600">C</td>
                  <td className="p-3 text-center">2.00</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">58-60</td>
                  <td className="p-3 text-center font-semibold text-amber-600">C-</td>
                  <td className="p-3 text-center">1.66</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">54-57</td>
                  <td className="p-3 text-center font-semibold text-orange-600">D+</td>
                  <td className="p-3 text-center">1.33</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">50-53</td>
                  <td className="p-3 text-center font-semibold text-orange-600">D</td>
                  <td className="p-3 text-center">1.00</td>
                </tr>
                <tr>
                  <td className="p-3">&lt;50</td>
                  <td className="p-3 text-center font-semibold text-red-600">F</td>
                  <td className="p-3 text-center">0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}